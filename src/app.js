/**
 * Express Application Factory
 *
 * Creates and configures the Express application instance
 * Implements middleware, routes, and error handling
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { config } = require('./config');

// Route imports
const autocompleteRoutes = require('./routes/autocomplete.routes');
const nlpSearchRoutes = require('./routes/nlp-search.routes');
const dataGraphRoutes = require('./routes/data-graph.routes');

/**
 * Create Express application
 *
 * @returns {express.Application} Configured Express app
 */
function createApp() {
    const app = express();

    // ===========================================
    // Middleware Configuration
    // ===========================================

    // Enable CORS for cross-origin requests
    app.use(cors());

    // Parse JSON request bodies
    app.use(express.json());

    // Serve static files from public directory
    app.use(express.static(path.join(__dirname, '..', 'public')));

    // Serve Precisely Design System assets
    app.use('/dist', express.static(path.join(__dirname, '..', 'dist')));

    // ===========================================
    // API Routes
    // ===========================================

    // Health check endpoint
    app.get('/api/health', (req, res) => {
        res.json({
            status: 'ok',
            message: 'Server is running',
            timestamp: new Date().toISOString()
        });
    });

    // Autocomplete routes
    app.use('/api', autocompleteRoutes);

    // NLP search routes
    app.use('/api', nlpSearchRoutes);

    // Data Graph routes
    app.use('/api', dataGraphRoutes);

    // ===========================================
    // Error Handling
    // ===========================================

    // 404 handler
    app.use((req, res) => {
        res.status(404).json({
            error: 'Not Found',
            message: `Cannot ${req.method} ${req.path}`,
            status: 404
        });
    });

    // Global error handler
    app.use((err, req, res, next) => {
        console.error('Unhandled error:', err);

        res.status(err.status || 500).json({
            error: err.message || 'Internal Server Error',
            status: err.status || 500,
            ...(config.server.nodeEnv === 'development' && { stack: err.stack })
        });
    });

    return app;
}

module.exports = { createApp };
