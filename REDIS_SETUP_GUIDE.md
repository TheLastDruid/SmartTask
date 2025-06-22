# Redis Real-Time Updates Setup Guide

## Overview

SmartTask now includes Redis-powered real-time updates that automatically sync changes across all connected clients. This enables live task updates, notifications, and collaborative features.

## Features

- **Real-time Task Updates**: See task changes instantly across all devices
- **Live Notifications**: Get notified of important events in real-time
- **Connection Status**: Visual indicator showing real-time connectivity
- **Caching**: Improved performance with Redis caching
- **Offline Fallback**: Graceful degradation when connection is lost

## Setup Instructions

### Prerequisites

- Redis server (local or remote)
- Backend with Spring Boot + Redis dependencies
- Frontend with WebSocket support

### 1. Redis Installation

#### Option A: Local Installation
```bash
# Windows (using Chocolatey)
choco install redis-64

# macOS (using Homebrew)
brew install redis

# Ubuntu/Debian
sudo apt-get install redis-server
```

#### Option B: Docker (Recommended)
```bash
# Using the provided docker-compose.yml
docker-compose up redis -d
```

### 2. Environment Configuration

Update your `.env` file:
```properties
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DATABASE=0
```

### 3. Backend Configuration

The backend is already configured with:
- Redis connection setup
- WebSocket configuration
- Real-time message publishing
- Task caching for improved performance

Key components:
- `RedisConfig.java` - Redis connection and serialization
- `WebSocketConfig.java` - WebSocket endpoint configuration
- `RedisPublisher.java` - Publishes database changes to Redis
- `WebSocketController.java` - Routes Redis messages to WebSocket clients

### 4. Frontend Integration

The frontend includes:
- `webSocketService.js` - WebSocket connection management
- `useRealTimeTasks.js` - React hook for real-time task updates
- Connection status indicator in the dashboard

## Usage

### Starting the Application

1. **Start Redis** (if not using Docker):
   ```bash
   redis-server
   ```

2. **Start the full stack**:
   ```bash
   docker-compose up
   ```
   Or manually:
   ```bash
   # Backend
   mvn spring-boot:run

   # Frontend
   pnpm start
   ```

### Features in Action

1. **Real-time Task Updates**: 
   - Create, update, or delete tasks on one device
   - Watch them appear instantly on other connected devices

2. **Live Connection Status**:
   - Green "Live Updates" indicator when connected
   - Red "Offline" indicator when disconnected

3. **Notifications**:
   - Toast notifications for task changes
   - System-wide announcements

## Architecture

```
Frontend (React) 
    ↕ WebSocket/SockJS
Backend (Spring Boot)
    ↕ Redis Pub/Sub
Redis Server
    ↕ Message Queues
Database Changes → Redis → WebSocket → Frontend Updates
```

## Redis Channels

The system uses several Redis channels:

- `task_updates` - General task change notifications
- `user_updates` - User-specific updates
- `user_{userId}` - Individual user channels
- `system_notifications` - System-wide messages

## Monitoring

### Redis CLI Commands

```bash
# Monitor all Redis activity
redis-cli monitor

# Check active connections
redis-cli client list

# View published messages
redis-cli psubscribe "*"
```

### Application Logs

- Backend logs show Redis connection status and message publishing
- Frontend console shows WebSocket connection status and received messages

## Troubleshooting

### Connection Issues

1. **Redis not connecting**:
   - Check Redis server is running: `redis-cli ping`
   - Verify environment variables in `.env`
   - Check firewall settings

2. **WebSocket not connecting**:
   - Verify backend is running on port 8080
   - Check CORS configuration
   - Inspect browser network tab for WebSocket errors

3. **Messages not updating**:
   - Check Redis channels: `redis-cli monitor`
   - Verify task service is publishing to Redis
   - Check WebSocket message handlers

### Performance Optimization

- Adjust Redis memory settings for your use case
- Configure Redis persistence if needed
- Monitor Redis memory usage with `redis-cli info memory`

## Security Considerations

- Use Redis AUTH in production environments
- Configure Redis to bind to specific interfaces
- Use TLS for Redis connections in production
- Implement proper WebSocket authentication

## Development

### Adding New Real-time Features

1. **Backend**: Add publishing logic in service classes
2. **Redis**: Define new channel names in `RedisPublisher`
3. **WebSocket**: Add message routing in `WebSocketController`
4. **Frontend**: Add message handlers in `webSocketService`

### Testing

```bash
# Test Redis connection
redis-cli ping

# Test WebSocket endpoint
# Use browser dev tools or Postman to test WebSocket connection to:
# ws://localhost:8080/ws
```

## Production Deployment

- Use Redis Cluster for high availability
- Configure Redis persistence (RDB + AOF)
- Set up Redis monitoring and alerting
- Use a reverse proxy for WebSocket connections
- Configure proper Redis security settings

---

For more information, see the main [README.md](../README.md) file.
