# Architecture Overview

High-level architecture and design decisions for the Precisely Cloud Native Template.

## System Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────────────────────────────┐
│   Node.js Express Server            │
│   ┌─────────────┐  ┌──────────────┐│
│   │   Routes    │  │   Services   ││
│   │             │  │              ││
│   │ • /autocomplete  │ • GLiNER     ││
│   │ • /nlp-search    │ • Precisely  ││
│   │ • /data-graph    │              ││
│   └─────────────┘  └──────────────┘│
└──────┬───────────────────┬──────────┘
       │                   │
       │                   └──────────┐
       │ HTTPS                        │ HTTP
       ▼                              ▼
┌────────────────┐         ┌─────────────────┐
│ Precisely APIs │         │ GLiNER Service  │
│ (Cloud)        │         │ (Microservice)  │
└────────────────┘         └─────────────────┘
```

## Key Architectural Patterns

### 1. API Proxy Pattern

The Node.js server acts as a secure proxy between the browser and Precisely APIs.

**Benefits:**
- API keys never exposed to client
- Single point for authentication
- Request/response transformation
- Caching and rate limiting (future)
- Audit logging (future)

**Flow:**
```
Browser → Express Route → Service → External API
                ↓
            Transform
                ↓
Browser ← JSON Response
```

### 2. Microservice Architecture

The GLiNER address extraction runs as a separate microservice.

**Benefits:**
- Independent scaling
- Technology independence (Python for ML, Node.js for web)
- Independent deployment
- Fault isolation

**Communication:**
```
Node.js App ──HTTP──> GLiNER Service (Python/Flask)
            ←JSON─
```

### 3. Layered Architecture

```
┌──────────────────┐
│  Presentation    │  ← Routes (HTTP handling)
├──────────────────┤
│  Business Logic  │  ← Services (domain logic)
├──────────────────┤
│  Data Access     │  ← External API clients
└──────────────────┘
```

**Layers:**
- **Routes**: HTTP request/response handling
- **Services**: Business logic and orchestration
- **Utilities**: Pure functions and helpers

### 4. Configuration Management

Centralized configuration with environment-based overrides.

```javascript
.env.example     →  .env (local)  →  config/index.js
(template)          (overrides)       (validated config object)
```

## Data Flow

### Autocomplete Flow

```
1. User types "123 Main"
2. Frontend debounces input (400ms)
3. POST /api/autocomplete
4. Route validates request
5. Service calls Precisely API
6. Response transformed
7. JSON returned to browser
8. Frontend displays suggestions
```

### NLP Search Flow

```
1. User enters "help! I'm at fedex on 196th"
2. Click Search button
3. POST /api/nlp-search
4. Route validates request
5. Service calls GLiNER (with regex fallback)
6. GLiNER extracts: "fedex 196th"
7. Service calls Precisely Express Autocomplete
8. Results enriched with extraction metadata
9. JSON returned to browser
10. Frontend displays results + extraction info
```

## Component Responsibilities

### Server Entry Point (`server.js`)
- **Responsibility**: Start HTTP server
- **Does**: Create app, listen on port
- **Doesn't**: Handle HTTP logic

### App Factory (`src/app.js`)
- **Responsibility**: Configure Express app
- **Does**: Register middleware, routes, error handlers
- **Doesn't**: Implement business logic

### Routes (`src/routes/*.js`)
- **Responsibility**: HTTP interface
- **Does**: Validate requests, call services, format responses
- **Doesn't**: Implement business logic, make external calls

### Services (`src/services/*.js`)
- **Responsibility**: Business logic
- **Does**: Orchestrate external calls, data transformation
- **Doesn't**: Handle HTTP, know about Express

### Config (`src/config/index.js`)
- **Responsibility**: Configuration management
- **Does**: Load, validate, provide typed config
- **Doesn't**: Mutate at runtime

## Security Architecture

### API Key Protection

```
❌ NEVER in frontend:
   fetch(api, { headers: { 'Apikey': key } })

✅ ALWAYS in backend:
   Server adds key before forwarding to Precisely
```

### CORS Configuration

- **Development**: Allow all origins (`*`)
- **Production**: Restrict to known domains

### Input Validation

All routes validate:
- Required parameters
- Data types
- Length limits

### Error Handling

```
Route Error → Service Error → Generic Error Response
                                (details hidden in production)
```

## Scalability Considerations

### Horizontal Scaling

```
┌──────────┐
│   LB     │  ← Load Balancer
└────┬─────┘
     │
     ├──────► Server 1
     ├──────► Server 2
     └──────► Server 3
```

### Caching Strategy (Future)

```
Request → Check Cache → Call API → Update Cache
            ↓ Hit
         Response
```

### Rate Limiting (Future)

```
Request → Rate Limiter → Route → Service
            ↓ Exceeded
         429 Response
```

## Fault Tolerance

### GLiNER Fallback

```
Try GLiNER → Success ✓
    ↓ Fail
Regex Fallback → Continue
```

### Graceful Degradation

- GLiNER unavailable → Use regex cleaning
- API timeout → Return error, don't crash
- Invalid input → Validation error, not 500

### Health Checks

```
/api/health → 200 OK (server running)
            → 503 (dependencies down)
```

## Design Decisions

### Why Node.js?

- **Fast I/O**: Non-blocking, perfect for API proxy
- **Ecosystem**: Massive NPM ecosystem
- **Developer Experience**: Same language (JavaScript) on frontend/backend
- **Deployment**: Easy containerization

### Why Separate GLiNER Service?

- **Technology**: Python is better for ML
- **Scaling**: Independent scaling of ML workload
- **Reusability**: Other apps can use same service
- **Development**: Teams can work independently

### Why No Database?

- **Stateless**: This is an API proxy, not data store
- **Simplicity**: Reduces operational complexity
- **Scalability**: Easier to scale stateless apps

### Why Minimal Dependencies?

- **Security**: Fewer dependencies = smaller attack surface
- **Maintenance**: Less to update
- **Performance**: Faster startup, smaller bundle
- **Reliability**: Fewer things to break

## Performance Considerations

### Response Times

- **Autocomplete**: < 200ms (direct API proxy)
- **NLP Search**: 1-2s (includes GLiNER + API)
- **Data Graph**: < 500ms (direct API proxy)

### Optimizations

1. **Connection Pooling**: Reuse HTTP connections
2. **Compression**: Gzip responses (future)
3. **CDN**: Serve static assets from CDN (future)
4. **Caching**: Cache API responses (future)

## Future Architecture

### Planned Enhancements

1. **Redis Cache**: Cache Precisely API responses
2. **Rate Limiting**: Protect against abuse
3. **Monitoring**: Application metrics
4. **Logging**: Structured logging
5. **Testing**: Unit + integration tests

### Potential Additions

```
┌──────────┐
│  Nginx   │  ← Reverse proxy
└────┬─────┘
     │
┌────▼──────┐
│ Node App  │
└────┬──────┘
     │
     ├──────► Precisely APIs
     ├──────► GLiNER Service
     ├──────► Redis (cache)
     └──────► Metrics Service
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4.x
- **Language**: JavaScript (ES6+)

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom + Design System
- **JavaScript**: Vanilla JS (no framework)
- **Design**: Precisely Design System v13.1.0

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Package Manager**: NPM

### External Services
- **APIs**: Precisely Cloud APIs
- **ML Service**: GLiNER (Python/Flask)

## Deployment Architecture

### Development
```
Developer → npm run dev → Nodemon → Auto-reload
```

### Production
```
Build → Docker Image → Container → Cloud Platform
                                    (AWS/Azure/GCP)
```

### Container Strategy
```
Multi-stage Build:
1. Install dependencies → 2. Production image
   (larger)                  (smaller, optimized)
```

## Monitoring & Observability (Future)

### Metrics
- Request count
- Response times
- Error rates
- API call latency

### Logging
- Request/response logs
- Error logs with stack traces
- Audit logs (API calls)

### Health Checks
- Liveness: Is server responding?
- Readiness: Can server handle traffic?
- Dependencies: Are external services up?
