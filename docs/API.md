# API Documentation

Complete API reference for the Precisely Cloud Native Template.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All Precisely API calls are authenticated server-side using the API key configured in `.env`. Client applications do not need to handle authentication.

## Endpoints

### Health Check

**GET** `/api/health`

Check if the server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

### Autocomplete

**POST** `/api/autocomplete`

Precisely Address Autocomplete API proxy. Provides address suggestions as users type.

**Request Body:**
```json
{
  "preferences": {
    "maxResults": 5,
    "returnAllInfo": true
  },
  "address": {
    "addressLines": ["123 main"],
    "country": "USA"
  }
}
```

**Response:**
```json
{
  "response": {
    "predictions": [
      {
        "formattedAddress": "123 Main St, New York, NY 10001",
        "pbKey": "P0000ABC123",
        ...
      }
    ]
  }
}
```

---

### Express Autocomplete

**POST** `/api/express-autocomplete`

Precisely Express Autocomplete API proxy. Faster autocomplete with natural language support.

**Request Body:**
```json
{
  "preferences": {
    "maxResults": 5,
    "returnAllInfo": true,
    "customPreferences": {
      "SEARCH_TYPE": "AUTO"
    }
  },
  "address": {
    "addressLines": ["fedex 196th st"],
    "country": "USA"
  }
}
```

---

### NLP Search

**POST** `/api/nlp-search`

Natural language address search with AI extraction.

**Request Body:**
```json
{
  "query": "help! I am at a FedEx on 196th street in Lynnwood",
  "threshold": 0.3
}
```

**Parameters:**
- `query` (required): Natural language query
- `threshold` (optional): AI confidence threshold (0.05-0.95, default: 0.3)

**Response:**
```json
{
  "response": {
    "predictions": [ ... ]
  },
  "_query_info": {
    "original_query": "help! I am at a FedEx on 196th street in Lynnwood",
    "cleaned_query": "help! I am at a FedEx on 196th street in Lynnwood",
    "extracted_query": "fedex 196th street lynnwood",
    "gliner_threshold": 0.3,
    "country": "USA",
    "max_results": 5
  }
}
```

---

### Data Graph

**POST** `/api/data-graph`

Query Precisely Data Graph for building, parcel, and place information.

**Request Body:**
```json
{
  "pbKey": "P0000ABC123"
}
```

**Response:**
```json
{
  "data": {
    "building": {
      "pbKey": "P0000ABC123",
      "addresses": [ ... ],
      "parcels": [ ... ],
      "places": [ ... ]
    }
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "status": 400
}
```

### Common Error Codes

- `400` - Bad Request (missing or invalid parameters)
- `404` - Not Found (endpoint doesn't exist)
- `500` - Internal Server Error (server-side error)
- `503` - Service Unavailable (Precisely API or GLiNER service down)

---

## Rate Limiting

No client-side rate limiting is enforced. Rate limits are managed by Precisely Cloud APIs based on your subscription tier.

## CORS

CORS is enabled for all origins in development. Configure `CORS_ORIGINS` in production for security.
