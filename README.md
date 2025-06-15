# SmartTask - AI-Powered Task Management Application

![SmartTask Logo](https://img.shields.io/badge/SmartTask-v1.0.0-blue?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)
![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=java)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![AI](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge&logo=openai)

SmartTask is a secure, modern, and AI-powered full-stack task management application built with React.js, Spring Boot, MongoDB, and Ollama. The application provides comprehensive user authentication, advanced task management capabilities, intelligent chatbot assistance, and a beautiful responsive design using TailwindCSS and modern UI components.

> **🎉 Latest Update (June 15, 2025)**: Authentication system fully debugged and working! Chat functionality with AI task creation is now operational.

## ✨ Key Features

### 🤖 AI-Powered ChatBot Assistant
- **Natural Language Processing**: Interact with your tasks using natural language commands
- **File Upload & Parsing**: Upload .txt, .pdf, or .docx files to extract action items automatically
- **Smart Task Extraction**: AI-powered detection of tasks from meeting notes, emails, and documents
- **Conversational Interface**: Chat with the assistant to manage tasks, get help, and receive suggestions
- **Local LLM Integration**: Powered by Ollama (LLaMA 3.2:1b) running locally for privacy and speed

### 🔐 Security & Authentication
- **JWT-based Authentication**: Secure token-based authentication with refresh token support
- **BCrypt Password Hashing**: Industry-standard password encryption
- **Protected Routes**: Authentication required for all task operations
- **Input Sanitization**: Protection against XSS and NoSQL injection attacks
- **CORS Protection**: Properly configured cross-origin resource sharing

### 📋 Advanced Task Management
- **Full CRUD Operations**: Create, Read, Update, Delete tasks
- **Status Tracking**: TODO, IN_PROGRESS, DONE status management
- **Priority Levels**: High, Medium, Low priority assignment
- **Due Date Management**: Set and track task deadlines
- **Search & Filter**: Advanced search by title/description and filter by status/priority
- **Real-time Updates**: Instant task status updates and notifications
- **AI-Assisted Creation**: Create tasks naturally through chat commands

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
| **Ollama** | Latest | Local LLM service (LLaMA 3.2:1b) |

### AI & Machine Learning
| Technology | Version | Purpose |
|------------|---------|---------|
| **Ollama** | Latest | Local LLM inference server |
| **LLaMA 3.2:1b** | Latest | Small language model for task processing |
| **OkHttp** | 4.12.0 | HTTP client for AI service communication |

## 🚀 Current Status & Recent Updates

### ✅ **Fully Working Features (June 15, 2025)**
- **✅ User Authentication**: Registration and login with JWT tokens
- **✅ Security Configuration**: Proper endpoint protection and CORS setup  
- **✅ Task Management**: Complete CRUD operations for tasks
- **✅ AI Chat Integration**: Conversational task creation via Ollama
- **✅ MongoDB Integration**: Persistent data storage
- **✅ Docker Deployment**: Full containerized environment
- **✅ File Processing**: PDF, DOCX, TXT file parsing for task extraction

### 🔧 **Recent Bug Fixes**
- **Fixed Authentication 403 Issues**: Corrected security configuration for auth endpoints
- **Fixed Request Validation**: Updated registration to require firstName/lastName fields
- **Fixed JWT Filter Chain**: Proper token validation and user context setup
- **Cleaned Up Project**: Removed unnecessary test scripts and build artifacts
- **Updated Documentation**: Comprehensive API and setup documentation

### ⚡ **Quick Test Results**
```bash
✅ Registration: POST /auth/register → 200 OK (JWT token returned)
✅ Login: POST /auth/login → 200 OK (JWT token returned)  
✅ Chat: POST /api/chat/message → 200 OK (AI responses working)
✅ Health: GET /health → 200 OK (Service status confirmed)
```

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

### ChatBot Assistant Endpoints (Protected)

#### Send Message to ChatBot
```http
POST /api/chat/message
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Add a task to buy groceries tomorrow",
  "conversationId": "uuid-conversation-id"
}
```

**Response:**
```json
{
  "message": "✅ I've created the task 'Buy groceries' for you!",
  "conversationId": "uuid-conversation-id",
  "action": "CREATE_TASK",
  "requiresConfirmation": false
}
```

#### Upload File for Task Extraction
```http
POST /api/chat/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: meeting-notes.pdf
```

**Response:**
```json
{
  "message": "I found 3 potential tasks in your file. Would you like me to add them?",
  "conversationId": "uuid-conversation-id",
  "suggestedTasks": [
    {
      "title": "Prepare quarterly report",
      "description": "Extracted from uploaded file",
      "priority": "MEDIUM",
      "dueDate": "2025-06-20"
    }
  ],
  "requiresConfirmation": true,
  "action": "ADD_EXTRACTED_TASKS"
}
```

#### Confirm Task Creation
```http
POST /api/chat/confirm-tasks
Authorization: Bearer {token}
Content-Type: application/json

[
  {
    "title": "Prepare quarterly report",
    "description": "Extracted from uploaded file",
    "priority": "MEDIUM",
    "dueDate": "2025-06-20"
  }
]
```

**Response:**
```json
{
  "message": "Successfully added 1 tasks to your list!",
  "conversationId": "uuid-conversation-id"
}
```

#### ChatBot Health Check
```http
GET /api/chat/health
```

**Response:**
```json
{
  "status": "ChatBot service is running",
  "timestamp": "1703097600000"
}
```

### Natural Language Commands

The ChatBot understands various natural language commands:

#### Task Creation
- "Add a task to buy groceries tomorrow"
- "Create a task: Call client about project update"
- "I need to schedule a meeting with the team"
- "Remind me to submit the report by Friday"

#### Task Management
- "Show me all my tasks"
- "List my pending tasks"
- "What tasks do I have for today?"
- "Display my high priority tasks"

#### Task Updates
- "Mark the grocery task as done"
- "Complete the task about client meeting"
- "Change the report task to in progress"
- "Delete the task about old project"

#### File Processing
- "Process this file and extract tasks"
- "Find action items in this document"
- "What tasks can you find in this meeting note?"

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

### 🤖 Quick Start with AI ChatBot

To run SmartTask with the integrated AI-powered chatbot assistant:

1. **Use the automated start script (Windows)**
   ```bash
   # Run the automated setup script
   start-with-chatbot.bat
   ```

2. **Or start manually with Ollama**
   ```bash
   # Start all services including Ollama
   docker-compose up -d --build
   
   # Wait for Ollama to start, then pull the model
   docker exec smart-task-ollama ollama pull llama3.2:1b
   ```

3. **Access the application with ChatBot**
   - **Frontend with ChatBot**: http://localhost:3000
   - **Backend API**: http://localhost:8080
   - **Ollama API**: http://localhost:11434
   - **ChatBot Health**: http://localhost:8080/api/chat/health

4. **Using the ChatBot**
   - Click the chat icon in the bottom-right corner
   - Try commands like:
     - "Add a task to buy groceries tomorrow"
     - "Show me all my pending tasks"
     - "Upload a file to extract tasks"
     - "Mark the grocery task as done"

5. **File Upload Examples**
   - Upload meeting notes (.txt, .pdf, .docx)
   - The AI will extract actionable tasks
   - Confirm which tasks to add to your list

### 🗂️ ChatBot File Processing Examples

The ChatBot can process various file types and extract tasks:

#### Meeting Notes Example (.txt)
```
Team Meeting - June 15, 2025
- John needs to prepare the quarterly report by Friday
- Sarah will schedule a follow-up meeting with the client
- Review the budget proposal before next week
- Send the updated designs to the marketing team
```

#### Email Content Example (.docx)
```
Action Items from Client Call:
1. Update the project timeline
2. Schedule technical review meeting
3. Prepare demo for stakeholder presentation
4. Review and approve final wireframes
```

The ChatBot will intelligently extract tasks like:
- "Prepare quarterly report (Due: Friday)"
- "Schedule follow-up meeting with client"
- "Update project timeline"
- "Prepare demo for stakeholder presentation"

## 🗂️ Project Structure

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
*Documentation Version: 1.1 (Updated with working status)*
