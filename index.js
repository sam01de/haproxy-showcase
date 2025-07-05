const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Helper function to simulate realistic API response time
const simulateDelay = () => {
  return new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
};

// Basic route - homepage
app.get('/', async (req, res) => {
  await simulateDelay();
  res.json({
    message: 'Welcome to HAProxy Showcase API',
    version: '1.0.0',
    endpoints: {
      'GET /': 'This endpoint',
      'GET /health': 'Health check endpoint'
    }
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  await simulateDelay();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/proxytest', async (req, res) => {
  await simulateDelay();
  const message = process.env.INSTANCE_NAME != null ? 'Proxy used; Proxy Happy 😊  ||  Serving app instance: ' + process.env.INSTANCE_NAME : 'Proxy used; Proxy Happy 😊';
  res.json({
    message: message,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to see the API`);
}); 