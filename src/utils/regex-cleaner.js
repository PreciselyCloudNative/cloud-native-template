/**
 * Regex-based Query Cleaner Utility
 *
 * Provides fallback query cleaning using regex patterns
 * Removes filler words and conversational elements from natural language queries
 */

/**
 * Regex-based filler word removal
 *
 * @param {string} query - The natural language query to clean
 * @returns {string} Cleaned query with filler words removed
 */
function regexCleanQuery(query) {
    let cleaned = query.trim();

    // Remove common filler patterns (multiple passes to catch cascading)
    for (let i = 0; i < 3; i++) {
        cleaned = cleaned
            // Remove conversational starts
            .replace(/^(help!?\s+)/i, '')
            .replace(/^(please\s+)/i, '')
            .replace(/^(can you\s+)/i, '')
            .replace(/^(could you\s+)/i, '')
            .replace(/^(do you know\s+)/i, '')
            .replace(/^(is there\s+)/i, '')
            .replace(/^(are there\s+)/i, '')
            .replace(/^(give me\s+)/i, '')
            .replace(/^(find me\s+)/i, '')
            .replace(/^(show me\s+)/i, '')
            .replace(/^(i need\s+)/i, '')
            .replace(/^(i want\s+)/i, '')
            .replace(/^(i'm at\s+)/i, '')
            .replace(/^(i am at\s+)/i, '')
            .replace(/^(i had\s+)/i, '')
            .replace(/^(i have\s+)/i, '')
            .replace(/^(i got\s+)/i, '')
            .replace(/^(there was\s+)/i, '')
            .replace(/^(there is\s+)/i, '')

            // Remove accident/event descriptions
            .replace(/^(a\s+)?fender bender\s+/i, '')
            .replace(/^(an?\s+)?accident\s+/i, '')
            .replace(/^(an?\s+)?incident\s+/i, '')
            .replace(/^(an?\s+)?emergency\s+/i, '')

            // Remove articles at start
            .replace(/^(a\s+)/i, '')
            .replace(/^(an\s+)/i, '')
            .replace(/^(all the\s+)/i, '')
            .replace(/^(all\s+)/i, '')
            .replace(/^(any\s+)/i, '')

            // Remove filler words in middle
            .replace(/\s+(all the)\s+/gi, ' ')
            .replace(/\s+(all)\s+/gi, ' ')
            .replace(/\s+any\s+/gi, ' ')
            .replace(/\bthe\s+/gi, '')
            .replace(/\s+and\s+/gi, ' ')
            .replace(/\s+in\s+/gi, ' ')
            .replace(/\s+on\s+/gi, ' ')
            .replace(/\s+at\s+/gi, ' ')
            .replace(/\s+by\s+/gi, ' ')
            .replace(/\s+near\s+/gi, ' ')
            .replace(/\s+around\s+/gi, ' ')
            .replace(/\s+area\b/gi, '')
            .replace(/[?!]+\s*/g, ' ')
            .trim()
            .replace(/\s+/g, ' ');
    }

    return cleaned;
}

module.exports = {
    regexCleanQuery
};
