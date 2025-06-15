# SmartTask API Documentation

## Base URL
- Development: `http://localhost:8080`
- Production: `https://api.yourdomain.com`

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this format:
```json
{
  "data": {},
  "message": "Success message",
  "status": "success|error",
  "timestamp": "2025-06-15T10:30:00Z"
}
```

## Error Responses
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": ["Field 'email' is required"]
  },
  "status": "error",
  "timestamp": "2025-06-15T10:30:00Z"
}
```

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

## Task Management Endpoints

### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status (TODO, IN_PROGRESS, DONE)
- `priority` (optional): Filter by priority (LOW, MEDIUM, HIGH)
- `search` (optional): Search in title and description

**Example:**
```http
GET /api/tasks?status=TODO&priority=HIGH&search=urgent
```

### Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2025-12-31T23:59:59Z"
}
```

### Update Task
```http
PUT /api/tasks/{taskId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "priority": "MEDIUM"
}
```

### Delete Task
```http
DELETE /api/tasks/{taskId}
Authorization: Bearer <token>
```

### Get Task by ID
```http
GET /api/tasks/{taskId}
Authorization: Bearer <token>
```

## Task Status Values
- `TODO`: Task is planned but not started
- `IN_PROGRESS`: Task is currently being worked on
- `DONE`: Task is completed

## Priority Values
- `LOW`: Nice to have
- `MEDIUM`: Important
- `HIGH`: Critical/Urgent

## Date Format
All dates should be in ISO 8601 format:
```
YYYY-MM-DDTHH:mm:ss.sssZ
```

Example: `2025-12-31T23:59:59.000Z`

## Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per IP address

## HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Example API Usage

### JavaScript/React Example
```javascript
// Login and get token
const loginResponse = await fetch('http://localhost:8080/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  }),
});

const { token } = await loginResponse.json();

// Use token to fetch tasks
const tasksResponse = await fetch('http://localhost:8080/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

const tasks = await tasksResponse.json();
```

### cURL Examples
```bash
# Register user
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'

# Login user
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get tasks (replace TOKEN with actual JWT)
curl -X GET http://localhost:8080/api/tasks \
  -H "Authorization: Bearer TOKEN"

# Create task
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"New Task","description":"Task description","status":"TODO","priority":"HIGH"}'
```

## WebSocket Events (Future Feature)
```javascript
// Real-time task updates
const socket = new WebSocket('ws://localhost:8080/ws/tasks');

socket.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data);
  
  switch(type) {
    case 'TASK_CREATED':
      // Handle new task
      break;
    case 'TASK_UPDATED':
      // Handle task update
      break;
    case 'TASK_DELETED':
      // Handle task deletion
      break;
  }
};
```

## API Versioning
Current version: `v1`

Future versions will be available at:
- `/api/v2/tasks`
- `/auth/v2/login`

## OpenAPI/Swagger Documentation
When running locally, access interactive API docs at:
- http://localhost:8080/swagger-ui.html
- http://localhost:8080/api-docs
