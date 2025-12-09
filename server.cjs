const express = require('express');
const handler = require('serve-handler');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const staticPath = path.join(__dirname, 'dist');

// ----------------------------------------------------
// 1. MIDDLEWARE
// ----------------------------------------------------

// Enable JSON parsing for API POST/PUT requests
app.use(express.json()); 

// ----------------------------------------------------
// 2. API ROUTES (POST, PUT, DELETE)
// ----------------------------------------------------

// Define your API endpoints here. Express will handle these first.
app.post('/api/data', (req, res) => {
    // Your API logic runs here (e.g., save to database)
    console.log(req.body);
    res.status(201).json({ 
        message: 'Data received and processed via POST',
        status: 'ok'
    });
});

app.get('/api/status', (req, res) => {
    res.json({ message: 'API is alive!' });
});


// ----------------------------------------------------
// 3. SPA & STATIC FILE FALLBACK
// ----------------------------------------------------

// Use serve-handler as middleware for everything else.
// This handles:
// 1. Serving static assets (CSS, JS, images) from the /dist folder.
// 2. Serving index.html for all remaining GET requests (SPA routing fallback).
app.use((req, res) => {
  // Configuration for serve-handler to treat unknown paths as SPA routes
  return handler(req, res, {
    public: staticPath,
    rewrites: [
        // This is the SPA fallback: for any path that isn't a file,
        // serve the index.html file so the client-side router can take over.
        { source: '**', destination: '/index.html' }
    ]
  });
});


// ----------------------------------------------------
// 4. START SERVER
// ----------------------------------------------------

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});