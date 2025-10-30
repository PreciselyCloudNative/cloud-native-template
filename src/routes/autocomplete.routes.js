/**
 * Autocomplete Routes
 *
 * Handles autocomplete and express-autocomplete endpoints
 */

const express = require('express');
const { callAutocompleteAPI, callExpressAutocompleteAPI } = require('../services/precisely.service');

const router = express.Router();

/**
 * POST /api/autocomplete
 * Precisely Autocomplete API proxy
 */
router.post('/autocomplete', async (req, res) => {
    try {
        const data = await callAutocompleteAPI(req.body);
        res.json(data);
    } catch (error) {
        console.error('Autocomplete error:', error.message);
        res.status(500).json({
            error: 'Autocomplete request failed',
            message: error.message
        });
    }
});

/**
 * POST /api/express-autocomplete
 * Precisely Express Autocomplete API proxy
 */
router.post('/express-autocomplete', async (req, res) => {
    try {
        const data = await callExpressAutocompleteAPI(req.body);
        res.json(data);
    } catch (error) {
        console.error('Express autocomplete error:', error.message);
        res.status(500).json({
            error: 'Express autocomplete request failed',
            message: error.message
        });
    }
});

module.exports = router;
