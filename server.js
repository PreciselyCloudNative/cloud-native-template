#!/usr/bin/env node
/**
 * Precisely Cloud Native Template - Server Entry Point
 *
 * Main entry point for starting the HTTP server
 * For production, use process manager like PM2 or container orchestration
 */

const { createApp } = require('./src/app');
const { config, validateConfig } = require('./src/config');

// Validate configuration on startup
validateConfig();

// Create Express application
const app = createApp();

// Start server
const PORT = config.server.port;
const HOST = config.server.host;

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 Precisely Cloud Native Template Server');
    console.log('='.repeat(60));
    console.log(`📍 Server URL: http://${HOST}:${PORT}`);
    console.log(`🌐 Environment: ${config.server.nodeEnv}`);
    console.log(`🔑 API Key: ${config.precisely.apiKey ? '✓ Configured' : '✗ Missing'}`);
    console.log(`🎯 GLiNER: ${config.services.gliner.enabled ? '✓ Enabled' : '○ Disabled'}`);
    console.log('\n📡 API Endpoints:');
    console.log(`   - Health: http://${HOST}:${PORT}/api/health`);
    console.log(`   - Autocomplete: http://${HOST}:${PORT}/api/autocomplete`);
    console.log(`   - Express Autocomplete: http://${HOST}:${PORT}/api/express-autocomplete`);
    console.log(`   - NLP Search: http://${HOST}:${PORT}/api/nlp-search`);
    console.log(`   - Data Graph: http://${HOST}:${PORT}/api/data-graph`);
    console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n⚠️  SIGINT received, shutting down gracefully...');
    process.exit(0);
});
