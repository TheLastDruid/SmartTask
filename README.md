# 🚀 SmartTask - AI-Powered Task Management

SmartTask is a modern, full-stack task management application that combines traditional task management with AI-powered assistance through Groq's LLM API. Create, manage, and get intelligent suggestions for your tasks through natural language chat.

## ✨ Features

### Core Functionality
- 📝 **Complete Task Management**: Create, read, update, and delete tasks
- 👤 **User Authentication**: Secure JWT-based authentication system
- 🎯 **Task Prioritization**: High, Medium, Low priority levels
- 📅 **Due Date Management**: Set and track task deadlines
- 📊 **Task Status Tracking**: TODO, IN_PROGRESS, COMPLETED statuses

### AI-Powered Features
- 🤖 **Smart Chat Assistant**: Natural language task creation and management
- 🧠 **Groq LLM Integration**: Cloud-based AI for intelligent task processing
- 📄 **File Upload Support**: Extract tasks from documents (.txt, .pdf, .docx)
- 💡 **Intelligent Suggestions**: AI-powered task recommendations

## 🏗️ Architecture

### Backend (Spring Boot)
- **Java 17** with Spring Boot 3.2.0
- **MongoDB** for data persistence
- **JWT Authentication** with Spring Security
- **Groq API Integration** for AI capabilities
- **RESTful APIs** for frontend communication

### Frontend (React)
- **React 18** with modern hooks and context
- **Tailwind CSS** for responsive styling
- **Axios** for API communication
- **JWT Token Management** for authentication

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 16+
- Docker & Docker Compose
- Groq API Key (free from [console.groq.com](https://console.groq.com/keys))

### 1. Clone the Repository
```bash
git clone https://github.com/TheLastDruid/SmartTask.git
cd SmartTask
```

### 2. Setup Groq API
```bash
# For Windows
.\setup_groq.ps1 YOUR_GROQ_API_KEY

# For Linux/Mac
./setup_groq.sh YOUR_GROQ_API_KEY
```

### 3. Start the Application
```bash
# Using Docker (Recommended)
docker-compose up --build

# Or use the convenience script
start.bat  # Windows
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **MongoDB**: localhost:27017

### 5. Login
Default test credentials:
- **Email**: test@test.com
- **Password**: investor

## 📋 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify JWT token

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Chat AI
- `POST /api/chat/message` - Send message to AI assistant
- `POST /api/chat/upload` - Upload file for task extraction
- `GET /api/chat/health` - Check AI service status

## 🤖 AI Chat Usage

The AI assistant can help you with:

1. **Create Tasks**: "Create a task to buy groceries tomorrow"
2. **List Tasks**: "Show me my tasks" or "What do I need to do?"
3. **Set Priorities**: "Add a high priority task to finish the report"
4. **Due Dates**: "Remind me to call mom on Friday"

## 🛠️ Development

### Backend Development
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Running Tests
```bash
# Backend tests
cd backend
./mvnw test

# Frontend tests
cd frontend
npm test
```

## 🐳 Docker Deployment

### Production Deployment
```bash
docker-compose -f docker-compose.prod.yml up --build
```

### Infrastructure Only
```bash
docker-compose -f docker-compose.infra.yml up
```

## 🧹 Project Cleanup

To clean build artifacts and temporary files:
```bash
# Windows
cleanup.bat

# Linux/Mac
./cleanup.sh
```

## 🔧 Configuration

### Environment Variables
- `GROQ_API_KEY`: Your Groq API key
- `MONGODB_URI`: MongoDB connection string (default: localhost:27017)
- `JWT_SECRET`: JWT signing secret (auto-generated for development)

### Groq Model Configuration
Current model: `llama-3.1-8b-instant`

Available models:
- `llama-3.1-8b-instant` (fast, recommended)
- `llama-3.1-70b-versatile` (more capable, slower)
- `mixtral-8x7b-32768` (large context window)

## 📁 Project Structure

```
SmartTask/
├── backend/                 # Spring Boot backend
│   ├── src/main/java/      # Java source code
│   │   └── com/todoapp/    # Main application package
│   │       ├── config/     # Security, JWT, DB configuration
│   │       ├── controller/ # REST controllers
│   │       ├── dto/        # Data transfer objects
│   │       ├── model/      # Entity models
│   │       ├── repository/ # Data repositories
│   │       └── service/    # Business logic
│   ├── src/test/           # Test files
│   └── pom.xml            # Maven dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── context/       # React context
│   └── package.json       # NPM dependencies
├── docker-compose.yml     # Development setup
├── docker-compose.prod.yml # Production setup
├── setup_groq.ps1        # Windows Groq setup
├── setup_groq.sh         # Linux/Mac Groq setup
└── README.md            # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Groq API Documentation](https://console.groq.com/docs)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://reactjs.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)

## 🆘 Support

If you encounter any issues:

1. Check the [GROQ_SETUP_GUIDE.md](GROQ_SETUP_GUIDE.md) for setup help
2. Review the application logs for error details
3. Ensure all services are running correctly
4. Verify your Groq API key is valid and has credits

---

**Built with ❤️ using Spring Boot, React, and Groq AI**
