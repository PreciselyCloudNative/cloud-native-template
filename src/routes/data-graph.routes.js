/**
 * Data Graph Routes
 *
 * Handles Precisely Data Graph GraphQL API endpoints
 */

const express = require('express');
const { callDataGraphAPI } = require('../services/precisely.service');

const router = express.Router();

/**
 * POST /api/data-graph
 * Precisely Data Graph GraphQL API proxy
 */
router.post('/data-graph', async (req, res) => {
    try {
        const { pbKey } = req.body;

        // Validate pb_key
        if (!pbKey || typeof pbKey !== 'string' || pbKey.trim().length === 0) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'pbKey is required and must be a non-empty string'
            });
        }

        console.log(`Data Graph query for PB_KEY: ${pbKey}`);

        const data = await callDataGraphAPI(pbKey);

        res.json(data);

    } catch (error) {
        console.error('Data Graph error:', error.message);
        res.status(500).json({
            error: 'Data Graph request failed',
            message: error.message
        });
    }
});

module.exports = router;
