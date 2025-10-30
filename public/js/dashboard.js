/**
 * Dashboard JavaScript - Handles data fetching and display
 */

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const pbKey = urlParams.get('pbKey');
const address = urlParams.get('address');

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (!pbKey) {
        showError('No address selected. Please return to search.');
        return;
    }

    // Set address title and PB_KEY
    if (address) {
        document.getElementById('addressTitle').textContent = decodeURIComponent(address);
    }

    // Add PB_KEY subtitle
    const subtitleElement = document.getElementById('addressSubtitle');
    if (subtitleElement && pbKey) {
        subtitleElement.textContent = `PB_KEY: ${pbKey}`;
    }

    // Fetch data
    fetchDashboardData(pbKey);
});

/**
 * Fetch data from the GraphQL API
 */
async function fetchDashboardData(pbKey) {
    try {
        const response = await fetch('/api/data-graph', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pbKey })
        });

        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        console.log('Dashboard data:', data);

        displayDashboardData(data);

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showError(error.message);
    }
}

/**
 * Display the dashboard data
 */
function displayDashboardData(data) {
    // Hide loading state
    document.getElementById('loadingState').style.display = 'none';

    // The API now returns a flat transformed structure
    const parcels = data?.parcels || [];
    const buildings = data?.buildings || [];
    const addresses = data?.addresses || [];
    const places = data?.places || [];

    if (parcels.length === 0 && buildings.length === 0 && addresses.length === 0) {
        // Show no data state
        document.getElementById('noDataState').style.display = 'block';
        document.getElementById('dashboardContent').style.display = 'block';
        return;
    }

    // Update summary cards with flat structure counts
    document.getElementById('buildingCount').textContent = buildings.length;
    document.getElementById('addressCount').textContent = addresses.length;
    document.getElementById('businessCount').textContent = places.length;

    // Display parcel information
    if (parcels.length > 0) {
        displayParcelsFlat(parcels);
    }

    // Display buildings and addresses
    if (buildings.length > 0 || addresses.length > 0) {
        displayBuildingsFlat(buildings, addresses);
    }

    // Display businesses
    if (places.length > 0) {
        displayBusinesses(places);
    }

    // Display map with geometry
    if (parcels.length > 0) {
        displayMapFlat(parcels, buildings);
    }

    // Show dashboard content
    document.getElementById('dashboardContent').style.display = 'block';
}

/**
 * Display parcel information (flat structure)
 */
function displayParcelsFlat(parcels) {
    const container = document.getElementById('parcelContent');
    container.innerHTML = '';

    parcels.forEach((parcel, index) => {
        const card = document.createElement('div');
        card.className = 'info-card';

        card.innerHTML = `
            <h3>Parcel ${index + 1}</h3>
            <div class="info-row">
                <div class="info-label">Parcel ID</div>
                <div class="info-value">${parcel.pbKey || 'N/A'}</div>
            </div>
        `;

        container.appendChild(card);
    });
}

/**
 * Display buildings and addresses (with nested addresses)
 */
function displayBuildingsFlat(buildings, addresses) {
    const container = document.getElementById('buildingsContent');
    container.innerHTML = '';

    // Separate buildings with and without addresses
    const buildingsWithAddresses = buildings.filter(b => b.addresses && b.addresses.length > 0);
    const buildingsWithoutAddresses = buildings.filter(b => !b.addresses || b.addresses.length === 0);

    // Display buildings WITH addresses
    buildingsWithAddresses.forEach((building, index) => {
        const buildingAddresses = building.addresses || [];
        const addressCount = buildingAddresses.length;

        const card = document.createElement('div');
        card.className = 'info-card';

        card.innerHTML = `
            <h3>Building ${index + 1}</h3>
            <div class="info-row">
                <div class="info-label">Building ID</div>
                <div class="info-value">${building.pbKey || 'N/A'}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Total Addresses</div>
                <div class="info-value">${addressCount}</div>
            </div>
        `;

        // Add collapsible addresses section
        const addressSection = document.createElement('div');
        addressSection.style.cssText = 'margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f0f0;';

        const toggleButton = document.createElement('div');
        toggleButton.style.cssText = 'display: flex; align-items: center; justify-content: space-between; cursor: pointer; padding: 8px; background: #f8f9fa; border-radius: 4px; transition: background 0.2s;';
        toggleButton.innerHTML = `
            <strong style="color: #8017e1;">Addresses in Building (${buildingAddresses.length})</strong>
            <span class="toggle-icon" style="color: #8017e1; font-size: 20px;">▼</span>
        `;

        const addressList = document.createElement('div');
        addressList.style.cssText = 'display: none; margin-top: 12px;';
        addressList.className = 'address-list';

        buildingAddresses.forEach(addr => {
            const addressItem = document.createElement('div');
            addressItem.style.cssText = 'padding: 12px 0; border-bottom: 1px solid #f5f5f5;';
            addressItem.innerHTML = `
                <div style="font-weight: 500; color: #333; margin-bottom: 4px;">${addr.formattedAddress || 'N/A'}</div>
                <div style="font-size: 12px; color: #666;">PB_KEY: ${addr.pbKey || 'N/A'}</div>
            `;
            addressList.appendChild(addressItem);
        });

        // Toggle functionality
        toggleButton.addEventListener('click', () => {
            const icon = toggleButton.querySelector('.toggle-icon');
            if (addressList.style.display === 'none') {
                addressList.style.display = 'block';
                icon.textContent = '▲';
                toggleButton.style.background = '#e8e9f5';
            } else {
                addressList.style.display = 'none';
                icon.textContent = '▼';
                toggleButton.style.background = '#f8f9fa';
            }
        });

        // Hover effect
        toggleButton.addEventListener('mouseenter', () => {
            if (addressList.style.display === 'none') {
                toggleButton.style.background = '#e8e9f5';
            }
        });
        toggleButton.addEventListener('mouseleave', () => {
            if (addressList.style.display === 'none') {
                toggleButton.style.background = '#f8f9fa';
            }
        });

        addressSection.appendChild(toggleButton);
        addressSection.appendChild(addressList);
        card.appendChild(addressSection);

        container.appendChild(card);
    });

    // Display buildings WITHOUT addresses (grouped together)
    if (buildingsWithoutAddresses.length > 0) {
        const card = document.createElement('div');
        card.className = 'info-card';
        card.style.borderLeftColor = '#666'; // Different color to distinguish

        card.innerHTML = `
            <h3>Buildings with No Addresses</h3>
            <div class="info-row">
                <div class="info-label">Total Buildings</div>
                <div class="info-value">${buildingsWithoutAddresses.length}</div>
            </div>
            <div style="margin-top: 12px; padding: 12px; background: #f8f9fa; border-radius: 6px;">
                <div style="font-size: 14px; color: #666; font-style: italic;">
                    These may be parking lots, garages, or other structures without assigned addresses
                </div>
            </div>
        `;

        // Add collapsible building IDs section
        const buildingSection = document.createElement('div');
        buildingSection.style.cssText = 'margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f0f0;';

        const toggleButton = document.createElement('div');
        toggleButton.style.cssText = 'display: flex; align-items: center; justify-content: space-between; cursor: pointer; padding: 8px; background: #f8f9fa; border-radius: 4px; transition: background 0.2s;';
        toggleButton.innerHTML = `
            <strong style="color: #666;">View Building IDs (${buildingsWithoutAddresses.length})</strong>
            <span class="toggle-icon" style="color: #666; font-size: 20px;">▼</span>
        `;

        const buildingList = document.createElement('div');
        buildingList.style.cssText = 'display: none; margin-top: 12px;';

        buildingsWithoutAddresses.forEach((building, idx) => {
            const buildingItem = document.createElement('div');
            buildingItem.style.cssText = 'padding: 12px 0; border-bottom: 1px solid #f5f5f5;';
            buildingItem.innerHTML = `
                <div style="font-weight: 500; color: #333; margin-bottom: 4px;">Building ${idx + 1}</div>
                <div style="font-size: 12px; color: #666;">ID: ${building.pbKey || 'N/A'}</div>
            `;
            buildingList.appendChild(buildingItem);
        });

        // Toggle functionality
        toggleButton.addEventListener('click', () => {
            const icon = toggleButton.querySelector('.toggle-icon');
            if (buildingList.style.display === 'none') {
                buildingList.style.display = 'block';
                icon.textContent = '▲';
                toggleButton.style.background = '#e8e9f5';
            } else {
                buildingList.style.display = 'none';
                icon.textContent = '▼';
                toggleButton.style.background = '#f8f9fa';
            }
        });

        // Hover effect
        toggleButton.addEventListener('mouseenter', () => {
            if (buildingList.style.display === 'none') {
                toggleButton.style.background = '#e8e9f5';
            }
        });
        toggleButton.addEventListener('mouseleave', () => {
            if (buildingList.style.display === 'none') {
                toggleButton.style.background = '#f8f9fa';
            }
        });

        buildingSection.appendChild(toggleButton);
        buildingSection.appendChild(buildingList);
        card.appendChild(buildingSection);

        container.appendChild(card);
    }
}

/**
 * Display businesses
 */
function displayBusinesses(businesses) {
    const section = document.getElementById('businessesSection');
    const container = document.getElementById('businessesContent');

    section.style.display = 'block';
    container.innerHTML = '';

    businesses.forEach(place => {
        const card = document.createElement('div');
        card.className = 'business-card';

        const businessName = place.businessName || place.tradeName || 'Unnamed Business';
        const brandName = place.brandName || '';
        const address = place.formattedAddress || '';
        const phone = place.phone || '';
        const web = place.web || '';
        const email = place.email || '';
        const lineOfBusiness = place.lineOfBusiness || '';

        let detailsHTML = '<div class="business-details">';

        if (address) {
            detailsHTML += `
                <div class="business-detail-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    ${address}
                </div>
            `;
        }

        if (phone) {
            detailsHTML += `
                <div class="business-detail-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    ${phone}
                </div>
            `;
        }

        if (web) {
            detailsHTML += `
                <div class="business-detail-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    <a href="${web}" target="_blank" style="color: #8017e1; text-decoration: none;">${web.replace('https://', '').replace('http://', '')}</a>
                </div>
            `;
        }

        if (email) {
            detailsHTML += `
                <div class="business-detail-row">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    ${email}
                </div>
            `;
        }

        detailsHTML += '</div>';

        card.innerHTML = `
            <h3 class="business-name">${businessName}</h3>
            ${brandName ? `<div class="business-brand">${brandName}</div>` : ''}
            ${detailsHTML}
            ${lineOfBusiness ? `<div class="business-tag">${lineOfBusiness}</div>` : ''}
        `;

        container.appendChild(card);
    });
}

/**
 * Display map with parcel and building geometries (flat structure)
 */
function displayMapFlat(parcels, buildings) {
    const mapSection = document.getElementById('mapSection');

    // Collect all geometries
    const geometries = [];
    const allCoordinates = [];

    // Add parcel geometries
    parcels.forEach(parcel => {
        if (parcel.geometry) {
            geometries.push({
                type: 'parcel',
                geometry: parcel.geometry,
                data: parcel
            });
        }
    });

    // Add building geometries
    buildings.forEach(building => {
        if (building.geometry) {
            geometries.push({
                type: 'building',
                geometry: building.geometry,
                data: building
            });
        }
    });

    // If no geometries, don't show map
    if (geometries.length === 0) {
        return;
    }

    // Show map section
    mapSection.style.display = 'block';

    // Initialize map with a slight delay to ensure container is visible
    setTimeout(() => {
        const map = L.map('map', {
            preferCanvas: true
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Process geometries
        processMapGeometries(map, geometries, allCoordinates);
    }, 100);
}

/**
 * Process and display geometries on the map
 */
function processMapGeometries(map, geometries, allCoordinates) {
    // Layer groups for different geometry types
    const parcelLayers = L.layerGroup().addTo(map);
    const buildingLayers = L.layerGroup().addTo(map);

    // Process and display each geometry
    geometries.forEach((item, index) => {
        try {
            const geojson = item.geometry;

            // Create GeoJSON layer
            const layer = L.geoJSON(geojson, {
                style: function(feature) {
                    if (item.type === 'parcel') {
                        return {
                            color: '#8017e1',
                            weight: 3,
                            fillColor: '#8017e1',
                            fillOpacity: 0.1
                        };
                    } else {
                        return {
                            color: '#39006b',
                            weight: 2,
                            fillColor: '#39006b',
                            fillOpacity: 0.3
                        };
                    }
                },
                onEachFeature: function(feature, layer) {
                    // Create popup content
                    let popupContent = '';

                    if (item.type === 'parcel') {
                        popupContent = `
                            <div class="map-popup-title">Parcel</div>
                            <div class="map-popup-detail">ID: ${item.data.pbKey || 'N/A'}</div>
                        `;
                    } else {
                        popupContent = `
                            <div class="map-popup-title">Building</div>
                            <div class="map-popup-detail">ID: ${item.data.pbKey || 'N/A'}</div>
                        `;
                    }

                    layer.bindPopup(popupContent);
                }
            });

            // Add to appropriate layer group
            if (item.type === 'parcel') {
                layer.addTo(parcelLayers);
            } else {
                layer.addTo(buildingLayers);
            }

            // Collect bounds
            if (layer.getBounds) {
                const bounds = layer.getBounds();
                allCoordinates.push(bounds.getNorthEast());
                allCoordinates.push(bounds.getSouthWest());
            }

        } catch (error) {
            console.error('Error rendering geometry:', error, item.geometry);
        }
    });

    // Fit map to show all geometries
    if (allCoordinates.length > 0) {
        const bounds = L.latLngBounds(allCoordinates);
        map.fitBounds(bounds, { padding: [50, 50] });
    } else {
        // Default view if no bounds available
        map.setView([39.8283, -98.5795], 4); // Center of USA
    }

    // Force map to recalculate size and redraw
    setTimeout(() => {
        map.invalidateSize();
    }, 200);

    // Add layer control
    const overlays = {
        "Parcels": parcelLayers,
        "Buildings": buildingLayers
    };
    L.control.layers(null, overlays, { collapsed: false }).addTo(map);

    // Add legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'legend');
        div.style.background = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '8px';
        div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        div.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 8px;">Legend</div>
            <div style="margin-bottom: 4px;">
                <span style="display: inline-block; width: 20px; height: 3px; background: #8017e1; margin-right: 8px;"></span>
                Parcel
            </div>
            <div>
                <span style="display: inline-block; width: 20px; height: 3px; background: #39006b; margin-right: 8px;"></span>
                Building
            </div>
        `;
        return div;
    };
    legend.addTo(map);
}

/**
 * Show error state
 */
function showError(message) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}
