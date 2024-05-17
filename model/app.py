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
    past_100: str
    end: str

model = load_model("./stock-model.keras")

@app.post("/")
async def predict(input: Input):
    stock = input.stock
    start = input.start
    past_100 = input.past_100
    end = input.end

    data = yf.download(stock, past_100, end)
    data.reset_index(inplace=True)

    date = pd.to_datetime(data['Date'])
    start = pd.to_datetime(start)

    if start in date.values:
        index = date[date == start].index()
    else:
        early_dates = date[date < start]
        if not early_dates.empty:
            index = early_dates.shape[0] + 1


    date = date.dt.strftime("%Y-%m-%d")

    values = pd.DataFrame(data.Close)

    scaler = MinMaxScaler(feature_range=(0,1))

    values_scale = scaler.fit_transform(values)

    x = []
    y = []

    for i in range(index, values_scale.shape[0]):
        x.append(values_scale[i - index : i])
        y.append(values_scale[i,0])

    x, y = np.array(x), np.array(y)

    print("lenght", len(date), len(values_scale), len(x), len(y))

    y_pred = model.predict(x)

    scale = 1/scaler.scale_

    y_pred *= scale
    y *= scale

    y_pred_list = y_pred.tolist()
    y_list = y.tolist()
    # date = date.tolist()

    return {"y_pred": y_pred_list,"y": y_list, "date": date[index:]}

