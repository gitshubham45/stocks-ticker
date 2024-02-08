const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Function to fetch stock price
const getStockPrice = async (ticker) => {
    try {
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`);
        const data = await response.json();
       
        const price = data.chart.result[0].meta.regularMarketPrice;
        console.log(price);
        return price;
    } catch (error) {
        console.error("Error fetching stock price:", error);
        return null;
    }
};

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('Client connected');
    
    // Send initial stock price data
    const ticker = "ATGL.NS"; // Example: Apple Inc.
    getStockPrice(ticker).then(price => {
        ws.send(JSON.stringify({ ticker, price }));
    }).catch(error => {
        console.error("Error fetching initial stock price:", error);
    });

    // Periodically update stock price and send it to client
    const intervalId = setInterval(async () => {
        try {
            const price = await getStockPrice(ticker);
            ws.send(JSON.stringify({ ticker, price }));
        } catch (error) {
            console.error("Error updating stock price:", error);
        }
    }, 1000); // Update every 5 seconds

    // WebSocket close event handler
    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(intervalId);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
