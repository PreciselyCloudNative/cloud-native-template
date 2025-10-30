/**
 * GLiNER Service
 *
 * Handles communication with the GLiNER microservice for address extraction
 * Provides fallback to regex cleaning if GLiNER is unavailable
 */

const { config } = require('../config');
const { regexCleanQuery } = require('../utils/regex-cleaner');

/**
 * Extract address from natural language query using GLiNER microservice
 *
 * @param {string} query - Natural language query
 * @param {number} threshold - Confidence threshold (0.0-1.0)
 * @returns {Promise<string>} Extracted address string
 */
async function extractAddressWithGLiNER(query, threshold = 0.3) {
    try {
        console.log(`🎯 Attempting GLiNER extraction for: "${query}" [threshold: ${threshold}]`);

        const response = await fetch(`${config.services.gliner.url}/api/v1/extract`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query,
                threshold
            }),
            timeout: config.requests.timeout
        });

        if (response.ok) {
            const data = await response.json();

            if (data.success && data.address) {
                console.log(`✅ GLiNER extraction successful: "${query}" → "${data.address}"`);
                return data.address;
            } else {
                console.warn(`⚠️  GLiNER returned no result`);
            }
        } else {
            console.warn(`⚠️  GLiNER request failed (${response.status})`);
        }

    } catch (error) {
        console.warn(`⚠️  GLiNER error: ${error.message}`);
    }

    // Fallback to regex cleaning
    const regexCleaned = regexCleanQuery(query);
    console.log(`✂️  Regex fallback: "${query}" → "${regexCleaned}"`);
    return regexCleaned;
}

/**
 * Check if GLiNER service is available
 *
 * @returns {Promise<boolean>} True if GLiNER is available
 */
async function isGLiNERAvailable() {
    try {
        const response = await fetch(`${config.services.gliner.url}/api/v1/health`, {
            timeout: 5000
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

module.exports = {
    extractAddressWithGLiNER,
    isGLiNERAvailable
};
