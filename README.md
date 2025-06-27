# 🚀 SmartTask v1.1 - AI-Powered Task Management

SmartTask is a modern, full-stack task management application that combines traditional task management with AI-powered assistance through Groq's LLM API. Create, manage, and get intelligent suggestions for your tasks through natural language chat.

## ✨ Features

### Core Functionality
- 📝 **Complete Task Management**: Create, read, update, and delete tasks
- 👤 **User Authentication**: Secure JWT-based authentication with email verification
- 🎯 **Task Prioritization**: High, Medium, Low priority levels with color coding
- 📅 **Due Date Management**: Set and track task deadlines with overdue warnings
- 📊 **Task Status Tracking**: TODO, IN_PROGRESS, COMPLETED statuses
- 🎫 **Ticket Number System**: Unique sequential numbers for easy task reference
- 🔍 **Smart Search & Filtering**: Filter by status, priority, and search by title/description

### AI-Powered Features
- 🤖 **Smart Chat Assistant**: Natural language task creation and management
- 🧠 **Groq LLM Integration**: Cloud-based AI for intelligent task processing
- 📄 **File Upload Support**: Extract tasks from documents (.txt, .pdf, .docx)
- 💡 **Intelligent Suggestions**: AI-powered task recommendations
- 🎯 **Ticket Reference**: Reference tasks by number in chat (e.g., "update task #123")

### Real-Time Features
- 🔄 **WebSocket Integration**: Real-time task updates across browser tabs
- 📱 **Live Notifications**: Instant feedback for all task operations
- 🔗 **Cross-Tab Sync**: Changes sync automatically across multiple tabs

### User Experience
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- ♿ **Accessibility**: Color-coded priorities, clear visual hierarchy
- 🖱️ **Intuitive Interactions**: Double-click to edit, drag-and-drop friendly
- 📱 **Mobile Responsive**: Works seamlessly on all device sizes

## 🏗️ Architecture

### Backend (Spring Boot)
- **Java 17** with Spring Boot 3.2.0
- **MongoDB** for data persistence with atomic operations
- **JWT Authentication** with Spring Security
- **Groq API Integration** for AI capabilities
- **WebSocket Support** for real-time updates
- **SLF4J Logging** for production-ready logging
- **Environment Variable Configuration** for security

### Frontend (React)
- **React 18** with modern hooks and context
- **Tailwind CSS** for responsive styling
- **Unified Notification System** with deduplication
- **JWT Token Management** with automatic refresh
- **WebSocket Client** for real-time updates
- **Proper Error Handling** and user feedback

### Mobile (React Native)
- **Expo SDK 51+** with TypeScript
- **React Navigation 6** for seamless navigation
- **Axios** for API integration with the same backend
- **WebSocket Client** for real-time synchronization
- **AsyncStorage** for offline data persistence
- **Modern UI** with gesture-based interactions

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 16+
- pnpm (for frontend package management)
- Docker & Docker Compose
- Groq API Key (free from [console.groq.com](https://console.groq.com/keys))

### 1. Clone the Repository
```bash
git clone https://github.com/TheLastDruid/SmartTask.git
cd SmartTask
```

### 2. Install pnpm (if not already installed)
```bash
npm install -g pnpm
```

### 3. Environment Setup
Create a `.env` file in the root directory with your configuration:

```bash
# Groq AI Configuration
GROQ_API_KEY=your_groq_api_key_here

# Database Configuration
MONGO_URI=mongodb://localhost:27017/smarttask

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=86400000

# Email Configuration (choose one)
# Option A: TestMail.app (recommended for development)
SMTP_HOST=smtp.testmail.app
SMTP_PORT=587
SMTP_USERNAME=your_testmail_namespace
SMTP_PASSWORD=your_testmail_password
EMAIL_FROM=test@your_namespace.testmail.app

# Option B: Gmail SMTP (for production)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USERNAME=your_gmail@gmail.com
# SMTP_PASSWORD=your_app_password
# EMAIL_FROM=your_gmail@gmail.com

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8080
```

### 4. Quick Setup Scripts
For convenience, use our setup scripts (Unix/Linux/macOS):

**Setup Groq API:**
```bash
./setup_groq.sh YOUR_GROQ_API_KEY
```

**Setup Email (Optional):**
```bash
# For TestMail.app (recommended)
./setup_email.sh testmail

# For Gmail
./setup_email.sh gmail
```
- Sends real emails to users

### 5. Start the Application

**Option A: Docker (Recommended)**
```bash
docker-compose up --build
```

**Option B: Development Mode**
```bash
# Start Backend (Terminal 1)
cd backend
mvn spring-boot:run

# Start Frontend (Terminal 2)  
cd frontend
pnpm install
pnpm start
```

**Option C: Quick Start Script**
```bash
# Use shell script for quick start
./start.sh  # Unix/Linux/macOS
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **MongoDB**: localhost:27017

### 7. Mobile Application (Optional)
For mobile access, check out the React Native app:
```bash
# Navigate to mobile directory
cd mobile

# Run setup script
chmod +x setup-git.sh
./setup-git.sh

# Start development server
npx expo start
```
See `mobile/README.md` for detailed mobile setup instructions.

## 🆕 What's New in v1.1

### Ticket Number System
- Every task gets a unique ticket number (#1, #2, etc.)
- Reference tasks easily in chat: "update task #123 to high priority"
- Ticket numbers displayed as badges on task cards

### Enhanced User Experience
- **Improved Accessibility**: Better color contrast and visual cues
- **Double-Click Editing**: Double-click any task card to edit instantly
- **Smart Notifications**: Unified notification system with deduplication
- **Visual Priority Indicators**: Color-coded priority levels throughout the UI
- **Overdue Task Warnings**: Clear visual indicators for overdue tasks

### Real-Time Improvements
- **WebSocket Debugging Tools**: Built-in debugger for real-time connections
- **Cross-Tab Synchronization**: Changes sync instantly across browser tabs
- **Optimized Notifications**: Reduced notification clutter with smart deduplication

### Technical Improvements
- **Production-Ready Logging**: Replaced all console output with SLF4J logging
- **Environment Configuration**: All sensitive data moved to environment variables
- **Enhanced Error Handling**: Better error messages and user feedback
- **Code Quality**: Unified logging, consistent code style, improved maintainability

## 💬 Chat Commands

The AI assistant supports natural language commands:

### Task Management
```
"Create a task to buy groceries with high priority"
"Update task #123 to completed"
"Delete task #456"
"Mark task #789 as in progress"
"Set task #123 due date to tomorrow"
```

### Bulk Operations
```
"Mark all my tasks as complete"
"Show me all high priority tasks"
"List overdue tasks"
```

### File Processing
```
Upload a document and say:
"Extract tasks from this file"
"Create tasks from this document"
```

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
pnpm install
pnpm start
```

### Running Tests
```bash
# Backend tests
cd backend
./mvnw test

# Frontend tests
cd frontend
pnpm test
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
# Unix/Linux/macOS
./cleanup.sh

# Manual cleanup if needed:
# rm -rf frontend/node_modules backend/target frontend/build
```

## 🔧 Configuration

### Environment Variables
- `GROQ_API_KEY`: Your Groq API key
- `MONGODB_URI`: MongoDB connection string (default: localhost:27017)
- `JWT_SECRET`: JWT signing secret (auto-generated for development)

### Email Configuration
**TestMail.app (Recommended for Development)**
- `TESTMAIL_API_KEY`: Your testmail.app API key
- `TESTMAIL_NAMESPACE`: Your testmail.app namespace
- `USE_TESTMAIL`: Enable testmail.app (default: true)

**Gmail SMTP (Production)**
- `MAIL_USERNAME`: Gmail address
- `MAIL_PASSWORD`: Gmail app password
- `MAIL_FROM`: From email address
- `FRONTEND_URL`: Frontend URL for email links

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
│   └── package.json       # pnpm dependencies
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
