# Precisely Cloud Native Template - Overview

This template was created from the geo-tax project to serve as a reusable starting point for building Precisely API-based web applications.

## What's Included

### Core Application Files
- **server.js** - Express.js server with secure API proxy pattern
- **index.html** - Landing page with CloudNative V2 design
- **styles.css** - CloudNative V2 color theme and responsive styling
- **app.js** - Reusable JavaScript utilities for API integration
- **onetrust.js** - OneTrust cookie consent integration

### Design System
- **dist/** - Complete Precisely Design System v13.1.0
  - CSS files (minified and source)
  - Precisely custom fonts (Regular, Demi, Light, Bold, etc.)
  - CloudNative V2 theme assets
  - SCSS variables and mixins

### Configuration Files
- **.env.example** - Environment variable template
- **package.json** - Node.js dependencies and scripts
- **.gitignore** - Git ignore rules (protects .env)
- **.dockerignore** - Docker ignore rules

### Docker Support
- **Dockerfile** - Production-ready container configuration
  - Node.js 18 Alpine base
  - Health check included
  - Optimized for production

### Documentation
- **README.md** - Complete documentation with 5-minute setup and customization guide
- **CLAUDE.md** - AI assistant context for architectural patterns
- **TEMPLATE_OVERVIEW.md** - This file

## Key Features Extracted from geo-tax

### 1. Design System Integration
- Precisely Design System v13.1.0
- CloudNative V2 color palette (purple gradient: #8017e1 to #39006b)
- Precisely custom fonts
- Responsive design with mobile-first approach

### 2. Security Architecture
- API key stored server-side only (never exposed to browser)
- Backend proxy pattern for all API calls
- Environment variable configuration
- CORS enabled for development

### 3. API Integration Pattern
- Reusable `callAPI()` function with timeout and error handling
- Standard proxy endpoint template
- Example implementations (Autocomplete, Express Autocomplete)
- Easy to add new endpoints

### 4. Developer Experience
- Hot reload with nodemon (`npm run dev`)
- Clear error messages
- Comprehensive documentation
- Docker support for deployment

### 5. Production Ready
- Health check endpoint
- Error handling at all layers
- Environment-based configuration
- Docker containerization

## CloudNative V2 Color Theme

```css
/* Primary Gradient */
background: linear-gradient(135deg, #8017e1 0%, #39006b 100%);

/* Footer Dark Purple */
background-color: #3A0069;

/* Accent Purple */
color: #8017e1;

/* Text on Purple Backgrounds */
color: white;
```

## Template vs. Original Project

### What Was Removed
- Geo-tax specific code (dashboard, tax calculations)
- Geo-tax specific API endpoints (geo-tax address/location)
- Application-specific business logic
- Dashboard HTML/CSS/JS files

### What Was Kept
- Design system (complete)
- Landing page structure
- Color theme and styling patterns
- API proxy architecture
- Security patterns
- OneTrust integration
- Docker configuration
- Development workflow

### What Was Added
- Generic API utility functions
- Template comments and examples
- Comprehensive documentation for reuse
- Quick start guide
- AI assistant context (CLAUDE.md)

## Use Cases

This template is ideal for:

1. **Internal Tools** - Build Precisely API integrations for your organization
2. **Proof of Concepts** - Quickly demo Precisely API capabilities
3. **Production Apps** - Full-featured starting point with security built-in
4. **Learning** - Understand best practices for API integration
5. **Prototyping** - Rapidly test ideas with Precisely data

## Precisely APIs Supported

The template structure supports any Precisely Cloud API:
- Autocomplete / Express Autocomplete (included as examples)
- Geocoding
- GeoTax
- Demographics
- Points of Interest
- Property
- And more...

Simply add a proxy endpoint in `server.js` following the template pattern.

## Technology Stack

### Backend
- Node.js 18+
- Express.js 4.18.2
- dotenv for environment variables
- node-fetch for API calls
- CORS middleware

### Frontend
- Vanilla JavaScript (ES6+)
- Precisely Design System v13.1.0
- Custom CloudNative V2 theme
- OneTrust cookie consent

### DevOps
- Docker (Node 18 Alpine)
- Health checks
- Environment-based configuration
- Production-ready deployment

## File Size Reference

| File | Lines | Purpose |
|------|-------|---------|
| server.js | 196 | Backend API proxy |
| app.js | 267 | Frontend utilities |
| index.html | 100 | Landing page |
| styles.css | 373 | Theme styles |
| README.md | ~400 | Full documentation with quick start |
| CLAUDE.md | ~450 | AI context |

## Dependencies

### Production
- express: ^4.18.2
- cors: ^2.8.5
- dotenv: ^16.3.1
- node-fetch: ^2.7.0

### Development
- nodemon: ^3.0.2

Total: 5 direct dependencies (minimal footprint)

## Getting Started

```bash
# 1. Copy template to new project
cp -r cloud-native-template my-new-project

# 2. Navigate to project
cd my-new-project

# 3. Install dependencies
npm install

# 4. Configure environment
cp .env.example .env
# Edit .env and add your PRECISELY_API_KEY

# 5. Start development server
npm run dev

# 6. Open browser
# http://localhost:3000
```

## Customization Checklist

- [ ] Update project name in `package.json`
- [ ] Add your Precisely API key to `.env`
- [ ] Customize landing page title and content in `index.html`
- [ ] Add your API endpoints in `server.js`
- [ ] Modify color theme in `styles.css` (if needed)
- [ ] Update footer legal links in `index.html`
- [ ] Add your custom JavaScript logic in `app.js`
- [ ] Test health endpoint: `http://localhost:3000/api/health`

## Support

- Full documentation with quick start: See `README.md`
- Architecture details: See `CLAUDE.md`
- Precisely Developer Portal: https://developer.cloud.precisely.com/

## Version

Template Version: 1.0.0
Based on: geo-tax project (October 2025)
Design System: Precisely Design System v13.1.0
Theme: CloudNative V2

## License

Copyright 2015, 2025 Precisely. All rights reserved.

---

**Ready to build amazing location intelligence applications!**
