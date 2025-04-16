import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

def predict_stock_price(symbol):
    stock = yf.Ticker(symbol)
    df = stock.history(period="6mo")  # Get 6 months of data
    
    df['Date'] = df.index
    df['Days'] = (df['Date'] - df['Date'].min()).dt.days

    X = df[['Days']]
    y = df['Close']

    model = LinearRegression()
    model.fit(X, y)

    future_days = np.array([[df['Days'].max() + i] for i in range(1, 6)])  # Predict next 5 days
    predictions = model.predict(future_days)

    return predictions.tolist()
