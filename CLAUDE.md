# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a production-ready web application that integrates with Precisely Cloud APIs, featuring AI-powered address extraction and data visualization. It provides a secure, modular foundation with the Precisely Design System v13.1.0 and CloudNative V2 theme.

**Key Features**:
- 🔍 Address Autocomplete with Express and Standard modes
- 🤖 NLP-powered natural language address search with GLiNER integration
- 📊 Data Graph API for relationship exploration
- 🔒 Security-hardened Docker container (Node 20, OpenSSL 3.3.5+, npm 10.9.3)
- 🏗️ Modular MVC architecture with separation of concerns
- ⚡ Production-ready with health checks and graceful shutdown
- 📱 Multiple UI pages (landing page, dashboard) with Precisely Design System

**Architecture**:
- **Backend**: Node.js 20 + Express with modular route/service structure
- **Frontend**: Vanilla JS with Precisely Design System v13.1.0
- **AI Services**: Optional GLiNER integration for NER-based address extraction
- **Deployment**: Docker with multi-stage builds, security scanning, and health checks

## Quick Commands

```bash
# Development
cp .env.example .env           # Copy environment template (add your API key)
npm install                    # Install dependencies
npm run dev                    # Development with auto-restart (recommended)
npm start                      # Production server

# Testing API Endpoints
curl http://localhost:3000/api/health                              # Health check

# Autocomplete
curl -X POST http://localhost:3000/api/autocomplete \
  -H "Content-Type: application/json" \
  -d '{"preferences":{"maxResults":5},"address":{"addressLines":["123 main"],"country":"USA"}}'

# Express Autocomplete
curl -X POST http://localhost:3000/api/express-autocomplete \
  -H "Content-Type: application/json" \
  -d '{"preferences":{"maxResults":5},"address":{"addressLines":["123 main"],"country":"USA"}}'

# NLP Search (natural language queries)
curl -X POST http://localhost:3000/api/nlp-search \
  -H "Content-Type: application/json" \
  -d '{"query":"find addresses near 123 main street in new york"}'

# Data Graph
curl -X POST http://localhost:3000/api/data-graph \
  -H "Content-Type: application/json" \
  -d '{"address":"123 Main St, New York, NY"}'

# Docker
docker build -t cloud-native-app .
docker run -d -p 3000:3000 \
  -e PRECISELY_API_KEY=your_key \
  -e USE_LLM_EXTRACTION=false \
  --name cloud-native-app \
  cloud-native-app
docker logs cloud-native-app              # View logs
docker scout cves cloud-native-app        # Security scan
```

## Core Architecture

### Modular MVC Structure

The application follows a clean separation of concerns with modular architecture:

```
server.js                    # Entry point, server initialization
src/
├── app.js                   # Express app factory, middleware setup
├── config/
│   └── index.js            # Centralized configuration management
├── routes/                  # Route handlers (thin controllers)
│   ├── autocomplete.routes.js
│   ├── nlp-search.routes.js
│   └── data-graph.routes.js
├── services/                # Business logic layer
│   ├── precisely.service.js # Precisely API integration
│   └── gliner.service.js   # GLiNER AI service integration
├── middleware/              # Custom middleware
└── utils/                   # Helper functions
public/                      # Static frontend assets
├── index.html              # Landing page
├── dashboard.html          # Dashboard UI
├── css/                    # Custom styles
├── js/                     # Frontend JavaScript
└── dist/                   # Precisely Design System assets
deployment/                  # Docker Compose, security reports
```

### Secure API Proxy Pattern

**Critical Concept**: The backend acts as a security proxy to hide the Precisely API key from browsers.

**Request Flow**:
```
Browser → /api/* endpoints → Routes → Services → Precisely Cloud APIs
```

**Implementation Details**:
- **server.js**: Entry point, starts HTTP server with graceful shutdown
- **src/app.js**: Express app factory with middleware and route registration
- **src/config/**: Environment variable validation and configuration management
- **src/routes/**: Route handlers that delegate to services
- **src/services/precisely.service.js**: Precisely API integration with error handling
- Health check at `/api/health` returns server status

### Adding New API Endpoints

**Step 1**: Create a new route file in `src/routes/`:

```javascript
// src/routes/geocode.routes.js
const express = require('express');
const router = express.Router();
const preciselyService = require('../services/precisely.service');

router.post('/geocode', async (req, res, next) => {
    try {
        const result = await preciselyService.geocode(req.body);
        res.json(result);
    } catch (error) {
        next(error);  // Pass to global error handler
    }
});

module.exports = router;
```

**Step 2**: Add service method in `src/services/precisely.service.js`:

```javascript
async geocode(payload) {
    const response = await fetch(`${this.baseUrl}/geocode`, {
        method: 'POST',
        headers: {
            'Authorization': `Apikey ${config.precisely.apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Geocode API failed: ${response.status} - ${error}`);
    }

    return response.json();
}
```

**Step 3**: Register route in `src/app.js`:

```javascript
const geocodeRoutes = require('./routes/geocode.routes');
app.use('/api', geocodeRoutes);
```

### Frontend API Integration

**Reusable Utilities** (app.js):
- `callAPI(endpoint, payload, options)` - Generic API caller with timeout and error handling (lines 44-82)
- `showError(message)` - Display errors to user (lines 88-96)
- `showSuccess(message)` - Display success messages (lines 98-106)
- `showLoading(show)` - Toggle loading indicators (lines 108-116)

**Configuration** (app.js:16-31):
- API endpoint paths defined in `CONFIG.API_ENDPOINTS`
- Request timeout: 30 seconds (CONFIG.TIMEOUT)
- Debounce delay: 400ms (CONFIG.DEBOUNCE_DELAY)

**API Call Pattern**:
```javascript
async function myFeature() {
    try {
        showLoading(true);
        const result = await callAPI('/api/my-endpoint', { data: 'value' });
        showSuccess('Operation completed!');
        return result;
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}
```

## Design System

### CSS Loading Order
1. `dist/css/designsystem.min.css` - Precisely Design System (loaded first)
2. `styles.css` - Custom theme overrides (loaded second)

### CloudNative V2 Color Palette
```css
/* Primary Gradient */
background-image: linear-gradient(135deg, #8017e1 0%, #39006b 100%);

/* Dark Purple Footer */
background-color: #3A0069;

/* Accent Color */
color: #8017e1;

/* Text on Purple */
color: white;
```

### Available Components
- Bootstrap 4.5.2 utilities (bundled in design system)
- Precisely custom components
- Responsive grid system (12-column)
- Form controls and buttons
- Typography using 'Precisely_Regular' font family

### File Structure
```
dist/
├── css/
│   ├── designsystem.min.css        # Full design system
│   └── scss/                       # SCSS source files
├── fonts/
│   ├── Precisely_Regular.woff2
│   ├── Precisely_Demi.woff2
│   └── ... (other font variants)
└── cloud-native-v2/                # CloudNative V2 theme assets
    ├── main.*.js
    ├── runtime.*.js
    └── polyfills.*.js
```

## File Organization

### Backend Core Files

**server.js** (~49 lines):
- Server entry point with graceful shutdown handlers
- Creates Express app using factory pattern from src/app.js
- Validates configuration on startup
- Displays startup banner with available endpoints

**src/app.js** (~92 lines):
- Express application factory (createApp function)
- Middleware configuration (CORS, JSON parsing, static files)
- Route registration for all API endpoints
- Global error handling and 404 handler

**src/config/index.js**:
- Centralized configuration management
- Environment variable loading and validation
- Configuration validation with helpful error messages
- Exports typed config object for use throughout app

**src/services/precisely.service.js** (~200 lines):
- Precisely API integration service
- Methods: autocomplete, expressAutocomplete, dataGraph
- Consistent error handling and response parsing
- API key management and request formatting

**src/services/gliner.service.js**:
- GLiNER AI service integration for NER-based address extraction
- Optional service (enabled via USE_LLM_EXTRACTION env var)
- Fallback to regex patterns when GLiNER unavailable

### API Routes

**src/routes/autocomplete.routes.js**:
- POST /api/autocomplete - Standard address autocomplete
- POST /api/express-autocomplete - Fast autocomplete with minimal data
- Delegates to precisely.service.js

**src/routes/nlp-search.routes.js**:
- POST /api/nlp-search - Natural language address search
- Integrates GLiNER for entity extraction or uses regex fallback
- Returns structured address suggestions from natural language queries

**src/routes/data-graph.routes.js**:
- POST /api/data-graph - Relationship data for addresses
- Returns connected data and insights

### Frontend Files

**public/index.html**:
- Landing page with hero section, features, and CTA
- Precisely Design System integration
- CloudNative V2 theme styling

**public/dashboard.html**:
- Interactive dashboard for address search and visualization
- Demo UI for all API endpoints
- Real-time result display

**public/js/**: Frontend JavaScript modules
**public/css/**: Custom stylesheets
**public/dist/**: Precisely Design System assets (fonts, CSS, JS)

### Configuration Files

**.env** (never commit this file):
```bash
# Required
PRECISELY_API_KEY=your_key       # Get from developer.cloud.precisely.com

# Optional Server Settings
PORT=3000                         # Server port, defaults to 3000
NODE_ENV=development              # development, production, or test

# Optional AI/NLP Features
USE_LLM_EXTRACTION=false          # Enable GLiNER AI address extraction (requires GLiNER service)
GLINER_SERVICE_URL=http://localhost:5001  # GLiNER microservice endpoint
```

**package.json**:
- Production dependencies: express, cors, dotenv, node-fetch
- Development dependencies: nodemon
- Scripts:
  - `npm start` - Production server
  - `npm run dev` - Development with auto-restart

**Dockerfile** (68 lines):
- **Base Image**: Node 20 Alpine (LTS until 2026)
- **Security Hardening**:
  - OpenSSL 3.3.5+ (fixes CVE-2025-9230, CVE-2025-9231)
  - npm 10.9.3 (fixes CVE-2024-21538 in cross-spawn)
  - Alpine package upgrades via `apk upgrade`
- **Multi-stage Build**: Separate dependency and production stages
- **Non-root User**: Runs as nodejs user (UID 1001)
- **Health Check**: GET `/api/health` every 30s
- **Port**: Exposes 3000
- **Size**: ~65 MB (optimized)

**deployment/** directory:
- `docker-compose.yml` - Docker Compose configuration
- `SECURITY_FIXES_SUMMARY.md` - Security vulnerability fixes documentation
- `vulnerability-report-*.md` - Docker Scout security scan reports
- `vulnerability-report-*.sarif` - SARIF format for CI/CD integration

## Common Development Workflows

### Enabling GLiNER AI Address Extraction

The application supports optional AI-powered address extraction using GLiNER (Generalist Named Entity Recognition).

**Step 1**: Start the GLiNER service (separate microservice):
```bash
cd ../ai-address-locator
python run.py
# Service runs on http://localhost:5001
```

**Step 2**: Enable in your `.env`:
```bash
USE_LLM_EXTRACTION=true
GLINER_SERVICE_URL=http://localhost:5001
```

**Step 3**: Test NLP search:
```bash
curl -X POST http://localhost:3000/api/nlp-search \
  -H "Content-Type: application/json" \
  -d '{"query":"find me properties near 350 jordan road in Troy NY"}'
```

The system automatically falls back to regex extraction if GLiNER is unavailable.

### Running with Docker Compose

For local development with all services:

```bash
# Using deployment/docker-compose.yml
cd deployment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Security Scanning

The project includes security scanning with Docker Scout:

```bash
# Build image
docker build -t my-app .

# Scan for vulnerabilities
docker scout cves my-app

# View only high/critical
docker scout cves my-app --only-severity high,critical

# Generate reports
docker scout cves my-app --format markdown > deployment/security-report.md
docker scout cves my-app --format sarif > deployment/security-report.sarif
```

See `deployment/SECURITY_FIXES_SUMMARY.md` for details on resolved vulnerabilities.

## Architecture Decisions

### Why Backend Proxy?
- **Security**: API keys never exposed to browser/client
- **Control**: Single point for rate limiting, logging, caching
- **Flexibility**: Easy to swap APIs or add middleware
- **Compliance**: Centralized audit trail for API calls

### Why Minimal Dependencies?
- **express**: Industry standard, lightweight, excellent documentation
- **cors**: Simple CORS handling for dev and prod
- **dotenv**: Standard for environment variable management
- **node-fetch**: Familiar fetch API in Node.js
- **nodemon**: Developer experience for auto-restart

Only 5 direct dependencies total for minimal attack surface and easy maintenance.

### Why Modular Architecture?
- **Separation of Concerns**: Routes, services, and config are isolated
- **Testability**: Each module can be tested independently
- **Maintainability**: Clear responsibility boundaries
- **Scalability**: Easy to add new features without touching existing code
- **Team Collaboration**: Multiple developers can work on different modules
- **Production-Ready**: Industry-standard patterns, Docker, env validation, error handling

### Why Node 20?
- **Long-term Support**: LTS until April 2026
- **Security**: Latest security patches and vulnerability fixes
- **Performance**: V8 engine improvements and optimizations
- **Modern Features**: Native fetch, test runner, watch mode
- **Ecosystem**: Better npm compatibility (10.9.3+ includes security fixes)

## Security Features

### Docker Security Hardening

The Dockerfile has been security-hardened to eliminate all HIGH and MEDIUM severity vulnerabilities:

**Fixed Vulnerabilities**:
- ✅ CVE-2024-21538 (HIGH) - cross-spawn regex complexity - Fixed by npm 10.9.3
- ✅ CVE-2025-9230 (HIGH) - OpenSSL vulnerability - Fixed by OpenSSL 3.3.5-r0
- ✅ CVE-2025-9231 (MEDIUM) - OpenSSL vulnerability - Fixed by OpenSSL 3.3.5-r0

**Security Measures**:
- Node 20 Alpine base (latest security patches)
- Explicit OpenSSL version pinning (≥3.3.5-r0)
- npm upgraded to 10.9.3 (fixes cross-spawn vulnerability)
- Alpine package upgrades via `apk upgrade`
- Non-root user (nodejs:nodejs, UID 1001)
- Multi-stage build (minimal attack surface)
- No build tools in production image

**Verification**:
```bash
docker scout cves your-image  # Should show 0 HIGH, 0 MEDIUM vulnerabilities
```

See `deployment/SECURITY_FIXES_SUMMARY.md` for detailed report.

## Security Best Practices

### Implemented ✅
1. **API Key Protection** - Never exposed to browser, server-side only
2. **Environment Variables** - `.env` in `.gitignore`, never committed
3. **Non-root Container** - Runs as nodejs user (UID 1001)
4. **Security Scanning** - Docker Scout integration for CI/CD
5. **Dependency Updates** - Regular `npm audit` and security patches
6. **Input Validation** - Configuration validated on startup
7. **Error Handling** - Global error handler, no stack traces in production
8. **CORS Configuration** - Configured for security

### Recommended for Production 🔒
1. **HTTPS/TLS** - Use reverse proxy (nginx, Traefik) with SSL certificates
2. **Rate Limiting** - Add `express-rate-limit` middleware
3. **Helmet.js** - Add security headers
4. **API Request Logging** - Monitor and audit API usage
5. **Secrets Management** - Use HashiCorp Vault, AWS Secrets Manager, or similar
6. **Container Registry Scanning** - Scan images before deployment
7. **Network Policies** - Restrict container networking in Kubernetes
8. **Regular Updates** - Rebuild images monthly for security patches

## Troubleshooting

### Configuration Issues

**"API key not configured" or "PRECISELY_API_KEY is required"**
```bash
# Copy example env file
cp .env.example .env

# Add your API key (get from https://developer.cloud.precisely.com/)
# Edit .env and set: PRECISELY_API_KEY=your_actual_key

# Restart server
npm run dev
```

**"Module not found" errors**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Network Issues

**CORS errors**
- CORS is enabled by default in `src/app.js`
- Check browser console for specific error details
- Verify frontend is accessing correct backend URL

**Port already in use (EADDRINUSE)**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
lsof -ti:3000 | xargs kill

# Or use different port in .env
PORT=3001
```

### Development Issues

**Changes not appearing**
- **Frontend changes**: Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
- **Backend changes**: Should auto-reload with `npm run dev`
- **Environment variables**: Restart server after changing `.env`

**Static files not loading (404 errors)**
- Verify files exist in `public/` directory
- Check `src/app.js` has static file middleware configured
- Ensure paths in HTML are relative (e.g., `/css/style.css` not `css/style.css`)

### GLiNER / NLP Search Issues

**"GLiNER service unavailable" or NLP search not working**
- This is expected if `USE_LLM_EXTRACTION=false` (default)
- System automatically falls back to regex-based extraction
- To enable GLiNER:
  ```bash
  # Start GLiNER service (separate repo)
  cd ../ai-address-locator
  python run.py

  # Enable in .env
  USE_LLM_EXTRACTION=true
  GLINER_SERVICE_URL=http://localhost:5001
  ```

### Docker Issues

**Build fails with "npm error engine Unsupported"**
- Ensure Dockerfile uses `node:20-alpine` (not node:18)
- Check line 7 and line 27 in Dockerfile

**Container exits immediately**
```bash
# Check logs
docker logs container_name

# Common causes:
# - Missing PRECISELY_API_KEY environment variable
# - Port 3000 already in use on host
```

**Health check failing**
```bash
# Test health endpoint
docker exec container_name curl http://localhost:3000/api/health

# Should return: {"status":"ok","message":"Server is running","timestamp":"..."}
```

## References

### Precisely Resources
- **Developer Portal**: https://developer.cloud.precisely.com/
- **API Documentation**: https://developer.cloud.precisely.com/apis
- **Design System**: https://design.precisely.com/
- **Support**: https://support.precisely.com/

### Node.js & Express
- **Node.js Documentation**: https://nodejs.org/docs/latest-v20.x/api/
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices
- **Express.js Documentation**: https://expressjs.com/

### Security
- **Docker Scout**: https://docs.docker.com/scout/
- **Node.js Security Best Practices**: https://nodejs.org/en/learn/getting-started/security-best-practices
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **npm Audit**: https://docs.npmjs.com/cli/v10/commands/npm-audit

### AI/NLP Integration
- **GLiNER**: https://github.com/urchade/GLiNER (Generalist Named Entity Recognition)
- **spaCy**: https://spacy.io/ (NLP framework alternative)
