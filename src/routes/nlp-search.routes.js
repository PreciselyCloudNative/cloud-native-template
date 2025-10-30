/**
 * NLP Search Routes
 *
 * Handles natural language search with AI address extraction
 */

const express = require('express');
const { extractAddressWithGLiNER } = require('../services/gliner.service');
const { callExpressAutocompleteAPI } = require('../services/precisely.service');
const { regexCleanQuery } = require('../utils/regex-cleaner');

const router = express.Router();

/**
 * POST /api/nlp-search
 * Natural language search with GLiNER extraction and regex fallback
 */
router.post('/nlp-search', async (req, res) => {
    try {
        const { query, threshold } = req.body;

        // Validate query
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Query is required and must be a non-empty string'
            });
        }

        const cleanedQuery = query.trim();
        const glinerThreshold = threshold !== undefined ? parseFloat(threshold) : 0.3;

        console.log(`NLP Search query: "${cleanedQuery}" [threshold: ${glinerThreshold}]`);

        // Extract address using GLiNER (with regex fallback)
        console.log('🎯 Attempting AI address extraction...');
        const extractedQuery = await extractAddressWithGLiNER(cleanedQuery, glinerThreshold);

        // Build request payload for Express Autocomplete
        const payload = {
            preferences: {
                maxResults: 5,
                returnAllInfo: true,
                customPreferences: {
                    SEARCH_TYPE: "AUTO"
                }
            },
            address: {
                addressLines: [extractedQuery],
                country: "USA"
            }
        };

        // Call Precisely Express Autocomplete API
        const data = await callExpressAutocompleteAPI(payload);

        // Add metadata about the query
        const enrichedResponse = {
            ...data,
            _query_info: {
                original_query: query,
                cleaned_query: cleanedQuery,
                extracted_query: extractedQuery,
                gliner_threshold: glinerThreshold,
                country: "USA",
                max_results: 5
            }
        };

        console.log(`NLP Search found ${data.response?.predictions?.length || 0} results`);

        res.json(enrichedResponse);

    } catch (error) {
        console.error('NLP search error:', error.message);
        res.status(500).json({
            error: 'NLP search request failed',
            message: error.message
        });
    }
});

module.exports = router;
