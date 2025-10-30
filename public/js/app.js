/**
 * Precisely Cloud Native Template - Application JavaScript
 *
 * This file provides reusable utilities for calling Precisely APIs
 * through the secure backend proxy.
 *
 * USAGE:
 * 1. Configure API endpoints in the CONFIG object
 * 2. Use callAPI() function to make API requests
 * 3. Customize the UI interaction handlers as needed
 */

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    // API Endpoints - Update these based on your server.js endpoints
    API_ENDPOINTS: {
        AUTOCOMPLETE: '/api/autocomplete',
        EXPRESS_AUTOCOMPLETE: '/api/express-autocomplete',
        NLP_SEARCH: '/api/nlp-search',
        DATA_GRAPH: '/api/data-graph',
        // Add your custom endpoints here
        // CUSTOM_API: '/api/your-endpoint',
    },

    // Request Settings
    TIMEOUT: 30000, // 30 seconds

    // Example: Debounce settings for autocomplete
    DEBOUNCE_DELAY: 400,
    MIN_CHARS: 3,
};

// ============================================
// MODE MANAGEMENT
// ============================================
let currentMode = 'autocomplete'; // 'autocomplete' or 'nlp'

/**
 * Switch between Address Autocomplete and NLP Search modes
 * @param {string} mode - The mode to switch to ('autocomplete' or 'nlp')
 */
function switchMode(mode) {
    currentMode = mode;

    // Update button styles
    const autocompleteBtn = document.getElementById('modeAutocomplete');
    const nlpBtn = document.getElementById('modeNLP');
    const searchBtn = document.getElementById('nlpSearchButton');
    const glinerSection = document.getElementById('glinerSettingsSection');
    const description = document.getElementById('modeDescription');
    const input = document.getElementById('unifiedSearchInput');
    const resultsContainer = document.getElementById('resultsContainer');

    if (mode === 'autocomplete') {
        // Style buttons
        autocompleteBtn.style.background = 'white';
        autocompleteBtn.style.color = '#8017e1';
        autocompleteBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        nlpBtn.style.background = 'transparent';
        nlpBtn.style.color = '#666';
        nlpBtn.style.boxShadow = 'none';

        // Hide search button and AI settings
        searchBtn.style.display = 'none';
        if (glinerSection) glinerSection.style.display = 'none';

        // Update description and placeholder
        description.textContent = 'Type an address for real-time suggestions powered by Address Autocomplete API';
        input.placeholder = 'Start typing an address (e.g., 123 Main St, New York)';

    } else if (mode === 'nlp') {
        // Style buttons
        nlpBtn.style.background = 'white';
        nlpBtn.style.color = '#8017e1';
        nlpBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        autocompleteBtn.style.background = 'transparent';
        autocompleteBtn.style.color = '#666';
        autocompleteBtn.style.boxShadow = 'none';

        // Show search button and AI settings
        searchBtn.style.display = 'block';
        if (glinerSection) glinerSection.style.display = 'block';

        // Update description and placeholder
        description.textContent = 'Just type naturally! Ask for addresses like you would speak';
        input.placeholder = 'e.g., "FedEx on 196th st", "coffee shop near times square"';
    }

    // Clear input and results when switching modes
    input.value = '';
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }
}

// ============================================
// API UTILITIES
// ============================================

/**
 * Generic API call function with error handling
 * @param {string} endpoint - The API endpoint (e.g., '/api/autocomplete')
 * @param {object} payload - The request body
 * @param {object} options - Optional fetch options
 * @returns {Promise<object>} - The API response data
 */
async function callAPI(endpoint, payload, options = {}) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
            ...options
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                error: 'API request failed',
                message: `Server returned ${response.status}`
            }));
            throw new Error(errorData.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('API call error:', error);

        if (error.name === 'AbortError') {
            throw new Error('Request timeout - please try again');
        }

        throw error;
    }
}

/**
 * Show error message to user
 * @param {string} message - The error message to display
 */
function showError(message) {
    console.error('Error:', message);

    // Display error in results container if available
    const container = document.getElementById('resultsContainer');
    if (container) {
        container.innerHTML = `
            <div style="background: #fff3cd; border-left: 3px solid #ffc107; padding: 12px; border-radius: 4px; color: #856404;">
                <strong>Error:</strong> ${message}
            </div>
        `;
    } else {
        // Fallback to alert if container not available
        alert(`Error: ${message}`);
    }
}

/**
 * Show success message to user
 * @param {string} message - The success message to display
 */
function showSuccess(message) {
    console.log('Success:', message);

    // Customize this to use your UI components
    // showToast(message, 'success');
}

/**
 * Show loading indicator
 * @param {boolean} show - Whether to show or hide the loading indicator
 */
function showLoading(show) {
    // Customize this based on your UI
    const loadingElement = document.getElementById('loadingIndicator');
    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }
}

// ============================================
// EXAMPLE: AUTOCOMPLETE FUNCTIONALITY
// ============================================

// Debounce timer
let debounceTimer = null;

/**
 * Example: Fetch autocomplete suggestions
 * @param {string} query - The search query
 */
async function fetchAutocompleteSuggestions(query) {
    if (query.length < CONFIG.MIN_CHARS) {
        return;
    }

    try {
        showLoading(true);

        // Build the request payload
        const payload = {
            preferences: {
                maxResults: 5,
                returnAllInfo: true,
                matchMode: "STANDARD",
                customPreferences: {
                    SEARCH_ADDRESS_NUMBER: true,
                    EXPANDED_RANGE_UNIT: "false"
                }
            },
            address: {
                addressLines: [query],
                country: "USA",
                postalCode: "",
                admin1: ""
            }
        };

        // Call the API
        const data = await callAPI(CONFIG.API_ENDPOINTS.AUTOCOMPLETE, payload);

        // Extract predictions from response
        const predictions = data.response?.predictions || [];

        console.log(`Found ${predictions.length} suggestions`);

        // Process results (customize based on your needs)
        if (predictions.length === 0) {
            // Try fallback API
            console.log('No results, trying express autocomplete...');
            await fetchExpressAutocompleteSuggestions(query);
        } else {
            displaySuggestions(predictions);
        }

    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Example: Fetch express autocomplete suggestions (fallback)
 * @param {string} query - The search query
 */
async function fetchExpressAutocompleteSuggestions(query) {
    try {
        const payload = {
            preferences: {
                maxResults: 5,
                returnAllInfo: true,
                customPreferences: {
                    SEARCH_TYPE: "AUTO"
                }
            },
            address: {
                addressLines: [query],
                country: "USA"
            }
        };

        const data = await callAPI(CONFIG.API_ENDPOINTS.EXPRESS_AUTOCOMPLETE, payload);
        const predictions = data.response?.predictions || [];

        displaySuggestions(predictions);

    } catch (error) {
        showError(error.message);
    }
}

/**
 * Display autocomplete suggestions in the UI
 * @param {Array} suggestions - Array of suggestion objects
 */
function displaySuggestions(suggestions) {
    console.log('Displaying suggestions:', suggestions);

    const container = document.getElementById('resultsContainer');
    if (!container) return;

    // Clear previous suggestions
    container.innerHTML = '';

    if (!suggestions || suggestions.length === 0) {
        container.innerHTML = '<p style="color: #333; font-style: italic; padding: 12px; background: #f8f9fa; border-radius: 8px;">No suggestions found. Try a different search term.</p>';
        return;
    }

    // Create a list of suggestions
    const list = document.createElement('div');
    list.className = 'suggestions-list';
    list.style.cssText = 'background: #f8f9fa; border-radius: 8px; padding: 16px;';

    suggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.style.cssText = 'padding: 12px; margin-bottom: 8px; background: white; border-radius: 4px; border-left: 3px solid #8017e1; cursor: pointer; transition: all 0.2s; color: #333;';

        // Extract address information - use formattedAddress for complete, accurate display
        const formattedAddress = suggestion.address?.formattedAddress || suggestion.prediction || '';

        // Build display HTML using complete formatted address
        let displayHTML = '';
        if (formattedAddress) {
            // Split formatted address into lines for better display
            // Format: "BUSINESS, STREET ADDRESS, CITY STATE ZIP"
            const addressParts = formattedAddress.split(',').map(part => part.trim());

            if (addressParts.length >= 2) {
                // First line: Business name and street address (including suite/unit)
                const line1 = addressParts.slice(0, -1).join(', ');
                // Second line: City, state, zip
                const line2 = addressParts[addressParts.length - 1];

                displayHTML = `
                    <div style="font-weight: 500; color: #333;">${line1}</div>
                    <div><small style="color: #666;">${line2}</small></div>
                `;
            } else {
                // Fallback: show entire address on one line
                displayHTML = `<div style="font-weight: 500; color: #333;">${formattedAddress}</div>`;
            }
        }

        item.innerHTML = displayHTML;

        // Add hover effect
        item.addEventListener('mouseenter', () => {
            item.style.background = '#f0f0f0';
            item.style.transform = 'translateX(4px)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = 'white';
            item.style.transform = 'translateX(0)';
        });

        // Add click handler
        item.addEventListener('click', () => {
            // Extract PB_KEY from customFields
            const pbKey = suggestion.customFields?.PB_KEY || suggestion.address?.customFields?.PB_KEY;

            if (pbKey) {
                console.log('PB_KEY found:', pbKey);
                // Redirect to dashboard with PB_KEY and complete formatted address
                const addressParam = encodeURIComponent(formattedAddress);
                window.location.href = `/dashboard.html?pbKey=${pbKey}&address=${addressParam}`;
            } else {
                console.warn('No PB_KEY found in suggestion:', suggestion);
                const inputElement = document.getElementById('unifiedSearchInput');
                if (inputElement) {
                    inputElement.value = formattedAddress;
                }
                container.innerHTML = `
                    <div style="background: #fff3cd; border-left: 3px solid #ffc107; padding: 12px; border-radius: 4px; color: #856404; margin-top: 16px;">
                        <strong>Note:</strong> Detailed information not available for this address. Try selecting a different result or refining your search.
                    </div>
                `;
            }
        });

        list.appendChild(item);
    });

    const header = document.createElement('h4');
    header.style.cssText = 'margin-top: 0; margin-bottom: 12px; color: #8017e1;';
    header.textContent = `${suggestions.length} Suggestion${suggestions.length !== 1 ? 's' : ''} Found`;

    container.appendChild(header);
    container.appendChild(list);
}

/**
 * Example: Debounced input handler for autocomplete
 * @param {string} query - The search query
 */
function handleAutocompleteInput(query) {
    // Clear existing timer
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    // Set new timer
    debounceTimer = setTimeout(() => {
        fetchAutocompleteSuggestions(query);
    }, CONFIG.DEBOUNCE_DELAY);
}

// ============================================
// NLP SEARCH FUNCTIONALITY
// ============================================

/**
 * Perform NLP search for addresses using natural language
 * @param {string} query - The natural language query
 */
async function performNLPSearch(query) {
    if (!query || query.trim().length === 0) {
        showNLPError('Please enter a search query');
        return;
    }

    try {
        showNLPLoading(true);

        // Get GLiNER threshold from slider
        const thresholdSlider = document.getElementById('glinerThreshold');
        const threshold = thresholdSlider ? parseFloat(thresholdSlider.value) : 0.3;

        // Call the NLP search API (GLiNER extraction) with threshold
        const data = await callAPI(CONFIG.API_ENDPOINTS.NLP_SEARCH, { query, threshold });

        // Extract predictions from response
        const predictions = data.response?.predictions || [];
        const queryInfo = data._query_info || {};

        console.log(`NLP Search found ${predictions.length} results for: "${queryInfo.cleaned_query}"`);

        // Display results
        if (predictions.length === 0) {
            showNLPError(`No results found for "${queryInfo.cleaned_query}". Try rephrasing your search.`);
        } else {
            displayNLPResults(predictions, queryInfo);
        }

    } catch (error) {
        showNLPError(error.message);
    } finally {
        showNLPLoading(false);
    }
}


/**
 * Display NLP search results in the UI
 * @param {Array} results - Array of result objects
 * @param {Object} queryInfo - Information about the query
 */
function displayNLPResults(results, queryInfo) {
    const container = document.getElementById('resultsContainer');
    if (!container) return;

    // Clear previous results
    container.innerHTML = '';

    // Create results header - show the query that was actually sent to Precisely
    const actualQuery = queryInfo.extracted_query || queryInfo.cleaned_query;
    const header = document.createElement('h4');
    header.style.cssText = 'margin-top: 0; margin-bottom: 12px; color: #8017e1;';
    header.textContent = `${results.length} Result${results.length !== 1 ? 's' : ''} Found for "${actualQuery}"`;
    container.appendChild(header);

    // Show extraction info if AI extracted something different
    if (queryInfo.extracted_query && queryInfo.extracted_query !== queryInfo.original_query) {
        const extractionInfo = document.createElement('div');
        extractionInfo.style.cssText = 'background: #e8f5e9; border-left: 3px solid #28a745; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; font-size: 14px;';
        extractionInfo.innerHTML = `
            <strong style="color: #28a745;">🎯 AI Address Extraction:</strong>
            <div style="color: #666; margin-top: 4px;">
                <strong>Your query:</strong> "${queryInfo.original_query}"<br>
                <strong>Sent to API:</strong> "${queryInfo.extracted_query}"
            </div>
        `;
        container.appendChild(extractionInfo);
    }


    // Create results list
    const list = document.createElement('div');
    list.style.cssText = 'background: #f8f9fa; border-radius: 8px; padding: 16px;';

    results.forEach((result, index) => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 12px; margin-bottom: 8px; background: white; border-radius: 4px; border-left: 3px solid #8017e1; cursor: pointer; transition: all 0.2s; color: #333;';

        // Extract address information - use formattedAddress for complete, accurate display
        const formattedAddress = result.address?.formattedAddress || result.prediction || '';
        const pbKey = result.customFields?.PB_KEY || result.address?.customFields?.PB_KEY;

        // Build display HTML using complete formatted address
        let displayHTML = '';
        if (formattedAddress) {
            // Split formatted address into lines for better display
            // Format: "BUSINESS, STREET ADDRESS, CITY STATE ZIP"
            const addressParts = formattedAddress.split(',').map(part => part.trim());

            if (addressParts.length >= 2) {
                // First line: Business name and street address
                const line1 = addressParts.slice(0, -1).join(', ');
                // Second line: City, state, zip
                const line2 = addressParts[addressParts.length - 1];

                displayHTML = `
                    <div style="font-weight: 500; color: #333;">${line1}</div>
                    <div><small style="color: #666;">${line2}</small></div>
                `;
            } else {
                // Fallback: show entire address on one line
                displayHTML = `<div style="font-weight: 500; color: #333;">${formattedAddress}</div>`;
            }
        }

        item.innerHTML = displayHTML;

        // Add hover effect
        item.addEventListener('mouseenter', () => {
            item.style.background = '#f0f0f0';
            item.style.transform = 'translateX(4px)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = 'white';
            item.style.transform = 'translateX(0)';
        });

        // Add click handler
        item.addEventListener('click', () => {
            if (pbKey) {
                console.log('Navigating to dashboard with PB_KEY:', pbKey);
                const addressParam = encodeURIComponent(formattedAddress);
                window.location.href = `/dashboard.html?pbKey=${pbKey}&address=${addressParam}`;
            } else {
                console.warn('No PB_KEY found for this result');
                const inputElement = document.getElementById('unifiedSearchInput');
                if (inputElement) {
                    inputElement.value = formattedAddress;
                }
                container.innerHTML = `
                    <div style="background: #fff3cd; border-left: 3px solid #ffc107; padding: 12px; border-radius: 4px; color: #856404; margin-top: 16px;">
                        <strong>Note:</strong> Detailed information not available for this address. Try selecting a different result or refining your search.
                    </div>
                `;
            }
        });

        list.appendChild(item);
    });

    container.appendChild(list);
}

/**
 * Show NLP loading indicator
 * @param {boolean} show - Whether to show or hide the loading indicator
 */
function showNLPLoading(show, customMessage = 'Searching addresses...') {
    const loadingElement = document.getElementById('loadingIndicator');
    const loadingText = document.getElementById('loadingText');

    if (loadingElement) {
        loadingElement.style.display = show ? 'block' : 'none';
    }

    // Update loading message
    if (loadingText && show) {
        loadingText.textContent = customMessage;
    }

    // Clear results when loading
    if (show) {
        const container = document.getElementById('resultsContainer');
        if (container) {
            container.innerHTML = '';
        }
    }
}

/**
 * Show NLP error message
 * @param {string} message - The error message to display
 */
function showNLPError(message) {
    console.error('NLP Search Error:', message);

    const container = document.getElementById('resultsContainer');
    if (container) {
        container.innerHTML = `
            <div style="background: #fff3cd; border-left: 3px solid #ffc107; padding: 12px; border-radius: 4px; color: #856404;">
                <strong>Error:</strong> ${message}
            </div>
        `;
    }
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the application
 */
function initializeApp() {
    console.log('Precisely Cloud Native Template initialized');

    // Set up unified input listener
    const inputElement = document.getElementById('unifiedSearchInput');
    const searchButton = document.getElementById('nlpSearchButton');

    if (inputElement) {
        // Input change handler
        inputElement.addEventListener('input', (e) => {
            const value = e.target.value.trim();

            // Clear results if input is empty
            if (value === '') {
                const container = document.getElementById('resultsContainer');
                if (container) {
                    container.innerHTML = '';
                }
                return;
            }

            // Handle based on current mode
            if (currentMode === 'autocomplete') {
                handleAutocompleteInput(value);
            }
            // NLP mode requires button click or Enter key
        });

        // Enter key handler
        inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && currentMode === 'nlp') {
                e.preventDefault();
                const query = inputElement.value.trim();
                performNLPSearch(query);
            }
        });

        // Clear results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.card-template')) {
                const container = document.getElementById('resultsContainer');
                if (container && currentMode === 'autocomplete') {
                    container.innerHTML = '';
                }
            }
        });
    }

    // Set up NLP search button listener
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const query = inputElement.value.trim();
            performNLPSearch(query);
        });
    }

    console.log('Unified search interface ready');

    // Set up AI threshold slider
    const thresholdSlider = document.getElementById('glinerThreshold');
    const thresholdValue = document.getElementById('thresholdValue');

    if (thresholdSlider && thresholdValue) {
        // Update display value when slider changes
        thresholdSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value).toFixed(2);
            thresholdValue.textContent = value;
        });

        console.log('AI threshold slider ready');
    }
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ============================================
// EXPORT FOR USE IN OTHER FILES (if using modules)
// ============================================
// export { callAPI, showError, showSuccess, showLoading, CONFIG };
