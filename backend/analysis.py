import yfinance as yf

def get_technical_analysis(symbol):
    stock = yf.Ticker(symbol)
    df = stock.history(period="6mo")

    if df.empty:
        return {"error": "No stock data found"}

    df['SMA_50'] = df['Close'].rolling(window=50, min_periods=1).mean()
    df['SMA_200'] = df['Close'].rolling(window=200, min_periods=1).mean()
    df['RSI'] = 100 - (100 / (1 + df['Close'].pct_change().rolling(14, min_periods=1).mean()))

    return {
        "50-day SMA": round(df['SMA_50'].iloc[-1], 2) if not df['SMA_50'].isna().iloc[-1] else "Not Available",
        "200-day SMA": round(df['SMA_200'].iloc[-1], 2) if not df['SMA_200'].isna().iloc[-1] else "Not Available",
        "RSI": round(df['RSI'].iloc[-1], 2) if not df['RSI'].isna().iloc[-1] else "Not Available"
    }

def get_fundamental_analysis(symbol):
    stock = yf.Ticker(symbol)
    info = stock.info

    return {
        "Market Cap": info.get("marketCap", "Not Available"),
        "P/E Ratio": info.get("trailingPE", "Not Available"),
        "EPS": info.get("trailingEps", "Not Available"),
        "Revenue": info.get("totalRevenue", "Not Available"),
        "Dividend Yield": info.get("dividendYield", "Not Available")
    }
