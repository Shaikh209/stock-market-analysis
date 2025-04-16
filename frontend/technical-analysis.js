document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("tech-analysis-form");
  const stockInput = document.getElementById("search-stock");
  const resultContainer = document.getElementById("analysis-output");

  // ✅ Ensure required elements exist before adding event listeners
  if (!form || !stockInput || !resultContainer) {
    console.error("❌ Error: Missing required elements in HTML.");
    return;
  }

  // ✅ Prevent Page Reload on Submit
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const stockSymbol = stockInput.value.trim().toUpperCase();

    if (!stockSymbol) {
      alert("Please enter a stock symbol.");
      return;
    }

    fetchTechnicalAnalysis(stockSymbol);
  });
});

// ✅ Fetch Technical Analysis Data
async function fetchTechnicalAnalysis(stockSymbol) {
  try {
    document.getElementById(
      "analysis-output"
    ).innerHTML = `<p>🔄 Fetching Technical Analysis for ${stockSymbol}...</p>`;

    const response = await fetch(
      `http://127.0.0.1:5000/technical-analysis/${stockSymbol}`
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      document.getElementById(
        "analysis-output"
      ).innerHTML = `<p style="color:red;">${data.error}</p>`;
      return;
    }

    // ✅ Display Data
    displayTechnicalAnalysis(data);
  } catch (error) {
    console.error("Error fetching technical analysis:", error);
    document.getElementById(
      "analysis-output"
    ).innerHTML = `<p style="color:red;">Error fetching data.</p>`;
  }
}

// ✅ Display Technical Analysis Data
function displayTechnicalAnalysis(data) {
  let outputHTML = `
        <h3>Technical Analysis for ${data.symbol}</h3>
        <p><strong>Last Closing Price:</strong> ₹${data.prices.slice(-1)[0]}</p>
        <p><strong>50-Day SMA:</strong> ₹${data.sma.slice(-1)[0] || "N/A"}</p>
        <p><strong>50-Day EMA:</strong> ₹${data.ema.slice(-1)[0] || "N/A"}</p>
        <p><strong>RSI:</strong> ${
          data.rsi.slice(-1)[0] ? data.rsi.slice(-1)[0].toFixed(2) : "N/A"
        }</p>
      `;

  document.getElementById("analysis-output").innerHTML = outputHTML;

  // ✅ Update Chart
  updateCharts(data);
}

// ✅ Function to Update Charts
function updateCharts(data) {
  const ctxStock = document.getElementById("stockChart").getContext("2d");
  const ctxMovingAvg = document
    .getElementById("movingAverageChart")
    .getContext("2d");
  const ctxRSI = document.getElementById("rsiChart").getContext("2d");

  if (window.stockChartInstance) window.stockChartInstance.destroy();
  if (window.movingAvgChartInstance) window.movingAvgChartInstance.destroy();
  if (window.rsiChartInstance) window.rsiChartInstance.destroy();

  // 📈 Stock Price Chart
  window.stockChartInstance = new Chart(ctxStock, {
    type: "line",
    data: {
      labels: data.dates,
      datasets: [
        {
          label: "Stock Price (₹)",
          data: data.prices,
          borderColor: "#1e88e5",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
      ],
    },
  });

  // 📉 Moving Averages Chart
  window.movingAvgChartInstance = new Chart(ctxMovingAvg, {
    type: "line",
    data: {
      labels: data.dates,
      datasets: [
        {
          label: "50-Day SMA",
          data: data.sma,
          borderColor: "#ff9800",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
        {
          label: "50-Day EMA",
          data: data.ema,
          borderColor: "#4caf50",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
      ],
    },
  });

  // 📊 RSI Chart
  window.rsiChartInstance = new Chart(ctxRSI, {
    type: "line",
    data: {
      labels: data.dates,
      datasets: [
        {
          label: "RSI",
          data: data.rsi,
          borderColor: "#e91e63",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
        },
      ],
    },
  });
}
