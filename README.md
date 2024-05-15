
# Stock Price Prediction Model 
Trained a Machine Learning Model on a time series data of stock prices. Displayed actual and predicted stock prices using ChartJs. 


## Tech Stack

**Frontend:** React, TailwindCSS, ChartJS

**Machine Learning:** Pandas, Numpy, Keras, TensorFlow, Sckit-Learn, FastAPI, Pydantic

**External API:** Yahoo Finance


## Run Locally

Git Clone

```bash
  git clone https://github.com/ivyn-yak/stock-price.git
```
    
Install frontend dependencies

```bash
  cd frontend
  npm install
```

Start frontend locally

```bash
  npm run dev
```

Install ML model dependencies

```bash
  cd model
  pip install -r requirements.txt
```
Start ML model locally

```bash
  uvicorn app:app --reload
```


