const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Helper function to simulate realistic API response time
const simulateDelay = (delayTime = 200) => {
  return new Promise(resolve => setTimeout(resolve, delayTime)); // 200ms delay
};

app.get('/', async (req, res) => {
  res.json({
    message: 'Welcome to HAProxy Showcase API',
    version: '1.0.0',
    endpoints: {
      'GET /': 'This endpoint',
      'GET /health': 'Health check endpoint'
    }
  });
});

app.get('/proxytest', async (req, res) => {
  const randomDelay = req.query.distributedelay === 'true'; //Boolean
  if(randomDelay && process.env.INSTANCE_NUM != null) {
    await simulateDelay(200 * parseInt(process.env.INSTANCE_NUM));
  } else {
    await simulateDelay(200);
  }
  const message = process.env.INSTANCE_NUM != null ? 'Proxy used; Proxy Happy 😊  ||  Serving app instance: ' + process.env.INSTANCE_NUM : 'Proxy used; Proxy Happy 😊';
  res.json({
    message: message,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

//Block via haproxy
app.get('/proxytest/admin', async (req, res) => {
  res.json({
    message: 'Super secret admin endpoint',
  });
});

//Re-Reoute to server 5 via haproxy
app.get('/proxytest/server5', async (req, res) => {
  res.json({
    message: 'Re-Reoute to server 5 via haproxy. This server instance is: ' + process.env.INSTANCE_NUM,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to see the API`);
}); 