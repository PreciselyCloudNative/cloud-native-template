# Precisely Cloud Native Template

A production-ready, modular web application template for building location-intelligence applications with Precisely Cloud APIs. Features a secure API proxy architecture, AI-powered address extraction, and the Precisely Design System v13.1.0.

## ✨ Features

- **🔒 Secure API Proxy**: API keys never exposed to browser
- **🎯 AI Address Extraction**: Natural language to structured addresses (Developed by Precisely using trained LLM)
- **⚡ Real-time Autocomplete**: Address suggestions as you type
- **🎨 Precisely Design System**: Professional UI with CloudNative V2 theme
- **📦 Modular Architecture**: Clean separation of concerns, production-ready code
- **🐳 Docker Ready**: Multi-stage builds, Docker Compose support
- **📊 Data Graph Integration**: Rich building, parcel, and place data
- **🚀 Production-Ready**: Health checks, error handling, graceful shutdown

## 🚀 5-Minute Setup

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **NPM** 8+
- **Precisely API Key** ([Get one](https://developer.cloud.precisely.com/))

Choose your setup method:

### Option 1: Using Claude Code (Recommended)

Claude Code can help you set up the project with AI assistance.

**1. Open the project directory in your terminal, then ask Claude Code:**

```
Install the dependencies for this project
```

Claude Code will run `npm install` for you.

**2. Ask Claude Code to configure your API key:**

```
Copy .env.example to .env and help me configure it
```

Then provide your API key when prompted. Claude Code will:
- Copy the example file
- Help you edit it with your API key
- Validate the configuration

**Important:** When configuring `.env`, set the AI Address Extraction option:
- If the **AI Address Extraction service is running** on port 5001, set `USE_LLM_EXTRACTION=true`
- Otherwise, keep `USE_LLM_EXTRACTION=false` (the NLP search will still work with regex fallback)

**3. Start the development server:**

```
Start the development server
```

Claude Code will run `npm run dev` and confirm when it's running.

**4. Open in Browser**

Navigate to: http://localhost:3000

You should see the landing page with address search functionality!

### Option 2: Manual Setup

**1. Install Dependencies**

```bash
npm install
```

**2. Configure API Key**

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Precisely API key
# Use your favorite text editor:
nano .env
# or
code .env
```

Your `.env` file should look like:
```env
PRECISELY_API_KEY=your_actual_api_key_here
PORT=3000
NODE_ENV=development

# AI Address Extraction (Optional)
# If the AI Address Extraction service is running on port 5001:
USE_LLM_EXTRACTION=true
GLINER_SERVICE_URL=http://localhost:5001

# Otherwise, keep it disabled (NLP search will still work with regex fallback):
# USE_LLM_EXTRACTION=false
```

**Important:**
- Set `USE_LLM_EXTRACTION=true` **only if** the AI Address Extraction service is running on port 5001
- Otherwise, keep `USE_LLM_EXTRACTION=false` (Natural Language Search will still work using regex fallback)

**3. Start Development Server**

```bash
npm run dev
```

**4. Open in Browser**

Navigate to: http://localhost:3000

You should see the landing page with address search functionality!

## 🎯 Next Steps

### Customize the Landing Page

#### With Claude Code:

Simply ask Claude Code to make changes for you:

```
Change the app title to "My Address Finder" and update the hero heading
```

```
Change the color scheme from purple to blue
```

```
Add a new feature card about geocoding to the landing page
```

Claude Code will:
- Read the relevant files (`public/index.html`, `public/css/styles.css`)
- Make the changes following the existing design patterns
- Explain what was changed

#### Manual Development:

**Update branding** in `public/index.html`:
- Line 6: Change `<title>` to your app name
- Lines 15-20: Update hero heading and subtitle
- Lines 40-75: Customize feature cards

**Change colors** in `public/css/styles.css`:
- Line 26: Main gradient background
- Line 157: Accent color for buttons/links
- Line 227: Footer background

### Add a New API Endpoint

#### With Claude Code:

**Recommended:** Provide Claude Code with the Postman curl command for quick integration:

```
Add a new geocoding endpoint using this curl:

curl --location 'https://api.cloud.precisely.com/v1/geocode' \
--header 'Authorization: Apikey YzM5NGJiYWEyODJjYTFkZjo2ajJwMXByeEs4azdmRHhXY3M3bWdkOTZjZk9tR1FiOQ==' \
--header 'Content-Type: application/json' \
--data '{
    "preferences": {
        "returnAllInfo": true
    },
    "addresses": [
        {
            "addressLines": [
                "25504 W Veranium Drive, Plainfield, IL"
            ],
            "country": "USA"
        }
    ]
}'
```

**Or ask in natural language:**

```
Add a reverse geocoding endpoint to convert lat/lng to addresses
```

```
Integrate the Precisely GeoTax API as a new endpoint
```

Claude Code will:
- Parse the curl command to understand the API structure
- Create the route in `src/routes/`
- Add service logic in `src/services/`
- Update the frontend to call the new endpoint
- Follow the existing architectural patterns
- Add error handling and validation

#### Manual Development:

1. **Backend** - Add route in `src/routes/` following existing patterns
2. **Service** - Add business logic in `src/services/`
3. **Frontend** - Call from `public/js/app.js` using the `callAPI()` helper

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed patterns.

### Test Your Changes

#### With Claude Code:

```
Test the autocomplete endpoint with a sample address
```

```
Run the health check endpoint
```

```
Help me test the new endpoint I just added
```

#### Manual Testing:

See the **Test API Endpoints** section below for curl commands.

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [API Documentation](docs/API.md) | Complete API reference |
| [Project Structure](docs/PROJECT_STRUCTURE.md) | Code organization guide |
| [Architecture](docs/ARCHITECTURE.md) | System design and patterns |
| [Deployment](docs/DEPLOYMENT.md) | Production deployment guide |

## 🏗️ Project Structure

```
precisely-cloud-native-template/
├── src/                    # Backend source code
│   ├── config/            # Configuration management
│   ├── routes/            # API route handlers
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── app.js             # Express app factory
├── public/                # Frontend assets
│   ├── js/               # JavaScript
│   ├── css/              # Stylesheets
│   └── dist/             # Design System
├── scripts/               # Utility scripts
├── deployment/            # Docker configs
├── docs/                  # Documentation
├── postman/               # API testing collections
├── server.js              # Entry point
└── Dockerfile             # Production Docker image
```

See [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) for details.

## 🛠️ Development

### Run Development Server

```bash
npm run dev
# or
./scripts/dev.sh
```

Auto-reloads on file changes.

### Run Production Server

```bash
npm start
# or
./scripts/start.sh
```

### Test API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Autocomplete
curl -X POST http://localhost:3000/api/autocomplete \
  -H "Content-Type: application/json" \
  -d '{"address":{"addressLines":["123 main"],"country":"USA"}}'

# NLP Search (with AI extraction)
curl -X POST http://localhost:3000/api/nlp-search \
  -H "Content-Type: application/json" \
  -d '{"query":"fedex on 196th st in lynnwood"}'
```

## 🐳 Docker

### Build and Run

**1. Configure Docker Environment**

```bash
# Copy the example environment file for Docker
cp .env.example .env.docker

# Edit .env.docker and configure for Docker deployment
# Use your favorite text editor:
nano .env.docker
# or
code .env.docker
```

**Important Docker-specific settings in `.env.docker`:**
```env
PRECISELY_API_KEY=your_actual_api_key_here
NODE_ENV=production

# For Docker: Use host.docker.internal to access services on host machine
# If AI Address Extraction service is running on your host machine (port 5001):
USE_LLM_EXTRACTION=true
GLINER_SERVICE_URL=http://host.docker.internal:5001

# If AI service is NOT running, keep it disabled:
# USE_LLM_EXTRACTION=false
```

**2. Build and Run Container**

```bash
# Build image
docker build -t precisely-cloud-native .

# Run container with environment file
docker run -d -p 3000:3000 \
  --env-file .env.docker \
  --name precisely-app \
  precisely-cloud-native

# View logs
docker logs precisely-app

# Follow logs in real-time
docker logs -f precisely-app

# Stop container
docker stop precisely-app

# Remove container
docker rm precisely-app
```

**Alternative: Use the Helper Script**

```bash
# Easy one-command setup (automatically handles everything)
./docker-run.sh
```

### Using Docker Compose

**Note:** Ensure you've created `.env.docker` (see step 1 above) before using Docker Compose.

```bash
# Option 1: Using root docker-compose.yml (simpler)
docker-compose up -d

# Option 2: Using deployment/docker-compose.yml (with network isolation)
docker-compose -f deployment/docker-compose.yml up -d

# View logs
docker-compose logs -f

# Stop and remove containers
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

Both Docker Compose files automatically use `.env.docker` for configuration.

## 🎯 Features in Detail

### Address Autocomplete

Type-ahead address suggestions using the **best-of-both-worlds approach** that combines Precisely Autocomplete and Express Autocomplete APIs.

**Hybrid Implementation:**
- **Primary**: Uses standard Autocomplete API for precise, validated address matching
- **Fallback**: Uses Express Autocomplete for faster, natural language queries
- **Smart Routing**: Automatically selects the best API based on query type

**Features:**
- **Real-time**: Results as you type with debouncing
- **Accurate**: Global address coverage with validation
- **Fast**: Optimized performance with intelligent caching
- **Flexible**: Handles both structured addresses and natural language queries

This implementation ensures you get the **best solution for address autocomplete lookup** by leveraging the strengths of both APIs:
- **Standard Autocomplete**: Best for exact address matching and validation
- **Express Autocomplete**: Best for conversational queries and POI searches

### Natural Language Search

Convert conversational queries to structured addresses.

**Example:**
```
Input:  "help! I'm at a FedEx on 196th street in Lynnwood"
Output: "fedex 196th street lynnwood"
```

Uses AI-powered extraction (Developed by Precisely using trained LLM) with regex fallback for robust extraction.

**To get access to Natural Language Address Search, contact:** [mayank.kasturia@precisely.com](mailto:mayank.kasturia@precisely.com)

### Data Graph Integration

Query rich building and parcel data using Precisely's Data Graph API.

**Features:**
- Building information
- Parcel boundaries
- Associated businesses
- Address details

## 🔧 Configuration

### Environment Variables

```bash
# Required
PRECISELY_API_KEY=your_api_key

# Optional
PORT=3000
NODE_ENV=development

# AI Address Extraction (Optional)
# Set to 'true' only if AI Address Extraction service is running on port 5001
# Otherwise keep 'false' - NLP search will work with regex fallback
USE_LLM_EXTRACTION=false
GLINER_SERVICE_URL=http://localhost:5001
```

**Important:**
- Set `USE_LLM_EXTRACTION=true` **only if** the AI Address Extraction service is running on port 5001
- Otherwise, keep `USE_LLM_EXTRACTION=false` (Natural Language Search will still function using regex fallback)

See `.env.example` for all options.

### AI Address Extraction (Optional)

To enable AI-powered address extraction (Developed by Precisely using trained LLM):

**Note:** To get access to this feature, contact [mayank.kasturia@precisely.com](mailto:mayank.kasturia@precisely.com)

**1. Load the Docker Image**

```bash
docker load --input ai-address-locator.tar
```

**2. Run Container with Volume (Recommended - Persists Models)**

```bash
docker run -d -p 5001:5001 \
  -v gliner_models:/root/.cache/huggingface \
  --name ai-service \
  ai-address-locator
```

**3. Enable in .env**

```bash
USE_LLM_EXTRACTION=true
GLINER_SERVICE_URL=http://localhost:5001
```

**4. Test the Service**

Use the Postman collection for testing: `postman/AI Address Locator.postman_collection.json`

The service automatically falls back to regex if the AI service is unavailable.

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/autocomplete` | POST | Address autocomplete |
| `/api/express-autocomplete` | POST | Fast autocomplete with NLP |
| `/api/nlp-search` | POST | Natural language search |
| `/api/data-graph` | POST | Query building/parcel data |

See [docs/API.md](docs/API.md) for detailed documentation.

## 🏛️ Architecture

### API Proxy Pattern

```
Browser → Node.js Server → Precisely APIs
           (adds API key)
```

### Modular Design

```
Routes → Services → External APIs
  ↓
Config, Utils
```

### Layered Approach

- **Routes**: HTTP handling
- **Services**: Business logic
- **Config**: Environment management
- **Utils**: Reusable functions

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for details.

## 🔒 Security

- ✅ API keys stored server-side only
- ✅ Input validation on all endpoints
- ✅ CORS configuration
- ✅ Error sanitization
- ✅ Non-root Docker user
- ✅ Dependencies security audited

## 📊 Tech Stack

**Backend:**
- Node.js 18+
- Express 4.x
- Node-fetch for HTTP calls

**Frontend:**
- Precisely Design System v13.1.0
- Vanilla JavaScript (no framework)
- CloudNative V2 theme

**DevOps:**
- Docker multi-stage builds
- Docker Compose orchestration
- PM2 process manager (optional)

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `PRECISELY_API_KEY`
- [ ] Set up HTTPS/SSL
- [ ] Configure CORS origins
- [ ] Enable health checks
- [ ] Set up monitoring
- [ ] Configure log aggregation

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for platform-specific guides.

## 🧪 Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Integration test
./scripts/test.sh  # (future)
```

## 🔧 Troubleshooting

### "Cannot find module" error
```bash
npm install
```

### "API key not configured" error
Make sure you:
1. Created `.env` file (copied from `.env.example`)
2. Added your API key to `.env`
3. Restarted the server (Ctrl+C, then `npm run dev`)

### Port 3000 already in use
Change the port in `.env`:
```env
PORT=3001
```
Then restart the server.

### Changes not appearing
- **Frontend changes**: Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
- **Backend changes**: Should auto-reload with `npm run dev`

### CORS errors
- Ensure CORS is enabled in `src/app.js`
- Check browser console for specific error details

## 📝 License

Copyright © 2025 Precisely. All rights reserved.

## 🤝 Contributing

1. Follow the existing code structure
2. Update documentation
3. Test thoroughly
4. Keep it simple

## 📞 Support

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **API Support**: [Precisely Developer Portal](https://developer.cloud.precisely.com/)

## 🙏 Acknowledgments

- **Precisely Design System** v13.1.0
- **AI Address Extraction** - Developed by Precisely using trained LLM
- **CloudNative V2** - UI theme

---

**Built with ❤️ for Location Intelligence**
