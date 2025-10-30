# Project Structure

Complete overview of the project organization and file structure.

## Directory Layout

```
precisely-cloud-native-template/
├── src/                          # Source code
│   ├── config/                   # Configuration management
│   │   └── index.js             # Centralized config
│   ├── routes/                   # API route handlers
│   │   ├── autocomplete.routes.js
│   │   ├── nlp-search.routes.js
│   │   └── data-graph.routes.js
│   ├── services/                 # Business logic services
│   │   ├── gliner.service.js    # GLiNER microservice client
│   │   └── precisely.service.js # Precisely API client
│   ├── utils/                    # Utility functions
│   │   └── regex-cleaner.js     # Query cleaning utility
│   └── app.js                    # Express app factory
├── public/                       # Static frontend assets
│   ├── index.html               # Main HTML page
│   ├── js/                      # JavaScript files
│   │   ├── app.js               # Main frontend app
│   │   └── onetrust.js          # OneTrust cookie consent
│   ├── css/                     # Stylesheets
│   │   └── styles.css           # Custom styles
│   ├── dist/                    # Precisely Design System
│   └── assets/                  # Images, fonts, etc.
├── scripts/                     # Utility scripts
│   ├── setup.sh                # Project setup
│   ├── start.sh                # Production start
│   └── dev.sh                  # Development start
├── deployment/                  # Deployment configs
│   ├── Dockerfile              # Production Docker image
│   └── docker-compose.yml      # Docker Compose config
├── docs/                        # Documentation
│   ├── API.md                  # API documentation
│   ├── PROJECT_STRUCTURE.md    # This file
│   ├── ARCHITECTURE.md         # Architecture overview
│   └── DEPLOYMENT.md           # Deployment guide
├── tests/                       # Tests (future)
├── server.js                    # Server entry point
├── package.json                 # NPM dependencies
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore patterns
├── README.md                    # Project overview
└── CLAUDE.md                    # Claude Code instructions
```

## Core Files

### Entry Point
- **`server.js`**: Main entry point. Creates app and starts HTTP server.

### Application Factory
- **`src/app.js`**: Express application factory. Configures middleware and routes.

### Configuration
- **`src/config/index.js`**: Centralized configuration management. Loads and validates environment variables.

### Routes
- **`src/routes/*.routes.js`**: HTTP route handlers for each API endpoint group.

### Services
- **`src/services/*.service.js`**: Business logic for external service integration.

### Utilities
- **`src/utils/*.js`**: Reusable utility functions.

## Module Organization

### Backend Architecture

```
┌─────────────┐
│  server.js  │ ← Entry point
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   src/app.js│ ← Express app factory
└──────┬──────┘
       │
       ├─────► Routes ────► Services ────► External APIs
       │                                    (Precisely, GLiNER)
       └─────► Config
               Utils
```

### Route → Service Pattern

```javascript
// Route (thin): HTTP handling only
router.post('/api/nlp-search', async (req, res) => {
    const result = await nlpSearchService.search(req.body);
    res.json(result);
});

// Service (thick): Business logic
async function search({ query, threshold }) {
    const extracted = await glinerService.extract(query, threshold);
    const results = await preciselyService.autocomplete(extracted);
    return { results, metadata: { ... } };
}
```

## Frontend Organization

### File Structure
- **`public/index.html`**: Main HTML page
- **`public/js/app.js`**: Frontend application logic
- **`public/css/styles.css`**: Custom styles (extends Design System)
- **`public/dist/`**: Precisely Design System v13.1.0

### Frontend Architecture

```
┌──────────────────┐
│   index.html     │
└────────┬─────────┘
         │
         ├──► js/app.js        ← Main app logic
         ├──► css/styles.css   ← Custom styles
         └──► dist/            ← Design System
              ├── css/designsystem.min.css
              └── fonts/
```

## Configuration Management

Environment variables are managed through:

1. **`.env.example`**: Template with all variables
2. **`.env`**: Local overrides (git-ignored)
3. **`src/config/index.js`**: Typed configuration object

```javascript
config.precisely.apiKey    // PRECISELY_API_KEY
config.server.port         // PORT
config.services.gliner.url // GLINER_SERVICE_URL
```

## Deployment Files

### Docker
- **`Dockerfile`**: Multi-stage production image (root directory)
- **`deployment/docker-compose.yml`**: Orchestration config

### Scripts
- **`scripts/setup.sh`**: Initial project setup
- **`scripts/start.sh`**: Production server start
- **`scripts/dev.sh`**: Development server with auto-reload

## Design Principles

### 1. Separation of Concerns
- Routes handle HTTP
- Services contain business logic
- Utilities are pure functions

### 2. Modularity
- Each route file handles one functional area
- Services are independently testable
- Configuration is centralized

### 3. Clarity
- Descriptive file names
- Clear folder structure
- Documented code

### 4. Production-Ready
- Error handling at all layers
- Health checks
- Docker support
- Graceful shutdown

## Adding New Features

### New API Endpoint

1. Create route file: `src/routes/my-feature.routes.js`
2. Create service (if needed): `src/services/my-feature.service.js`
3. Register route in `src/app.js`

### New External Service

1. Create service: `src/services/external-api.service.js`
2. Add config: `src/config/index.js`
3. Use in routes

### New Utility

1. Create file: `src/utils/my-utility.js`
2. Export functions
3. Import where needed

## Testing (Future)

```
tests/
├── unit/                # Unit tests
│   ├── services/
│   ├── utils/
│   └── routes/
└── integration/         # Integration tests
    └── api/
```

## Documentation Updates

When adding features, update:
1. `docs/API.md` - API endpoints
2. `docs/ARCHITECTURE.md` - Architecture changes
3. `README.md` - Quick start guide
4. `CLAUDE.md` - Claude Code instructions
