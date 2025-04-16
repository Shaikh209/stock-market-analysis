document.addEventListener("DOMContentLoaded", function () {
  const stockInput = document.getElementById("search-stock");
  const searchButton = document.getElementById("search-button");
  let stockChart; // Stores Chart.js instance

  // ✅ Handle stock search
  searchButton.addEventListener("click", function () {
    const stockSymbol = stockInput.value.trim().toUpperCase();
    if (!stockSymbol) {
      alert("Please enter a stock symbol.");
      return;
    }
    fetchStockData(stockSymbol);
    fetchStockInfo(stockSymbol);
  });

  // ✅ Fetch Stock Chart Data
  async function fetchStockData(symbol) {
    try {
      const response = await fetch(`http://127.0.0.1:5000/chart/${symbol}`);
      if (!response.ok) throw new Error("Failed to fetch stock data.");

      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      updateChart(data.dates, data.closing_prices);
    } catch (error) {
      console.error("❌ Error fetching stock data:", error);
    }
  }

  // ✅ Fetch Today's Stock Data
  async function fetchStockInfo(symbol) {
    try {
      const response = await fetch(`http://127.0.0.1:5000/today/${symbol}`);
      if (!response.ok) throw new Error("Failed to fetch stock info.");

      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }

      document.getElementById("stock-open").innerText = `₹${data.open}`;
      document.getElementById("stock-high").innerText = `₹${data.high}`;
      document.getElementById("stock-low").innerText = `₹${data.low}`;
      document.getElementById("stock-close").innerText = `₹${data.close}`;
    } catch (error) {
      console.error("❌ Error fetching stock info:", error);
    }
  }

  // ✅ Update Chart.js Chart
  function updateChart(labels, prices) {
    const ctx = document.getElementById("priceChart").getContext("2d");

    if (stockChart) {
      stockChart.destroy(); // ✅ Clear previous chart
    }

    stockChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Stock Price",
            data: prices,
            borderColor: "#00b894",
            borderWidth: 2,
            fill: false,
            tension: 0.1, // Smooth curve
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { display: true, title: { display: true, text: "Date" } },
          y: { display: true, title: { display: true, text: "Price (₹)" } },
        },
      },
    });
  }
});
