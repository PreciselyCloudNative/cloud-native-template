/**
 * Configuration Module
 *
 * Centralized configuration management for the application
 * Loads environment variables and provides typed configuration objects
 */

require('dotenv').config();

const config = {
    // Server Configuration
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost',
        nodeEnv: process.env.NODE_ENV || 'development'
    },

    // Precisely API Configuration
    precisely: {
        apiKey: process.env.PRECISELY_API_KEY,
        baseUrl: 'https://api.cloud.precisely.com/v1'
    },

    // Address Extraction Services Configuration
    services: {
        gliner: {
            enabled: process.env.USE_LLM_EXTRACTION === 'true',
            url: process.env.GLINER_SERVICE_URL || 'http://localhost:5001',
            defaultThreshold: 0.3
        }
    },

    // Request Settings
    requests: {
        timeout: 30000, // 30 seconds
        maxRetries: 2
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info'
    }
};

/**
 * Validate required configuration
 */
function validateConfig() {
    const errors = [];

    if (!config.precisely.apiKey) {
        errors.push('PRECISELY_API_KEY is required. Set it in .env file');
    }

    if (errors.length > 0) {
        console.error('❌ Configuration errors:');
        errors.forEach(error => console.error(`   - ${error}`));
        process.exit(1);
    }
}

/**
 * Get configuration object
 */
function getConfig() {
    return config;
}

module.exports = {
    config,
    getConfig,
    validateConfig
};
