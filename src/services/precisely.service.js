/**
 * Precisely API Service
 *
 * Handles all communication with Precisely Cloud APIs
 * Provides methods for autocomplete, express autocomplete, and data graph queries
 */

const { config } = require('../config');

/**
 * Call Precisely Autocomplete API
 *
 * @param {Object} payload - Autocomplete request payload
 * @returns {Promise<Object>} API response data
 */
async function callAutocompleteAPI(payload) {
    const response = await fetch(`${config.precisely.baseUrl}/autocomplete`, {
        method: 'POST',
        headers: {
            'Authorization': `Apikey ${config.precisely.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Autocomplete API error (${response.status}): ${errorText}`);
    }

    return response.json();
}

/**
 * Call Precisely Express Autocomplete API
 *
 * @param {Object} payload - Express autocomplete request payload
 * @returns {Promise<Object>} API response data
 */
async function callExpressAutocompleteAPI(payload) {
    const response = await fetch(`${config.precisely.baseUrl}/express-autocomplete`, {
        method: 'POST',
        headers: {
            'Authorization': `Apikey ${config.precisely.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Express Autocomplete API error (${response.status}): ${errorText}`);
    }

    return response.json();
}

/**
 * Call Precisely Data Graph API
 *
 * @param {string} pbKey - Precisely ID (PB_KEY)
 * @returns {Promise<Object>} API response data with parcels, buildings, addresses, and places
 */
async function callDataGraphAPI(pbKey) {
    const graphqlQuery = `
        query getDataByPreciselyId($id: String!) {
            getById(id: $id, queryType: PRECISELY_ID) {
                parcels {
                    data {
                        parcelID
                        geometry
                        buildings {
                            data {
                                buildingID
                                geometry
                                addresses {
                                    metadata {
                                        count
                                    }
                                    data {
                                        preciselyID
                                        addressNumber
                                        streetName
                                        unit
                                        places {
                                            metadata {
                                                count
                                            }
                                            data {
                                                preciselyID
                                                businessName
                                                brandName
                                                tradeName
                                                franchiseName
                                                city
                                                admin1ShortName
                                                postalCode
                                                formattedAddress
                                                phone
                                                email
                                                web
                                                lineOfBusiness
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    const response = await fetch('https://api.cloud.precisely.com/data-graph/graphql', {
        method: 'POST',
        headers: {
            'Authorization': `Apikey ${config.precisely.apiKey}`,
            'Content-Type': 'application/json',
            'cache-disabled': 'true'
        },
        body: JSON.stringify({
            query: graphqlQuery,
            variables: { id: pbKey }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Data Graph API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();

    // Transform the nested response into a flatter structure for easier consumption
    const transformed = {
        parcels: [],
        buildings: [],
        addresses: [],
        places: []
    };

    if (result.data?.getById?.parcels?.data) {
        result.data.getById.parcels.data.forEach(parcel => {
            transformed.parcels.push({
                pbKey: parcel.parcelID,
                geometry: parcel.geometry
            });

            if (parcel.buildings?.data) {
                parcel.buildings.data.forEach(building => {
                    // Collect addresses for this building
                    const buildingAddresses = [];

                    if (building.addresses?.data) {
                        building.addresses.data.forEach(address => {
                            // Build formatted address from components
                            const addressParts = [];
                            if (address.addressNumber) addressParts.push(address.addressNumber);
                            if (address.streetName) addressParts.push(address.streetName);
                            if (address.unit) addressParts.push(`Unit ${address.unit}`);

                            const addressObj = {
                                pbKey: address.preciselyID,
                                formattedAddress: addressParts.join(' ') || 'Address',
                                addressNumber: address.addressNumber,
                                streetName: address.streetName,
                                unit: address.unit
                            };

                            buildingAddresses.push(addressObj);
                            transformed.addresses.push(addressObj);

                            if (address.places?.data) {
                                address.places.data.forEach(place => {
                                    transformed.places.push({
                                        pbKey: place.preciselyID,
                                        name: place.businessName || place.brandName || place.tradeName,
                                        businessName: place.businessName,
                                        brandName: place.brandName,
                                        tradeName: place.tradeName,
                                        category: place.lineOfBusiness,
                                        formattedAddress: place.formattedAddress,
                                        city: place.city,
                                        phone: place.phone,
                                        email: place.email,
                                        website: place.web
                                    });
                                });
                            }
                        });
                    }

                    // Add building with its addresses
                    transformed.buildings.push({
                        pbKey: building.buildingID,
                        geometry: building.geometry,
                        addresses: buildingAddresses  // Keep addresses nested in building
                    });
                });
            }
        });
    }

    return transformed;
}

module.exports = {
    callAutocompleteAPI,
    callExpressAutocompleteAPI,
    callDataGraphAPI
};
