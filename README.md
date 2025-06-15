# SmartTask - Modern Task Management Application

![SmartTask Logo](https://img.shields.io/badge/SmartTask-v1.0.0-blue?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)
![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=java)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)

SmartTask is a secure, modern, and feature-rich full-stack task management application built with React.js, Spring Boot, and MongoDB. The application provides comprehensive user authentication, advanced task management capabilities, and a beautiful responsive design using TailwindCSS and modern UI components.

## ✨ Key Features

### 🔐 Security & Authentication
- **JWT-based Authentication**: Secure token-based authentication with refresh token support
- **BCrypt Password Hashing**: Industry-standard password encryption
- **Protected Routes**: Authentication required for all task operations
- **Input Sanitization**: Protection against XSS and NoSQL injection attacks
- **CORS Protection**: Properly configured cross-origin resource sharing

### 📋 Task Management
- **Full CRUD Operations**: Create, Read, Update, Delete tasks
- **Status Tracking**: TODO, IN_PROGRESS, DONE status management
- **Priority Levels**: High, Medium, Low priority assignment
- **Due Date Management**: Set and track task deadlines
- **Search & Filter**: Advanced search by title/description and filter by status/priority
- **Real-time Updates**: Instant task status updates and notifications

### 🎨 Modern UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **TailwindCSS**: Utility-first CSS framework for consistent styling
- **Google Fonts**: Professional typography with Inter font family
- **Lucide Icons**: Beautiful and consistent iconography
- **Dark Mode Support**: Toggle between light and dark themes
- **Smooth Animations**: Micro-interactions and transitions
- **Toast Notifications**: Real-time feedback for user actions

### 🔧 Developer Experience
- **Dockerized Environment**: Complete containerization for easy setup
- **Hot Reload**: Development mode with instant code changes
- **API Documentation**: Comprehensive endpoint documentation
- **Error Handling**: Robust error handling with user-friendly messages
- **Logging**: Comprehensive logging for debugging and monitoring

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React.js** | 18.2.0 | UI framework and component library |
| **TailwindCSS** | 3.4.0 | Utility-first CSS framework |
| **React Router** | 6.8.0 | Client-side routing and navigation |
| **Axios** | 1.3.0 | HTTP client for API communication |
| **React Toastify** | 9.1.0 | Toast notifications |
| **Lucide React** | 0.263.0 | Modern icon library |
| **Context API** | Built-in | State management |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Spring Boot** | 3.2.0 | Java backend framework |
| **Spring Security** | 6.1.1 | Authentication and authorization |
| **Spring Data MongoDB** | 4.1.1 | Database integration and ODM |
| **JWT** | 0.11.5 | JSON Web Token implementation |
| **BCrypt** | Built-in | Password hashing algorithm |
| **Maven** | 3.9.0 | Dependency management and build tool |
| **Jakarta Validation** | 3.0.2 | Server-side input validation |

### Database & Infrastructure
| Technology | Version | Purpose |
|------------|---------|---------|
| **MongoDB** | 7.0 | NoSQL document database |
| **Docker** | 20.10+ | Containerization platform |
| **Docker Compose** | 2.0+ | Multi-container orchestration |

## 📋 Complete API Reference

### Authentication Endpoints

#### Register User
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

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

### Task Management Endpoints (Protected)

#### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer {token}
```

#### Create Task
```http
POST /api/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2025-12-31T23:59:59Z"
}
```

#### Update Task
```http
PUT /api/tasks/{taskId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "priority": "MEDIUM"
}
```

#### Delete Task
```http
DELETE /api/tasks/{taskId}
Authorization: Bearer {token}
```

#### Get Task by ID
```http
GET /api/tasks/{taskId}
Authorization: Bearer {token}
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "service": "SmartTask Backend",
  "status": "UP"
}
```

## 🚀 Getting Started

### Prerequisites

Before running SmartTask, ensure you have the following installed:

| Software | Version | Download Link | Purpose |
|----------|---------|---------------|---------|
| **Docker** | 20.10+ | [Download Docker](https://www.docker.com/products/docker-desktop) | Container runtime |
| **Docker Compose** | 2.0+ | Included with Docker Desktop | Multi-container orchestration |
| **Git** | 2.30+ | [Download Git](https://git-scm.com/downloads) | Version control |
| **Node.js** | 18+ | [Download Node.js](https://nodejs.org/) | Frontend development (optional) |
| **Java JDK** | 17+ | [Download OpenJDK](https://adoptium.net/) | Backend development (optional) |

### 🐳 Quick Start with Docker (Recommended)

The fastest way to get SmartTask running is using Docker Compose:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SmartTask
   ```

2. **Start all services**
   ```bash
   # Start all services in detached mode
   docker-compose up -d --build
   
   # Or start with logs visible
   docker-compose up --build
   ```

3. **Verify services are running**
   ```bash
   docker-compose ps
   ```

4. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8080
   - **API Health Check**: http://localhost:8080/health
   - **MongoDB**: localhost:27017 (database: `todoapp`)

5. **Stop all services**
   ```bash
   docker-compose down
   
   # Stop and remove volumes (clears database)
   docker-compose down -v
   ```

### 💻 Development Setup

For development with hot reload and debugging capabilities:

#### Option 1: Hybrid Setup (Recommended for Development)
Run MongoDB in Docker, but run frontend and backend locally for better debugging:

```bash
# Start only MongoDB
docker-compose up mongodb -d

# Terminal 1: Start Backend
cd backend
./mvnw spring-boot:run

# Terminal 2: Start Frontend
cd frontend
npm install
npm start
```

#### Option 2: Full Local Development

**Prerequisites for local development:**
- MongoDB installed locally or MongoDB Atlas account
- Java 17+ and Maven 3.6+
- Node.js 18+ and npm 8+

**Backend Setup:**
```bash
cd backend

# Install dependencies and run tests
./mvnw clean install

# Run the application
./mvnw spring-boot:run

# Alternative: Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

**Frontend Setup:**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

**MongoDB Setup:**
```bash
# Option 1: Local MongoDB
mongod --dbpath /path/to/data/db

# Option 2: MongoDB in Docker
docker run -d --name mongodb -p 27017:27017 mongo:7.0

# Option 3: Use MongoDB Atlas (cloud)
# Update application.properties with Atlas connection string
```

### 🔧 Environment Configuration

#### Backend Configuration

Create `backend/src/main/resources/application-dev.properties` for development:

```properties
# Development Database (if using local MongoDB)
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.database=todoapp_dev

# JWT Configuration
app.jwtSecret=SmartTaskSecureJWTSecretKeyForHMACAlgorithm2025SecureEnoughKey256Bits
app.jwtExpirationMs=86400000

# Logging
logging.level.com.todoapp=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.springframework.web=DEBUG

# Server Configuration
server.port=8080
server.error.include-message=always
server.error.include-binding-errors=always
```

#### Frontend Configuration

Create `frontend/.env.development`:

```env
# Development API URL
REACT_APP_API_URL=http://localhost:8080

# Optional: Enable source maps for debugging
GENERATE_SOURCEMAP=true

# Optional: Disable browser auto-open
BROWSER=none
```

Create `frontend/.env.production`:

```env
# Production API URL (update with your domain)
REACT_APP_API_URL=https://your-domain.com/api

# Disable source maps in production
GENERATE_SOURCEMAP=false
```

## 🏗️ Project Architecture & Structure

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React.js)    │    │  (Spring Boot)  │    │   (MongoDB)     │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │  Dashboard  │ │    │ │ Controllers │ │    │ │ Collections │ │
│ │   Pages     │ │◄──►│ │             │ │    │ │             │ │
│ │ Components  │ │    │ │ Services    │ │◄──►│ │ - users     │ │
│ └─────────────┘ │    │ │             │ │    │ │ - tasks     │ │
│                 │    │ │ Security    │ │    │ └─────────────┘ │
│ ┌─────────────┐ │    │ │ Config      │ │    │                 │
│ │   Auth      │ │    │ └─────────────┘ │    └─────────────────┘
│ │ Management  │ │    │                 │
│ └─────────────┘ │    │ ┌─────────────┐ │
└─────────────────┘    │ │ Repository  │ │
                       │ │   Layer     │ │
      Port 3000        │ └─────────────┘ │        Port 27017
                       └─────────────────┘
                           Port 8080
```

### Detailed Project Structure

```
SmartTask/
├── 📁 backend/                          # Spring Boot Backend Application
│   ├── 📁 .mvn/wrapper/                 # Maven wrapper files
│   ├── 📁 src/
│   │   ├── 📁 main/
│   │   │   ├── 📁 java/com/todoapp/
│   │   │   │   ├── 📁 config/           # Configuration Classes
│   │   │   │   │   ├── 🔧 SecurityConfig.java      # Spring Security configuration
│   │   │   │   │   ├── 🔧 JwtAuthenticationFilter.java  # JWT filter
│   │   │   │   │   ├── 🔧 JwtUtils.java            # JWT utility methods
│   │   │   │   │   └── 🔧 CorsConfig.java          # CORS configuration
│   │   │   │   ├── 📁 controller/       # REST Controllers
│   │   │   │   │   ├── 🎮 AuthController.java      # Authentication endpoints
│   │   │   │   │   ├── 🎮 TaskController.java      # Task CRUD endpoints
│   │   │   │   │   └── 🎮 HealthController.java    # Health check endpoint
│   │   │   │   ├── 📁 dto/              # Data Transfer Objects
│   │   │   │   │   ├── 📄 AuthResponse.java        # Authentication response
│   │   │   │   │   ├── 📄 LoginRequest.java        # Login request
│   │   │   │   │   ├── 📄 RegisterRequest.java     # Registration request
│   │   │   │   │   └── 📄 TaskRequest.java         # Task request/response
│   │   │   │   ├── 📁 model/            # Entity Models
│   │   │   │   │   ├── 👤 User.java                # User entity
│   │   │   │   │   └── 📋 Task.java                # Task entity
│   │   │   │   ├── 📁 repository/       # Data Access Layer
│   │   │   │   │   ├── 🗃️ UserRepository.java     # User data operations
│   │   │   │   │   └── 🗃️ TaskRepository.java     # Task data operations
│   │   │   │   ├── 📁 service/          # Business Logic Layer
│   │   │   │   │   ├── 🧠 AuthService.java         # Authentication logic
│   │   │   │   │   ├── 🧠 TaskService.java         # Task business logic
│   │   │   │   │   └── 🧠 UserDetailsServiceImpl.java # User details service
│   │   │   │   └── 🚀 SmartTaskApplication.java   # Main application class
│   │   │   └── 📁 resources/
│   │   │       ├── ⚙️ application.properties       # App configuration
│   │   │       └── ⚙️ application-prod.properties  # Production config
│   │   └── 📁 test/                     # Test Classes
│   │       └── 📁 java/com/todoapp/
│   │           ├── 🧪 AuthControllerTest.java
│   │           ├── 🧪 TaskControllerTest.java
│   │           └── 🧪 SmartTaskApplicationTests.java
│   ├── 📄 pom.xml                       # Maven dependencies
│   ├── 📄 Dockerfile                    # Backend container config
│   └── 📄 mvnw                          # Maven wrapper script
│
├── 📁 frontend/                         # React.js Frontend Application
│   ├── 📁 public/                       # Static Assets
│   │   ├── 🌐 index.html               # Main HTML template
│   │   ├── 🎨 favicon.ico              # App icon
│   │   └── 📄 manifest.json             # PWA manifest
│   ├── 📁 src/
│   │   ├── 📁 components/               # Reusable Components
│   │   │   ├── 🧩 Navbar.js            # Navigation component
│   │   │   ├── 🧩 TaskCard.js          # Individual task display
│   │   │   ├── 🧩 TaskModal.js         # Task creation/edit modal
│   │   │   ├── 🧩 LoadingSpinner.js    # Loading indicator
│   │   │   └── 🧩 ProtectedRoute.js    # Route protection component
│   │   ├── 📁 pages/                   # Page Components
│   │   │   ├── 📱 Dashboard.js         # Main dashboard page
│   │   │   ├── 🔐 Login.js             # Login page
│   │   │   ├── ✍️ Register.js          # Registration page
│   │   │   └── ❌ NotFound.js          # 404 page
│   │   ├── 📁 context/                 # React Context
│   │   │   └── 🔄 AuthContext.js       # Authentication state
│   │   ├── 📁 services/                # API Services
│   │   │   ├── 🌐 authService.js       # Authentication API calls
│   │   │   ├── 🌐 taskService.js       # Task API calls
│   │   │   └── 🌐 api.js               # Base API configuration
│   │   ├── 📁 utils/                   # Utility Functions
│   │   │   ├── 🔧 dateUtils.js         # Date formatting utilities
│   │   │   ├── 🔧 validation.js        # Form validation
│   │   │   └── 🔧 constants.js         # Application constants
│   │   ├── 📁 hooks/                   # Custom React Hooks
│   │   │   ├── 🪝 useAuth.js           # Authentication hook
│   │   │   └── 🪝 useTasks.js          # Task management hook
│   │   ├── 🎨 index.css                # Global styles & Tailwind
│   │   ├── 🚀 index.js                 # React app entry point
│   │   └── 🧪 App.test.js              # App component tests
│   ├── 📄 package.json                 # Node.js dependencies
│   ├── 📄 package-lock.json            # Dependency lock file
│   ├── 📄 tailwind.config.js           # Tailwind CSS configuration
│   ├── 📄 postcss.config.js            # PostCSS configuration
│   └── 📄 Dockerfile                   # Frontend container config
│
├── 📄 docker-compose.yml               # Multi-container orchestration
├── 📄 .gitignore                       # Git ignore rules
├── 📄 README.md                        # This documentation
└── 📄 start.bat                        # Windows startup script
```

### Component Architecture

#### Frontend Component Hierarchy
```
App.js
├── AuthContext.Provider
│   ├── Router
│   │   ├── Navbar (always visible when authenticated)
│   │   ├── Routes
│   │   │   ├── Login (public route)
│   │   │   ├── Register (public route)
│   │   │   ├── Dashboard (protected route)
│   │   │   │   ├── TaskCard[] (map over tasks)
│   │   │   │   ├── TaskModal (create/edit)
│   │   │   │   └── FilterControls
│   │   │   └── NotFound (404 page)
│   │   └── ToastContainer (notifications)
```

#### Backend Layer Architecture
```
Controller Layer (REST endpoints)
    ↓
Service Layer (Business logic)
    ↓
Repository Layer (Data access)
    ↓
Database Layer (MongoDB)
```

### Data Models

#### User Entity
```java
{
  "id": "ObjectId",
  "firstName": "String",
  "lastName": "String", 
  "email": "String (unique)",
  "password": "String (BCrypt hashed)",
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime"
}
```

#### Task Entity
```java
{
  "id": "ObjectId",
  "title": "String",
  "description": "String",
  "status": "Enum (TODO, IN_PROGRESS, DONE)",
  "priority": "Enum (LOW, MEDIUM, HIGH)",
  "dueDate": "LocalDateTime",
  "userId": "String (reference to User)",
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime"
}
```

## 🧪 Testing & Quality Assurance

### Backend Testing

#### Running Tests
```bash
cd backend

# Run all tests
./mvnw test

# Run tests with coverage
./mvnw test jacoco:report

# Run only unit tests
./mvnw test -Dtest="*Test"

# Run only integration tests
./mvnw test -Dtest="*IT"

# Run specific test class
./mvnw test -Dtest=AuthControllerTest

# Run specific test method
./mvnw test -Dtest=AuthControllerTest#testLogin
```

#### Test Categories
- **Unit Tests**: Service layer business logic
- **Integration Tests**: Controller endpoints with mocked dependencies
- **Repository Tests**: Database operations with @DataMongoTest
- **Security Tests**: Authentication and authorization flows

#### Coverage Reports
After running tests with coverage, view reports at:
```
backend/target/site/jacoco/index.html
```

### Frontend Testing

#### Running Tests
```bash
cd frontend

# Run tests in watch mode
npm test

# Run tests once
npm test -- --watchAll=false

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test Dashboard.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should render"
```

#### Test Types
- **Component Tests**: React component rendering and behavior
- **Unit Tests**: Utility functions and hooks
- **Integration Tests**: API service calls (mocked)
- **E2E Tests**: Full user workflows (optional)

#### Coverage Reports
View coverage reports at:
```
frontend/coverage/lcov-report/index.html
```

### API Testing

#### Using curl
```bash
# Health check
curl http://localhost:8080/health

# Register user
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get tasks (replace TOKEN with actual JWT)
curl -X GET http://localhost:8080/api/tasks \
  -H "Authorization: Bearer TOKEN"
```

#### Using Postman
Import the provided Postman collection for comprehensive API testing:
1. Download [SmartTask.postman_collection.json](./docs/SmartTask.postman_collection.json)
2. Import into Postman
3. Set environment variables for base URL and token

### Database Testing

#### MongoDB Testing Scripts
```bash
# Connect to MongoDB
docker exec -it smart-task-mongodb mongosh todoapp

# View collections
show collections

# Find all users
db.users.find().pretty()

# Find all tasks
db.tasks.find().pretty()

# Count documents
db.users.countDocuments()
db.tasks.countDocuments()

# Drop test data
db.users.deleteMany({})
db.tasks.deleteMany({})
```

## 🐛 Debugging & Troubleshooting

### Common Issues & Solutions

#### 1. Docker Issues

**Problem**: Containers won't start
```bash
# Check Docker status
docker --version
docker-compose --version

# Check if ports are available
netstat -an | findstr :3000
netstat -an | findstr :8080
netstat -an | findstr :27017

# Solution: Stop conflicting services or change ports
```

**Problem**: Database connection issues
```bash
# Check if MongoDB container is running
docker ps | grep mongodb

# Check MongoDB logs
docker logs smart-task-mongodb

# Connect to MongoDB container
docker exec -it smart-task-mongodb mongosh
```

**Problem**: Build failures
```bash
# Clean and rebuild
docker-compose down
docker system prune -a  # Removes all unused containers/images
docker-compose up --build --force-recreate
```

#### 2. Backend Issues

**Problem**: JWT Token errors
```bash
# Check application properties
cat backend/src/main/resources/application.properties

# Verify JWT secret length (must be 256+ bits)
# Check backend logs
docker logs smart-task-backend | grep -i jwt
```

**Problem**: Spring Boot startup failures
```bash
# Check Java version
java --version

# Run with debug logging
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Dlogging.level.org.springframework=DEBUG"

# Check dependencies
./mvnw dependency:tree
```

**Problem**: Database connection refused
```bash
# Check MongoDB connection in application.properties
spring.data.mongodb.host=mongodb  # For Docker
spring.data.mongodb.host=localhost  # For local development

# Test MongoDB connection
docker exec -it smart-task-mongodb mongosh --eval "db.adminCommand('ping')"
```

#### 3. Frontend Issues

**Problem**: API connection refused
```bash
# Check environment variables
cat frontend/.env.development
cat frontend/.env.production

# Verify API URL
echo $REACT_APP_API_URL

# Test API manually
curl http://localhost:8080/health
```

**Problem**: Build failures
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force

# Check Node.js version compatibility
node --version  # Should be 18+
```

**Problem**: Styling issues
```bash
# Rebuild Tailwind CSS
npm run build:css

# Check Tailwind config
npx tailwindcss init --check

# Verify PostCSS configuration
cat postcss.config.js
```

### Debug Mode Setup

#### Backend Debug Mode
```bash
# Method 1: Using Maven
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005"

# Method 2: Using Docker with debug port
docker run -p 8080:8080 -p 5005:5005 \
  -e JAVA_TOOL_OPTIONS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005" \
  smarttask-backend
```

**IDE Configuration (IntelliJ IDEA):**
1. Run → Edit Configurations
2. Add New → Remote JVM Debug
3. Host: localhost, Port: 5005
4. Start debugging

#### Frontend Debug Mode
```bash
# Start with source maps enabled
GENERATE_SOURCEMAP=true npm start

# Enable React Developer Tools
# Install React DevTools browser extension

# Debug in VS Code
# Create .vscode/launch.json:
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug React App",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/frontend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["start"]
    }
  ]
}
```

### Performance Monitoring

#### Application Metrics
```bash
# Backend metrics (if actuator is enabled)
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/metrics
curl http://localhost:8080/actuator/info

# Frontend bundle analysis
cd frontend
npm install --save-dev webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

#### Database Monitoring
```bash
# MongoDB metrics
docker exec -it smart-task-mongodb mongosh --eval "db.stats()"
docker exec -it smart-task-mongodb mongosh --eval "db.runCommand({serverStatus: 1})"

# Connection monitoring
docker exec -it smart-task-mongodb mongosh --eval "db.runCommand({currentOp: true})"
```

### Log Analysis

#### Centralized Logging Setup
```bash
# Add to docker-compose.yml for log aggregation
version: '3.8'
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
  
  frontend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

#### Log Commands
```bash
# View logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# View logs with timestamps
docker-compose logs -t backend

# View last N lines
docker-compose logs --tail=100 backend

# Search logs for specific patterns
docker-compose logs backend | grep -i "error"
docker-compose logs backend | grep -i "jwt"
```

## 🚀 Deployment Guide

### Production Deployment Checklist

#### Pre-deployment Configuration

1. **Environment Variables**
   ```bash
   # Create production environment files
   cat > backend/src/main/resources/application-prod.properties << EOF
   # Production MongoDB Configuration
   spring.data.mongodb.uri=mongodb://username:password@mongodb-host:27017/todoapp_prod
   
   # Production JWT Configuration (Use strong secret)
   app.jwtSecret=YOUR_VERY_SECURE_256_BIT_SECRET_KEY_HERE
   app.jwtExpirationMs=86400000
   
   # Security Settings
   server.error.include-message=never
   server.error.include-binding-errors=never
   
   # Logging
   logging.level.org.springframework.web=INFO
   logging.level.com.todoapp=INFO
   EOF
   
   cat > frontend/.env.production << EOF
   REACT_APP_API_URL=https://api.yourdomain.com
   GENERATE_SOURCEMAP=false
   EOF
   ```

2. **Security Hardening**
   ```java
   // Update SecurityConfig.java for production
   @Bean
   public CorsConfigurationSource corsConfigurationSource() {
       CorsConfiguration configuration = new CorsConfiguration();
       // Replace with actual production domains
       configuration.setAllowedOriginPatterns(Arrays.asList(
           "https://yourdomain.com",
           "https://www.yourdomain.com"
       ));
       configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
       configuration.setAllowedHeaders(Arrays.asList("*"));
       configuration.setAllowCredentials(true);
       
       UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
       source.registerCorsConfiguration("/**", configuration);
       return source;
   }
   ```

3. **Database Configuration**
   - Set up MongoDB Atlas or dedicated MongoDB server
   - Configure database authentication
   - Set up database backups
   - Configure connection pooling

### Deployment Options

#### Option 1: Docker Swarm Deployment

```bash
# Initialize Docker Swarm
docker swarm init

# Create production docker-compose.prod.yml
cat > docker-compose.prod.yml << EOF
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secure_password
      MONGO_INITDB_DATABASE: todoapp
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network
    deploy:
      replicas: 1
      placement:
        constraints: [node.role == manager]

  backend:
    image: smarttask-backend:latest
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SPRING_DATA_MONGODB_URI=mongodb://admin:secure_password@mongodb:27017/todoapp?authSource=admin
    networks:
      - app-network
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure

  frontend:
    image: smarttask-frontend:latest
    ports:
      - "80:80"
    networks:
      - app-network
    deploy:
      replicas: 2

volumes:
  mongodb_data:

networks:
  app-network:
    driver: overlay
EOF

# Deploy to swarm
docker stack deploy -c docker-compose.prod.yml smarttask
```

#### Option 2: Kubernetes Deployment

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: smarttask

---
# k8s/mongodb-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: smarttask
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:7.0
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          value: "admin"
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: password
        volumeMounts:
        - name: mongodb-storage
          mountPath: /data/db
      volumes:
      - name: mongodb-storage
        persistentVolumeClaim:
          claimName: mongodb-pvc

---
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: smarttask
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: smarttask-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        - name: SPRING_DATA_MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: uri

---
# k8s/frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: smarttask
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: smarttask-frontend:latest
        ports:
        - containerPort: 80
```

Deploy to Kubernetes:
```bash
# Apply configurations
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n smarttask
kubectl get services -n smarttask

# Scale deployments
kubectl scale deployment backend --replicas=5 -n smarttask
```

#### Option 3: Cloud Platform Deployment

**AWS ECS Deployment:**
```bash
# Create ECS task definition
aws ecs register-task-definition \
  --family smarttask \
  --network-mode awsvpc \
  --requires-compatibilities FARGATE \
  --cpu 512 \
  --memory 1024 \
  --cli-input-json file://task-definition.json

# Create ECS service
aws ecs create-service \
  --cluster smarttask-cluster \
  --service-name smarttask-service \
  --task-definition smarttask:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

**Google Cloud Run Deployment:**
```bash
# Build and push to Google Container Registry
docker build -t gcr.io/PROJECT-ID/smarttask-backend ./backend
docker push gcr.io/PROJECT-ID/smarttask-backend

docker build -t gcr.io/PROJECT-ID/smarttask-frontend ./frontend
docker push gcr.io/PROJECT-ID/smarttask-frontend

# Deploy to Cloud Run
gcloud run deploy smarttask-backend \
  --image gcr.io/PROJECT-ID/smarttask-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy smarttask-frontend \
  --image gcr.io/PROJECT-ID/smarttask-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### SSL/TLS Configuration

#### Option 1: Nginx Reverse Proxy with Let's Encrypt
```nginx
# /etc/nginx/sites-available/smarttask
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Auth endpoints
    location /auth/ {
        proxy_pass http://localhost:8080/auth/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Option 2: Traefik with Automatic SSL
```yaml
# docker-compose.traefik.yml
version: '3.8'
services:
  traefik:
    image: traefik:v2.9
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.email=your-email@domain.com"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.myresolver.acme.httpchallenge.entrypoint=web"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"
    labels:
      - "traefik.http.routers.traefik.rule=Host(`traefik.yourdomain.com`)"
      - "traefik.http.routers.traefik.tls.certresolver=myresolver"

  frontend:
    build: ./frontend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.frontend.tls.certresolver=myresolver"
      - "traefik.http.services.frontend.loadbalancer.server.port=80"

  backend:
    build: ./backend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.yourdomain.com`)"
      - "traefik.http.routers.backend.tls.certresolver=myresolver"
      - "traefik.http.services.backend.loadbalancer.server.port=8080"
```

### Monitoring & Health Checks

#### Application Health Monitoring
```bash
# Health check script
#!/bin/bash
# healthcheck.sh

check_backend() {
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health)
    if [ $response -eq 200 ]; then
        echo "Backend: OK"
        return 0
    else
        echo "Backend: FAILED (HTTP $response)"
        return 1
    fi
}

check_frontend() {
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
    if [ $response -eq 200 ]; then
        echo "Frontend: OK"
        return 0
    else
        echo "Frontend: FAILED (HTTP $response)"
        return 1
    fi
}

check_database() {
    if docker exec smart-task-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo "Database: OK"
        return 0
    else
        echo "Database: FAILED"
        return 1
    fi
}

# Run all checks
check_backend
check_frontend
check_database
```

#### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/smarttask"
DATE=$(date +%Y%m%d_%H%M%S)
MONGODB_CONTAINER="smart-task-mongodb"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
echo "Starting MongoDB backup..."
docker exec $MONGODB_CONTAINER mongodump --db todoapp --out /backup
docker cp $MONGODB_CONTAINER:/backup $BACKUP_DIR/mongodb_$DATE

# Compress backup
tar -czf $BACKUP_DIR/mongodb_$DATE.tar.gz -C $BACKUP_DIR mongodb_$DATE
rm -rf $BACKUP_DIR/mongodb_$DATE

# Keep only last 7 backups
find $BACKUP_DIR -name "mongodb_*.tar.gz" -type f -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/mongodb_$DATE.tar.gz"
```

#### Monitoring with Prometheus and Grafana
```yaml
# monitoring/docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

volumes:
  grafana-storage:
```

## 🔧 Maintenance & Operations

### Regular Maintenance Tasks

#### Daily Operations
```bash
# Check application health
./scripts/healthcheck.sh

# Monitor logs for errors
docker-compose logs --tail=100 | grep -i error

# Check disk usage
df -h
docker system df

# Monitor container resource usage
docker stats
```

#### Weekly Maintenance
```bash
# Update dependencies (after testing)
cd frontend && npm audit fix
cd backend && ./mvnw versions:display-dependency-updates

# Clean up unused Docker resources
docker system prune -a

# Backup database
./scripts/backup.sh

# Review logs for performance issues
docker-compose logs --since 7d | grep -i "slow\|timeout\|error"
```

#### Monthly Maintenance
```bash
# Security updates
docker pull mongo:7.0
docker-compose pull
docker-compose up -d --force-recreate

# Performance analysis
# Check database indexes
docker exec smart-task-mongodb mongosh todoapp --eval "db.tasks.getIndexes()"

# Update documentation
# Review and update API documentation
# Update deployment guides if needed
```

### Performance Optimization

#### Database Optimization
```javascript
// Create indexes for better performance
// Connect to MongoDB and run:

// Index for user queries
db.tasks.createIndex({ "userId": 1 })

// Index for status filtering
db.tasks.createIndex({ "userId": 1, "status": 1 })

// Index for date queries
db.tasks.createIndex({ "userId": 1, "createdAt": -1 })

// Compound index for search
db.tasks.createIndex({ 
    "userId": 1, 
    "title": "text", 
    "description": "text" 
})

// Index for user email (unique)
db.users.createIndex({ "email": 1 }, { unique: true })
```

#### Backend Performance Tuning
```properties
# application-prod.properties additions

# Connection pool optimization
spring.data.mongodb.option.max-connection-pool-size=20
spring.data.mongodb.option.min-connection-pool-size=5
spring.data.mongodb.option.max-connection-idle-time=30000

# JVM optimization
JAVA_OPTS=-Xms512m -Xmx1024m -XX:+UseG1GC

# Caching (add to pom.xml and configure)
spring.cache.type=caffeine
spring.cache.caffeine.spec=maximumSize=1000,expireAfterWrite=1h
```

#### Frontend Performance Optimization
```javascript
// webpack.config.js optimizations
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  // Enable compression
  output: {
    filename: '[name].[contenthash].js',
  },
};

// package.json scripts
{
  "scripts": {
    "build:analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js",
    "build:prod": "GENERATE_SOURCEMAP=false npm run build"
  }
}
```

### Security Maintenance

#### Security Checklist
- [ ] Regularly update dependencies
- [ ] Monitor for security vulnerabilities
- [ ] Review access logs for suspicious activity
- [ ] Update JWT secrets periodically
- [ ] Backup and test restore procedures
- [ ] Review user permissions and access levels

#### Vulnerability Scanning
```bash
# Frontend security audit
cd frontend
npm audit
npm audit fix

# Backend security check
cd backend
./mvnw org.owasp:dependency-check-maven:check

# Container security scanning
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image smarttask-backend:latest

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image smarttask-frontend:latest
```

#### Security Updates
```bash
#!/bin/bash
# security-update.sh

echo "Starting security updates..."

# Update base images
docker pull node:18-alpine
docker pull openjdk:17-jre-slim
docker pull mongo:7.0

# Rebuild with updated base images
docker-compose build --no-cache

# Update npm dependencies
cd frontend
npm audit fix --force
cd ..

# Update Maven dependencies
cd backend
./mvnw versions:use-latest-versions
cd ..

# Restart services
docker-compose up -d --force-recreate

echo "Security updates completed"
```

## 🚀 Advanced Features & Extensions

### Adding New Features

#### Backend Feature Development
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/task-categories
   ```

2. **Add Entity Model**
   ```java
   // src/main/java/com/todoapp/model/Category.java
   @Document(collection = "categories")
   public class Category {
       @Id
       private String id;
       
       @NotBlank
       private String name;
       
       @NotBlank
       private String color;
       
       private String userId;
       
       // Getters and setters
   }
   ```

3. **Create Repository**
   ```java
   // src/main/java/com/todoapp/repository/CategoryRepository.java
   public interface CategoryRepository extends MongoRepository<Category, String> {
       List<Category> findByUserId(String userId);
   }
   ```

4. **Add Service Layer**
   ```java
   // src/main/java/com/todoapp/service/CategoryService.java
   @Service
   public class CategoryService {
       @Autowired
       private CategoryRepository categoryRepository;
       
       public List<Category> getUserCategories(String userId) {
           return categoryRepository.findByUserId(userId);
       }
   }
   ```

5. **Create Controller**
   ```java
   // src/main/java/com/todoapp/controller/CategoryController.java
   @RestController
   @RequestMapping("/api/categories")
   public class CategoryController {
       @Autowired
       private CategoryService categoryService;
       
       @GetMapping
       public ResponseEntity<List<Category>> getUserCategories(HttpServletRequest request) {
           String userId = getUserIdFromToken(request);
           return ResponseEntity.ok(categoryService.getUserCategories(userId));
       }
   }
   ```

#### Frontend Feature Development
1. **Create Component**
   ```jsx
   // src/components/CategoryManager.js
   import React, { useState, useEffect } from 'react';
   import { categoryService } from '../services/categoryService';
   
   const CategoryManager = () => {
       const [categories, setCategories] = useState([]);
       
       useEffect(() => {
           loadCategories();
       }, []);
       
       const loadCategories = async () => {
           try {
               const response = await categoryService.getCategories();
               setCategories(response.data);
           } catch (error) {
               console.error('Error loading categories:', error);
           }
       };
       
       return (
           <div className="category-manager">
               {/* Component implementation */}
           </div>
       );
   };
   
   export default CategoryManager;
   ```

2. **Add Service**
   ```javascript
   // src/services/categoryService.js
   import api from './api';
   
   export const categoryService = {
       getCategories: () => api.get('/api/categories'),
       createCategory: (category) => api.post('/api/categories', category),
       updateCategory: (id, category) => api.put(`/api/categories/${id}`, category),
       deleteCategory: (id) => api.delete(`/api/categories/${id}`)
   };
   ```

### Integration Options

#### Third-party Integrations
```javascript
// Email notifications (Node.js backend addition)
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Slack integration
const { WebClient } = require('@slack/web-api');
const slack = new WebClient(process.env.SLACK_TOKEN);

// Calendar integration (Google Calendar API)
const { google } = require('googleapis');
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
```

#### Mobile App Integration
```javascript
// React Native compatible API responses
// Add mobile-specific endpoints
@RestController
@RequestMapping("/api/mobile")
public class MobileController {
    
    @GetMapping("/tasks/sync")
    public ResponseEntity<SyncResponse> syncTasks(
        @RequestParam(required = false) Long lastSync
    ) {
        // Return mobile-optimized task sync data
    }
}
```

## 📚 Additional Resources

### Learning Materials
- **Spring Boot Documentation**: https://spring.io/projects/spring-boot
- **React Documentation**: https://reactjs.org/docs
- **MongoDB University**: https://university.mongodb.com/
- **Docker Documentation**: https://docs.docker.com/
- **TailwindCSS Documentation**: https://tailwindcss.com/docs

### Development Tools
- **Postman Collection**: [Download API Collection](./docs/SmartTask.postman_collection.json)
- **MongoDB Compass**: GUI for MongoDB
- **React Developer Tools**: Browser extension
- **Spring Boot DevTools**: Hot reload for Spring Boot
- **Docker Desktop**: Container management GUI

### Community & Support
- **GitHub Issues**: Report bugs and request features
- **Discord Server**: Real-time community support
- **Stack Overflow**: Tag your questions with `smarttask-app`
- **Documentation Wiki**: Comprehensive guides and tutorials

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started
1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/SmartTask.git
   cd SmartTask
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

### Development Guidelines

#### Code Style
- **Java**: Follow Google Java Style Guide
- **JavaScript/React**: Follow Airbnb React/JSX Style Guide
- **Commit Messages**: Use Conventional Commits format

```bash
# Commit message format
feat: add task categories functionality
fix: resolve JWT token expiration issue
docs: update deployment documentation
style: format code according to style guide
refactor: restructure task service layer
test: add unit tests for auth service
```

#### Pull Request Process
1. **Update documentation** for any new features
2. **Add tests** for new functionality
3. **Ensure all tests pass**
   ```bash
   # Backend tests
   cd backend && ./mvnw test
   
   # Frontend tests
   cd frontend && npm test
   ```
4. **Update the README** if needed
5. **Submit pull request** with detailed description

#### Testing Requirements
- Minimum 80% code coverage
- All existing tests must pass
- New features must include tests
- Integration tests for API changes

### Reporting Issues
When reporting issues, please include:
- **Environment details** (OS, Docker version, etc.)
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **Screenshots** if applicable
- **Logs** and error messages

### Feature Requests
- Check existing issues first
- Provide detailed use case
- Include mockups or examples if helpful
- Explain the business value

## 📄 License & Legal

### MIT License
```
MIT License

Copyright (c) 2025 SmartTask Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Third-party Licenses
- **Spring Boot**: Apache License 2.0
- **React**: MIT License
- **MongoDB**: Server Side Public License (SSPL)
- **TailwindCSS**: MIT License
- **Docker**: Apache License 2.0

## 🙏 Acknowledgments

Special thanks to:
- **Spring Boot Team** for the excellent framework
- **React Team** for the powerful UI library
- **MongoDB Team** for the flexible database
- **TailwindCSS Team** for the utility-first CSS framework
- **Docker Team** for containerization technology
- **Open Source Community** for continuous inspiration and support

### Contributors
- **Core Team**: Application architecture and development
- **Community Contributors**: Bug fixes, features, and documentation
- **Security Researchers**: Vulnerability reports and fixes
- **Documentation Writers**: Comprehensive guides and tutorials

---

## 📞 Support & Contact

### Getting Help
1. **Check Documentation**: Start with this README and the docs folder
2. **Search Issues**: Look for existing solutions in GitHub Issues
3. **Community Support**: Join our Discord server for real-time help
4. **Create Issue**: If you can't find a solution, create a detailed issue

### Commercial Support
For enterprise support, custom development, or consulting services:
- **Email**: support@smarttask.dev
- **Website**: https://smarttask.dev/enterprise
- **Phone**: +1 (555) 123-4567

### Emergency Contact
For critical security issues:
- **Security Email**: security@smarttask.dev
- **PGP Key**: Available at https://smarttask.dev/pgp-key.txt

---

**Happy Task Managing with SmartTask! 🚀**

---

*Last Updated: June 15, 2025*
*Version: 1.0.0*
*Documentation Version: 1.0*
