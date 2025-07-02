# API Endpoints

Complete reference for all available API endpoints.

## Users

### Get User Profile

```http
GET /v1/users/{id}
```

**Parameters:**
- `id` (string, required) - User ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Update User Profile

```http
PUT /v1/users/{id}
```

**Parameters:**
- `id` (string, required) - User ID

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

## Documents

### List Documents

```http
GET /v1/documents
```

**Query Parameters:**
- `page` (integer, optional) - Page number (default: 1)
- `limit` (integer, optional) - Items per page (default: 20)
- `search` (string, optional) - Search query

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "doc123",
        "title": "Getting Started Guide",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100
    }
  }
}
```

### Create Document

```http
POST /v1/documents
```

**Request Body:**
```json
{
  "title": "New Document",
  "content": "Document content in Markdown format",
  "tags": ["guide", "tutorial"]
}
```

### Get Document

```http
GET /v1/documents/{id}
```

### Update Document

```http
PUT /v1/documents/{id}
```

### Delete Document

```http
DELETE /v1/documents/{id}
```