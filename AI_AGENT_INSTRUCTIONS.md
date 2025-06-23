# AI Agent Instructions for SmartTask Project

This file contains specific instructions for AI agents working on the SmartTask project to ensure consistency and proper development environment usage.

## Environment Specifications

### Operating System
- **Target OS**: Windows
- **Default Shell**: PowerShell
- All terminal commands should be PowerShell-compatible
- Use Windows-specific path separators (`\`) when needed
- Use PowerShell syntax for environment variables (`$env:VARIABLE_NAME`)

### Frontend Development
- **Package Manager**: Always use `pnpm` - NEVER use `npm`
- **Installation**: `pnpm install`
- **Running scripts**: `pnpm run <script-name>`
- **Adding dependencies**: `pnpm add <package-name>`
- **Dev dependencies**: `pnpm add -D <package-name>`

### Backend Development
- **Build Tool**: Always use `mvn` (Maven) - NEVER use `.\mvnw`
- **Building**: `mvn clean install`
- **Running**: `mvn spring-boot:run`
- **Testing**: `mvn test`
- **Compiling**: `mvn compile`

### Terminal Usage
- **Minimize terminal instances**: Try to use as few terminal windows/sessions as possible
- Prefer combining commands with `;` when appropriate
- Use background processes efficiently
- Close terminal sessions when tasks are complete

## Project Structure Commands

### Frontend Commands (from `/frontend` directory)
```powershell
# Install dependencies
pnpm install

# Start development server
pnpm start

# Build for production
pnpm run build

# Run tests
pnpm test

# Install new package
pnpm add <package-name>
```

### Backend Commands (from `/backend` directory)
```powershell
# Clean and compile
mvn clean compile

# Run application
mvn spring-boot:run

# Run tests
mvn test

# Package application
mvn clean package

# Install dependencies
mvn clean install
```

### Docker Commands
```powershell
# Start infrastructure services
docker-compose -f docker-compose.infra.yml up -d

# Start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

### System Monitoring Commands
```powershell
# Check if application ports are listening (Backend: 8080, Frontend: 3000)
Get-NetTCPConnection | Where-Object {$_.LocalPort -eq 8080 -or $_.LocalPort -eq 3000} | Select-Object LocalAddress,LocalPort,State

# Check Docker container status
docker ps

# Check specific port (replace XXXX with port number)
Get-NetTCPConnection | Where-Object {$_.LocalPort -eq XXXX} | Select-Object LocalAddress,LocalPort,State
```

## Best Practices

1. **Always check current directory** before running commands
2. **Use relative paths** when working within project subdirectories
3. **Verify command success** before proceeding to next steps
4. **Use descriptive commit messages** when making changes
5. **Test changes locally** before suggesting production deployment
6. **Always use PowerShell Get-NetTCPConnection** for port checking instead of netstat
7. **Verify services are running** using the provided PowerShell commands before proceeding

## Common Workflow

1. Start infrastructure: `docker-compose -f docker-compose.infra.yml up -d`
2. Backend development: `cd backend ; mvn spring-boot:run`
3. Frontend development: `cd frontend ; pnpm start`
4. Verify services: `Get-NetTCPConnection | Where-Object {$_.LocalPort -eq 8080 -or $_.LocalPort -eq 3000} | Select-Object LocalAddress,LocalPort,State`
5. Testing: Run tests in both frontend (`pnpm test`) and backend (`mvn test`)

## Notes

- This is a Spring Boot + React application
- Uses MongoDB and Redis for data storage
- Implements JWT authentication
- Uses WebSocket for real-time features
- Frontend uses Tailwind CSS for styling
