# SmartTask Quick Start Guide

Get SmartTask running in under 5 minutes! 

> **🎉 Status**: All core features are working! Authentication, task management, and AI chat are fully operational.

## 🚀 One-Command Setup

### Windows (PowerShell)
```powershell
# Use the provided start script
.\start.bat
```

### Linux/Mac
```bash
# Clone and start (requires Docker)
git clone <repository-url> && cd SmartTask && docker-compose up -d --build
```

**That's it!** Access your app at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Ollama AI**: http://localhost:11434

## ✅ Verify Installation

```bash
# Check all services are running
docker-compose ps

# Test backend health (should return 200 OK)
curl http://localhost:8080/health

# Test authentication endpoints
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"password123"}'

# View logs if needed
docker-compose logs -f backend
```

### 🔍 Expected Output
All services should show "Up" status:
```
smart-task-frontend   Up    0.0.0.0:3000->3000/tcp
smart-task-backend    Up    0.0.0.0:8080->8080/tcp  
smart-task-mongodb    Up    0.0.0.0:27017->27017/tcp
smart-task-ollama     Up    0.0.0.0:11434->11434/tcp
```

## 🔧 Quick Commands

```bash
# Stop all services
docker-compose down

# Restart with fresh build
docker-compose down && docker-compose up -d --build

# View logs
docker-compose logs backend
docker-compose logs frontend

# Clean up everything (including database)
docker-compose down -v
```

## 🎯 First Steps

1. **Open** http://localhost:3000
2. **Register** a new account (firstName, lastName, email, password required)  
3. **Login** with your credentials
4. **Create** your first task
5. **Try the AI Chat**: Ask "Create a task to buy groceries tomorrow"
6. **Upload a file**: Test the AI file processing feature

### 🤖 Test AI Features
```bash
# Example chat messages to try:
- "Create a task to call the dentist"
- "Add a high priority task to finish the report by Friday"  
- "Show me my tasks"
- "I need to schedule a meeting with the team"
```

### 🔧 Troubleshooting
- **Port conflicts**: Make sure ports 3000, 8080, 11434, 27017 are free
- **Docker issues**: Run `docker-compose down && docker-compose up -d --build`
- **Auth problems**: Check that all containers are running with `docker-compose ps`

---

**🎉 Everything working? You're ready to use SmartTask!**
4. **Explore** the dashboard features

## 🆘 Common Issues

**Port already in use?**
```bash
# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Frontend
  - "8081:8080"  # Backend
```

**Database issues?**
```bash
# Reset database
docker-compose down -v
docker-compose up -d --build
```

**Still stuck?** Check the [full documentation](README.md) or [create an issue](../../issues).
