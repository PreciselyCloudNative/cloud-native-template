/**
 * OneTrust Cookie Consent Service (Vanilla JavaScript)
 * Adapted from CloudNativeV2 Angular implementation
 */

class OneTrustService {
    constructor() {
        this.oneTrustScriptId = '0198a488-f271-732a-a24b-49bbbb2e15f2'; // Production script ID
    }

    /**
     * Load OneTrust script dynamically
     */
    loadOneTrustScript() {
        // Check if script is already loaded
        if (document.getElementById('onetrust-sdk-script')) {
            console.log('OneTrust script already loaded');
            return;
        }

        // Warning for localhost - OneTrust may not persist consent on localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.warn('⚠️ OneTrust Cookie Consent running on localhost');
            console.warn('⚠️ Consent may NOT persist due to domain restrictions');
            console.warn('💡 For full testing, use production domain or contact OneTrust admin to whitelist localhost');
        }

        // Create and append OneTrust SDK script
        const script = document.createElement('script');
        script.id = 'onetrust-sdk-script';
        script.src = 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js';
        script.type = 'text/javascript';
        script.setAttribute('data-domain-script', this.oneTrustScriptId);

        // Add to document head
        document.head.appendChild(script);

        // Initialize OptanonWrapper function
        window.OptanonWrapper = function() {
            console.log('OneTrust Consent Banner Loaded');
            console.log('OneTrust object available:', typeof window.OneTrust !== 'undefined');

            // Track consent changes
            if (window.OneTrust && window.OneTrust.OnConsentChanged) {
                window.OneTrust.OnConsentChanged(function() {
                    console.log('✅ Consent Changed - User made a choice');
                    console.log('Banner closed:', window.OneTrust.IsAlertBoxClosed());
                    console.log('Consent saved in localStorage:', localStorage.getItem('OptanonConsent'));
                });
            }

            // Debug: Log when banner is interacted with
            console.log('To debug consent, run: window.OneTrust.GetDomainData()');
        };

        console.log('OneTrust script loaded with domain ID:', this.oneTrustScriptId);
    }

    /**
     * Show cookie preference center
     */
    showPreferenceCenter() {
        if (window.OneTrust) {
            window.OneTrust.ToggleInfoDisplay();
        } else {
            console.warn('OneTrust is not loaded yet');
        }
    }

    /**
     * Get current consent status
     */
    getConsentStatus() {
        if (window.OneTrust && window.OneTrust.GetDomainData) {
            return window.OneTrust.GetDomainData();
        }
        return null;
    }

    /**
     * Check if a specific cookie category is consented
     * @param categoryId - OneTrust category ID (e.g., 'C0001' for Strictly Necessary)
     * Common categories:
     * - C0001: Strictly Necessary Cookies
     * - C0002: Performance Cookies
     * - C0003: Functional Cookies
     * - C0004: Targeting Cookies
     * - C0005: Social Media Cookies
     */
    hasConsent(categoryId) {
        if (window.OneTrust && window.OneTrust.IsAlertBoxClosed()) {
            const activeGroups = window.OneTrust.GetDomainData().Groups;
            const category = activeGroups.find(g => g.CustomGroupId === categoryId);
            return category ? category.HasConsent : false;
        }
        return false;
    }
}

// Create global instance
const oneTrustService = new OneTrustService();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        oneTrustService.loadOneTrustScript();
    });
} else {
    oneTrustService.loadOneTrustScript();
}

// Function to open cookie settings (called from footer link)
function openCookieSettings() {
    oneTrustService.showPreferenceCenter();
}
