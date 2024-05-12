import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime
from keras.models import load_model
from sklearn.preprocessing import MinMaxScaler

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Input(BaseModel):
    stock: str
    start: str
    end: str

model = load_model("./stock-model.keras")

@app.post("/")
async def predict(input: Input):
    stock = input.stock
    start = input.start
    end = input.end

    data = yf.download(stock, start, end)
    data.reset_index(inplace=True)

    date = data["Date"]
    print(date)
    date = date.dt.strftime("%Y-%m-%d")

    CONST = int(len(data) * 0.8)

    data_train = pd.DataFrame(data.Close[: CONST])
    data_test = pd.DataFrame(data.Close[CONST:])

    scaler = MinMaxScaler(feature_range=(0,1))

    pas_100_days = data_train.tail(100)
    data_test = pd.concat([pas_100_days, data_test], ignore_index= True)
    data_test_scale = scaler.fit_transform(data_test)

    date_test = date[CONST:]

    x = []
    y = []

    for i in range(100, data_test_scale.shape[0]):
        x.append(data_test_scale[i - 100: i])
        y.append(data_test_scale[i,0])

    x, y = np.array(x), np.array(y)

    print("lenght", len(date_test), len(data_test), len(x), len(y))

    y_pred = model.predict(x)

    scale = 1/scaler.scale_

    y_pred *= scale
    y *= scale

    y_pred_list = y_pred.tolist()
    y_list = y.tolist()
    date = date_test.tolist()

    return {"y_pred": y_pred_list,"y": y_list, "date": date_test}

