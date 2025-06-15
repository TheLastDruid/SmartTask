# SmartTask Quick Start Guide

Get SmartTask running in under 5 minutes!

## 🚀 One-Command Setup

```bash
# Clone and start (requires Docker)
git clone <repository-url> && cd SmartTask && docker-compose up -d --build
```

**That's it!** Access your app at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080

## ✅ Verify Installation

```bash
# Check all services are running
docker-compose ps

# Test backend health
curl http://localhost:8080/health

# View logs if needed
docker-compose logs -f
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
2. **Register** a new account
3. **Create** your first task
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
