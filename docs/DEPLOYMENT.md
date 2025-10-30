# Deployment Guide

Complete guide for deploying the Precisely Cloud Native Template to production.

## Quick Start

### Local Development

```bash
# 1. Setup
./scripts/setup.sh

# 2. Configure
# Edit .env and add your PRECISELY_API_KEY

# 3. Start
./scripts/dev.sh
```

### Production

```bash
# 1. Setup
./scripts/setup.sh

# 2. Configure
# Set production environment variables

# 3. Start
./scripts/start.sh
```

## Deployment Options

### 1. Docker (Recommended)

#### Build Image

```bash
docker build -t precisely-cloud-native:latest .
```

#### Run Container

```bash
docker run -d \
  -p 3000:3000 \
  -e PRECISELY_API_KEY=your_key_here \
  -e NODE_ENV=production \
  --name precisely-app \
  precisely-cloud-native:latest
```

#### Using Docker Compose

```bash
# 1. Configure .env
cp .env.example .env
# Edit .env

# 2. Start services
docker-compose -f deployment/docker-compose.yml up -d

# 3. View logs
docker-compose -f deployment/docker-compose.yml logs -f

# 4. Stop services
docker-compose -f deployment/docker-compose.yml down
```

### 2. Node.js Direct

#### Requirements

- Node.js 18+
- NPM 8+

#### Steps

```bash
# 1. Install dependencies
npm ci --only=production

# 2. Set environment variables
export NODE_ENV=production
export PORT=3000
export PRECISELY_API_KEY=your_key_here

# 3. Start server
node server.js
```

### 3. Process Manager (PM2)

#### Install PM2

```bash
npm install -g pm2
```

#### Start Application

```bash
pm2 start server.js --name precisely-app
```

#### PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'precisely-cloud-native',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

Start with:
```bash
pm2 start ecosystem.config.js
```

## Cloud Platforms

### AWS

#### Elastic Beanstalk

1. Create `Dockerrun.aws.json`:
```json
{
  "AWSEBDockerrunVersion": "1",
  "Image": {
    "Name": "your-registry/precisely-cloud-native:latest"
  },
  "Ports": [{
    "ContainerPort": 3000
  }]
}
```

2. Deploy:
```bash
eb init
eb create precisely-production
eb deploy
```

#### ECS (Elastic Container Service)

1. Push image to ECR
2. Create task definition
3. Create service
4. Configure load balancer

#### Lambda + API Gateway

Not recommended for this use case (always-on server preferred).

### Azure

#### App Service

```bash
az webapp create \
  --resource-group myResourceGroup \
  --plan myAppServicePlan \
  --name precisely-app \
  --deployment-container-image-name your-registry/precisely-cloud-native:latest
```

#### Container Instances

```bash
az container create \
  --resource-group myResourceGroup \
  --name precisely-container \
  --image your-registry/precisely-cloud-native:latest \
  --dns-name-label precisely-app \
  --ports 3000
```

### Google Cloud Platform

#### Cloud Run

```bash
gcloud run deploy precisely-app \
  --image gcr.io/PROJECT_ID/precisely-cloud-native:latest \
  --platform managed \
  --port 3000 \
  --allow-unauthenticated
```

#### Kubernetes Engine

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: precisely-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: precisely
  template:
    metadata:
      labels:
        app: precisely
    spec:
      containers:
      - name: app
        image: gcr.io/PROJECT_ID/precisely-cloud-native:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        - name: PRECISELY_API_KEY
          valueFrom:
            secretKeyRef:
              name: precisely-secrets
              key: api-key
```

## Environment Variables

### Required

```bash
PRECISELY_API_KEY=your_api_key_here
```

### Optional

```bash
# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# GLiNER (if using address extraction)
USE_LLM_EXTRACTION=true
GLINER_SERVICE_URL=http://gliner-service:5001

# Logging
LOG_LEVEL=info
```

## SSL/TLS Configuration

### Using Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Health Checks

Configure health check endpoint for load balancers:

**Endpoint**: `GET /api/health`

**Expected Response**: `200 OK`

```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Monitoring

### Basic Monitoring

```bash
# Check if container is running
docker ps | grep precisely

# View logs
docker logs -f precisely-app

# Check resource usage
docker stats precisely-app
```

### Application Metrics

Add monitoring service (future):
- Prometheus + Grafana
- Datadog
- New Relic

## Scaling

### Horizontal Scaling

Run multiple instances behind a load balancer:

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    image: precisely-cloud-native:latest
    deploy:
      replicas: 3
    ports:
      - "3000-3002:3000"
```

### Load Balancing

Use Nginx, HAProxy, or cloud load balancer:

```nginx
upstream precisely_backend {
    least_conn;
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 80;
    location / {
        proxy_pass http://precisely_backend;
    }
}
```

## Backup & Recovery

### Configuration Backup

```bash
# Backup environment config
cp .env .env.backup.$(date +%Y%m%d)
```

### State

Application is stateless - no backup needed.

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set `NODE_ENV=production`
- [ ] Restrict CORS origins
- [ ] Keep dependencies updated
- [ ] Use secrets manager for API keys
- [ ] Enable rate limiting
- [ ] Configure firewall rules
- [ ] Run security audit: `npm audit`

## Performance Optimization

### Production Optimizations

1. **Enable compression**:
```javascript
const compression = require('compression');
app.use(compression());
```

2. **Set proper cache headers**:
```javascript
app.use(express.static('public', {
  maxAge: '1d'
}));
```

3. **Use CDN for static assets**

4. **Enable HTTP/2**

## Troubleshooting

### Container won't start

```bash
# Check logs
docker logs precisely-app

# Common issues:
# - Missing PRECISELY_API_KEY
# - Port already in use
# - Invalid Node.js version
```

### High memory usage

```bash
# Limit container memory
docker run -m 512m precisely-app
```

### API timeouts

- Check network connectivity
- Verify Precisely API key
- Check GLiNER service (if enabled)

## Rollback

### Docker

```bash
# Tag current version
docker tag precisely-cloud-native:latest precisely-cloud-native:v1.0.0

# Deploy new version
docker pull precisely-cloud-native:v1.1.0

# Rollback if needed
docker stop precisely-app
docker rm precisely-app
docker run -d --name precisely-app precisely-cloud-native:v1.0.0
```

## CI/CD Pipeline Example

### GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Build Docker image
        run: docker build -t precisely-cloud-native:latest .

      - name: Push to registry
        run: |
          docker tag precisely-cloud-native:latest ${{ secrets.REGISTRY }}/precisely-cloud-native:latest
          docker push ${{ secrets.REGISTRY }}/precisely-cloud-native:latest

      - name: Deploy
        run: |
          # Deploy to your cloud platform
```

## Post-Deployment

1. **Verify health check**: `curl https://yourdomain.com/api/health`
2. **Test API endpoints**: Run integration tests
3. **Monitor logs**: Check for errors
4. **Performance test**: Verify response times
5. **Update documentation**: Record deployment notes
