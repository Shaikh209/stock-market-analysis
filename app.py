import os
import numpy as np
import pandas as pd
import yfinance as yf
import tensorflow as tf
from flask import Flask, jsonify
from flask_cors import CORS
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense

# Initialize Flask App
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# 🌍 Home Route
@app.route('/')
def home():
    return jsonify({"message": "Stock Market Analysis API Running"})


# 🔮 Predict Future Stock Prices (Next 5 Days)
def predict_future_prices(symbol):
    try:
        stock = yf.Ticker(f"{symbol}.NS")
        df = stock.history(period="2y", interval="1d")

        if df.empty:
            return {"error": f"Stock '{symbol}' data not available."}

        # Prepare data
        data = df[['Close']].values
        scaler = MinMaxScaler(feature_range=(0, 1))
        data_scaled = scaler.fit_transform(data)

        # Create sequences for LSTM
        seq_length = 60
        X, y = [], []
        for i in range(seq_length, len(data_scaled)):
            X.append(data_scaled[i - seq_length:i, 0])
            y.append(data_scaled[i, 0])

        X, y = np.array(X), np.array(y)
        X = np.reshape(X, (X.shape[0], X.shape[1], 1))

        # Model Path
        model_path = f"models/{symbol}_model.h5"

        # ✅ Load Pre-trained Model if Exists (Else Train New Model)
        if os.path.exists(model_path):
            model = load_model(model_path)
        else:
            model = Sequential([
                LSTM(units=50, return_sequences=True, input_shape=(X.shape[1], 1)),
                LSTM(units=50, return_sequences=False),
                Dense(units=25),
                Dense(units=1)
            ])
            model.compile(optimizer="adam", loss="mean_squared_error")
            model.fit(X, y, batch_size=16, epochs=5, verbose=0)
            model.save(model_path)  # ✅ Save the trained model

        # ✅ Predict next 5 days
        last_sequence = data_scaled[-seq_length:].reshape(1, seq_length, 1)
        future_predictions = []

        for _ in range(5):  # ✅ Predict 5 days in sequence
            predicted_price = model.predict(last_sequence)[0][0]
            future_predictions.append(predicted_price)
            last_sequence = np.append(last_sequence[:, 1:, :], [[[predicted_price]]], axis=1)

        # ✅ Convert predictions back to original scale
        future_predictions = scaler.inverse_transform(np.array(future_predictions).reshape(-1, 1)).flatten()

        # Generate Future Dates (Next 5 Days)
        today = pd.Timestamp.today()
        future_dates = [(today + pd.DateOffset(days=i)).strftime("%Y-%m-%d") for i in range(1, 6)]

        return {
            "symbol": symbol,
            "predictions": [{"date": date, "price": float(price)} for date, price in zip(future_dates, future_predictions)]
        }

    except Exception as e:
        return {"error": str(e)}


# 📈 Fetch 1-Month Stock Chart Data
@app.route('/chart/<symbol>', methods=['GET'])
def get_stock_chart(symbol):
    try:
        stock = yf.Ticker(f"{symbol}.NS")
        df = stock.history(period="1mo", interval="1d")

        if df.empty:
            return jsonify({"error": f"Stock symbol '{symbol}' not found."}), 404

        return jsonify({
            "symbol": symbol,
            "dates": df.index.strftime('%Y-%m-%d').tolist(),
            "closing_prices": df["Close"].tolist()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 📊 Fetch Today’s Stock Data (Open, High, Low, Close)
@app.route('/today/<symbol>', methods=['GET'])
def get_today_stock_info(symbol):
    try:
        stock = yf.Ticker(f"{symbol}.NS")
        df = stock.history(period="1d", interval="1d")

        if df.empty:
            return jsonify({"error": f"Stock '{symbol}' data not found."}), 404

        latest_data = df.iloc[-1]

        return jsonify({
            "symbol": symbol,
            "open": round(latest_data['Open'], 2),
            "high": round(latest_data['High'], 2),
            "low": round(latest_data['Low'], 2),
            "close": round(latest_data['Close'], 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔮 Predict Next 5 Days for a Stock
@app.route('/predict/<symbol>', methods=['GET'])
def get_stock_prediction(symbol):
    try:
        result = predict_future_prices(symbol)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 🔧 Handle Favicon Request to Avoid 404 Errors
@app.route('/favicon.ico')
def favicon():
    return '', 204  # No Content Response


# 📊 Technical Analysis API
@app.route("/technical-analysis/<symbol>", methods=["GET"])
def technical_analysis(symbol):
    try:
        stock = yf.Ticker(f"{symbol}.NS")
        df = stock.history(period="6mo")

        if df.empty:
            return jsonify({"error": f"Stock '{symbol}' data not available."})

        df["SMA"] = df["Close"].rolling(window=50).mean()
        df["EMA"] = df["Close"].ewm(span=50, adjust=False).mean()
        df["RSI"] = 100 - (100 / (1 + df["Close"].pct_change().rolling(14).mean()))

        # ✅ Replace NaN with 0
        df = df.fillna(0)

        return jsonify({
            "symbol": symbol,
            "dates": df.index.strftime("%Y-%m-%d").tolist(),
            "prices": df["Close"].tolist(),
            "sma": df["SMA"].tolist(),
            "ema": df["EMA"].tolist(),
            "rsi": df["RSI"].tolist(),
        })

    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/fundamental-analysis/<symbol>", methods=["GET"])
def fundamental_analysis(symbol):
    try:
        stock = yf.Ticker(f"{symbol}.NS")
        info = stock.info

        if not info:
            return jsonify({"error": f"Stock '{symbol}' data not available."})

        return jsonify({
            "symbol": symbol,
            "market_cap": info.get("marketCap", "N/A"),
            "pe_ratio": info.get("trailingPE", "N/A"),
            "eps": info.get("trailingEps", "N/A"),
            "dividend_yield": info.get("dividendYield", "N/A"),
        })

    except Exception as e:
        return jsonify({"error": str(e)})


# 🚀 Run Flask App
if __name__ == '__main__':
    app.run(debug=True, port=5000)



from flask import Flask
import os

app = Flask(__name__)

@app.route('/')
def home():
    return "StockXpert backend is working!"

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)

