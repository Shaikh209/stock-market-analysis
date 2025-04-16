document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("fundamental-form");
  const stockInput = document.getElementById("search-stock");
  const resultContainer = document.getElementById("fundamental-output");

  if (!form || !stockInput || !resultContainer) {
    console.error("❌ Error: Missing required elements in HTML.");
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const stockSymbol = stockInput.value.trim().toUpperCase();

    if (!stockSymbol) {
      alert("Please enter a stock symbol.");
      return;
    }

    fetchFundamentalAnalysis(stockSymbol);
  });
});

async function fetchFundamentalAnalysis(stockSymbol) {
  try {
    document.getElementById(
      "fundamental-output"
    ).innerHTML = `<p>🔄 Fetching Fundamental Analysis for ${stockSymbol}...</p>`;

    const response = await fetch(
      `http://127.0.0.1:5000/fundamental-analysis/${stockSymbol}`
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      document.getElementById(
        "fundamental-output"
      ).innerHTML = `<p style="color:red;">${data.error}</p>`;
      return;
    }

    displayFundamentalAnalysis(data);
  } catch (error) {
    console.error("Error fetching fundamental analysis:", error);
    document.getElementById(
      "fundamental-output"
    ).innerHTML = `<p style="color:red;">Error fetching data.</p>`;
  }
}

function displayFundamentalAnalysis(data) {
  let outputHTML = `
        <h3>Financial Overview for ${data.symbol}</h3>
        <p><strong>Market Cap:</strong> ₹${data.market_cap}</p>
        <p><strong>P/E Ratio:</strong> ${data.pe_ratio}</p>
        <p><strong>EPS:</strong> ₹${data.eps}</p>
        <p><strong>Dividend Yield:</strong> ${data.dividend_yield}%</p>
    `;

  document.getElementById("fundamental-output").innerHTML = outputHTML;
}
