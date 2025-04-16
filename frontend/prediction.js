// ✅ Prevent Page Refresh on Form Submission
document
  .getElementById("prediction-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // ✅ Stop form refresh
    fetchStockPrediction();
  });

// ✅ Global Variables to Prevent Repeated Requests
let isFetching = false;

// ✅ Function to Fetch Stock Prediction
async function fetchStockPrediction() {
  const stockSymbolInput = document.getElementById("search-stock");

  if (!stockSymbolInput) {
    console.error("Error: Stock input element is missing.");
    return;
  }

  const stockSymbol = stockSymbolInput.value.trim().toUpperCase();

  if (!stockSymbol) {
    alert("Please enter a stock symbol.");
    return;
  }

  // ✅ Prevent multiple requests at the same time
  if (isFetching) {
    console.warn(
      "⚠️ Request already in progress... Preventing duplicate request."
    );
    return;
  }
  isFetching = true; // Set lock

  try {
    // ✅ API Request for 5-Day Prediction
    const response = await fetch(
      `http://127.0.0.1:5000/predict/${stockSymbol}`
    );

    if (!response.ok) {
      throw new Error(`API returned error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ API Response Data:", data); // ✅ Debugging: Check API response

    if (data.error) {
      document.getElementById(
        "prediction-output"
      ).innerHTML = `<p style="color:red;">${data.error}</p>`;
      isFetching = false; // Unlock requests
      return;
    }

    // ✅ Ensure we have at least 1 data point for the table
    if (data.predictions.length < 1) {
      document.getElementById(
        "prediction-output"
      ).innerHTML += `<p style="color:red;">Not enough data points to show predictions.</p>`;
      isFetching = false; // Unlock requests
      return;
    }

    // ✅ Update Table (Graph Removed)
    updatePredictionTable(data.predictions);

    document.getElementById(
      "prediction-output"
    ).innerHTML = `<h3>Predicted Prices for ${stockSymbol} (Next 5 Days)</h3>`;
  } catch (error) {
    console.error("❌ Error fetching stock prediction:", error);
    document.getElementById(
      "prediction-output"
    ).innerHTML = `<p style="color:red;">Error fetching data.</p>`;
  } finally {
    isFetching = false; // Unlock requests
  }
}

// ✅ Function to Update Prediction Table
function updatePredictionTable(predictions) {
  const tableBody = document.querySelector("#prediction-table tbody");
  tableBody.innerHTML = ""; // ✅ Clear previous data

  predictions.forEach((prediction) => {
    const row = `<tr>
                      <td>${prediction.date}</td>
                      <td>₹${prediction.price.toFixed(2)}</td>
                  </tr>`;
    tableBody.innerHTML += row;
  });
}
