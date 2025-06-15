# SmartTask Development Guide

> **🎉 Current Status (June 15, 2025)**: Core application is fully functional! Authentication, task management, and AI chat features are working correctly.

## ✅ Working Features Status

### **Backend (Spring Boot) - Fully Working ✅**
- ✅ JWT Authentication with proper security configuration
- ✅ User registration and login endpoints  
- ✅ Task CRUD operations with MongoDB persistence
- ✅ AI Chat integration with Ollama LLM service
- ✅ File upload and processing (PDF, DOCX, TXT)
- ✅ Proper CORS configuration and error handling
- ✅ Health check endpoint for monitoring

### **Frontend (React) - Ready for Development ✅**
- ✅ Authentication context and protected routes
- ✅ Task management components (create, list, update, delete)
- ✅ AI chat interface components
- ✅ Modern UI with TailwindCSS styling
- ✅ Responsive design for mobile/desktop

### **Infrastructure - Fully Operational ✅**
- ✅ Docker Compose setup with all services
- ✅ MongoDB database with proper collections
- ✅ Ollama AI service with LLaMA 3.2:1b model
- ✅ Network configuration and service discovery

### **Recent Fixes Applied**
- 🔧 Fixed 403 Forbidden errors in authentication endpoints
- 🔧 Corrected security configuration for proper endpoint whitelisting  
- 🔧 Updated registration validation to require firstName/lastName
- 🔧 Cleaned up project from unnecessary test scripts and build artifacts
- 🔧 Updated all documentation to reflect current working state

## Development Environment Setup

### Prerequisites
- **Java 17+** (OpenJDK recommended)
- **Node.js 18+** and npm 8+
- **Docker** and Docker Compose
- **Git** for version control
- **IDE**: IntelliJ IDEA (recommended) or VS Code

### IDE Configuration

#### IntelliJ IDEA Setup
1. **Import Project**: Open `backend/pom.xml` as a project
2. **Java SDK**: Set Project SDK to Java 17
3. **Maven**: Auto-import enabled
4. **Plugins**: Install Spring Boot, Lombok, MongoDB plugins
5. **Code Style**: Import Google Java Style Guide

#### VS Code Setup
```json
// .vscode/settings.json
{
  "java.home": "/path/to/java17",
  "java.configuration.updateBuildConfiguration": "automatic",
  "spring-boot.ls.logfile": {
    "on": true
  },
  "java.saveActions.organizeImports": true,
  "editor.formatOnSave": true
}
```

**Extensions:**
- Spring Boot Extension Pack
- Java Extension Pack
- MongoDB for VS Code
- ES7+ React/Redux/React-Native snippets

### Local Development Workflow

#### 1. Clone and Setup
```bash
git clone <repository-url>
cd SmartTask

# Start only MongoDB for development
docker-compose up mongodb -d
```

#### 2. Backend Development
```bash
cd backend

# Install dependencies and run tests
./mvnw clean install

# Run in development mode with hot reload
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

# Alternative: Run with debug mode
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005"
```

#### 3. Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Run tests in watch mode
npm test

# Build for production testing
npm run build
```

## Project Architecture

### Backend Architecture

#### Layer Structure
```
┌─────────────────┐
│   Controllers   │  ← REST endpoints
├─────────────────┤
│    Services     │  ← Business logic
├─────────────────┤
│  Repositories   │  ← Data access
├─────────────────┤
│    Entities     │  ← Data models
└─────────────────┘
```

#### Package Organization
```
com.todoapp/
├── config/          # Configuration classes
│   ├── SecurityConfig.java
│   ├── JwtAuthenticationFilter.java
│   └── JwtUtils.java
├── controller/      # REST controllers
│   ├── AuthController.java
│   └── TaskController.java
├── dto/            # Data Transfer Objects
│   ├── AuthResponse.java
│   ├── LoginRequest.java
│   └── RegisterRequest.java
├── model/          # Entity models
│   ├── User.java
│   └── Task.java
├── repository/     # Data repositories
│   ├── UserRepository.java
│   └── TaskRepository.java
├── service/        # Business services
│   ├── AuthService.java
│   └── TaskService.java
└── SmartTaskApplication.java
```

### Frontend Architecture

#### Component Structure
```
src/
├── components/     # Reusable UI components
│   ├── ui/        # Base UI components
│   ├── forms/     # Form components
│   └── layout/    # Layout components
├── pages/         # Page-level components
├── hooks/         # Custom React hooks
├── context/       # React Context providers
├── services/      # API service layer
├── utils/         # Utility functions
└── constants/     # Application constants
```

#### State Management Strategy
```javascript
// Context-based state management
AuthContext (Global)
├── user: User | null
├── token: string | null
├── login: (credentials) => Promise
├── logout: () => void
└── register: (userData) => Promise

TaskContext (Global)
├── tasks: Task[]
├── loading: boolean
├── error: string | null
├── createTask: (task) => Promise
├── updateTask: (id, task) => Promise
├── deleteTask: (id) => Promise
└── loadTasks: () => Promise
```

## Development Guidelines

### Code Standards

#### Java/Spring Boot Standards
```java
// Service class example
@Service
@Slf4j
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    
    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }
    
    @Transactional
    public Task createTask(String userId, TaskRequest request) {
        log.debug("Creating task for user: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
            
        Task task = Task.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .status(TaskStatus.TODO)
            .userId(userId)
            .build();
            
        return taskRepository.save(task);
    }
}
```

#### React/JavaScript Standards
```javascript
// Component example with hooks
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';

const TaskList = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getTasks();
      setTasks(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} onUpdate={loadTasks} />
      ))}
    </div>
  );
};

export default TaskList;
```

### Testing Strategy

#### Backend Testing

**Unit Tests:**
```java
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {
    
    @Mock
    private TaskRepository taskRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @InjectMocks
    private TaskService taskService;
    
    @Test
    void createTask_Success() {
        // Given
        String userId = "user123";
        TaskRequest request = new TaskRequest("Test Task", "Description");
        User user = new User();
        user.setId(userId);
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));
        
        // When
        Task result = taskService.createTask(userId, request);
        
        // Then
        assertThat(result.getTitle()).isEqualTo("Test Task");
        assertThat(result.getUserId()).isEqualTo(userId);
    }
}
```

**Integration Tests:**
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
    "spring.data.mongodb.database=testdb"
})
class TaskControllerIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Test
    void createTask_Success() {
        // Setup
        String token = getAuthToken();
        TaskRequest request = new TaskRequest("Test Task", "Description");
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<TaskRequest> entity = new HttpEntity<>(request, headers);
        
        // Execute
        ResponseEntity<Task> response = restTemplate.postForEntity(
            "/api/tasks", entity, Task.class);
        
        // Verify
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getTitle()).isEqualTo("Test Task");
    }
}
```

#### Frontend Testing

**Component Tests:**
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import TaskList from '../components/TaskList';
import * as taskService from '../services/taskService';

jest.mock('../services/taskService');

const mockTasks = [
  { id: '1', title: 'Test Task 1', status: 'TODO' },
  { id: '2', title: 'Test Task 2', status: 'DONE' }
];

describe('TaskList', () => {
  beforeEach(() => {
    taskService.getTasks.mockResolvedValue({ data: mockTasks });
  });

  test('renders tasks correctly', async () => {
    render(
      <AuthProvider>
        <TaskList />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });
  });

  test('handles create task', async () => {
    taskService.createTask.mockResolvedValue({ data: { id: '3', title: 'New Task' } });
    
    render(
      <AuthProvider>
        <TaskList />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Add Task'));
    
    // Test modal opens and form submission
    // ... additional test logic
  });
});
```

### API Development

#### RESTful API Design
```java
@RestController
@RequestMapping("/api/tasks")
@Validated
public class TaskController {
    
    // GET /api/tasks - List all tasks
    @GetMapping
    public ResponseEntity<List<Task>> getTasks(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String search,
            HttpServletRequest request) {
        
        String userId = getUserIdFromToken(request);
        List<Task> tasks = taskService.getTasks(userId, status, priority, search);
        return ResponseEntity.ok(tasks);
    }
    
    // POST /api/tasks - Create new task
    @PostMapping
    public ResponseEntity<Task> createTask(
            @Valid @RequestBody TaskRequest request,
            HttpServletRequest httpRequest) {
        
        String userId = getUserIdFromToken(httpRequest);
        Task task = taskService.createTask(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(task);
    }
    
    // PUT /api/tasks/{id} - Update task
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @PathVariable String id,
            @Valid @RequestBody TaskRequest request,
            HttpServletRequest httpRequest) {
        
        String userId = getUserIdFromToken(httpRequest);
        Task task = taskService.updateTask(id, userId, request);
        return ResponseEntity.ok(task);
    }
    
    // DELETE /api/tasks/{id} - Delete task
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable String id,
            HttpServletRequest request) {
        
        String userId = getUserIdFromToken(request);
        taskService.deleteTask(id, userId);
        return ResponseEntity.noContent().build();
    }
}
```

#### Error Handling
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        ErrorResponse response = ErrorResponse.builder()
            .message("Validation failed")
            .errors(errors)
            .timestamp(LocalDateTime.now())
            .build();
            
        return ResponseEntity.badRequest().body(response);
    }
    
    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleTaskNotFound(
            TaskNotFoundException ex) {
        
        ErrorResponse response = ErrorResponse.builder()
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .build();
            
        return ResponseEntity.notFound().build();
    }
}
```

### Database Development

#### MongoDB Queries
```java
public interface TaskRepository extends MongoRepository<Task, String> {
    
    // Find tasks by user ID
    List<Task> findByUserId(String userId);
    
    // Find tasks by user ID and status
    List<Task> findByUserIdAndStatus(String userId, TaskStatus status);
    
    // Find tasks with text search
    @Query("{ 'userId': ?0, '$or': [ " +
           "{ 'title': { $regex: ?1, $options: 'i' } }, " +
           "{ 'description': { $regex: ?1, $options: 'i' } } ] }")
    List<Task> findByUserIdAndTitleOrDescriptionContaining(String userId, String searchTerm);
    
    // Count tasks by status for user
    @Aggregation(pipeline = {
        "{ $match: { 'userId': ?0 } }",
        "{ $group: { _id: '$status', count: { $sum: 1 } } }"
    })
    List<TaskStatusCount> countTasksByStatus(String userId);
}
```

#### Database Migrations
```javascript
// MongoDB migration script
// migrations/001_create_indexes.js

db.tasks.createIndex({ "userId": 1 });
db.tasks.createIndex({ "userId": 1, "status": 1 });
db.tasks.createIndex({ "userId": 1, "createdAt": -1 });
db.tasks.createIndex({ 
    "userId": 1, 
    "title": "text", 
    "description": "text" 
});

db.users.createIndex({ "email": 1 }, { unique: true });

// Add any data transformations here
db.tasks.updateMany(
    { priority: { $exists: false } },
    { $set: { priority: "MEDIUM" } }
);
```

### Frontend Development

#### Custom Hooks
```javascript
// hooks/useTasks.js
import { useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { useAuth } from '../context/AuthContext';

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async (filters = {}) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.getTasks(filters);
      setTasks(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createTask = useCallback(async (taskData) => {
    try {
      const response = await taskService.createTask(taskData);
      setTasks(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id, taskData) => {
    try {
      const response = await taskService.updateTask(id, taskData);
      setTasks(prev => prev.map(task => 
        task.id === id ? response.data : task
      ));
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    try {
      await taskService.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    loadTasks,
    createTask,
    updateTask,
    deleteTask
  };
};
```

#### Form Validation
```javascript
// utils/validation.js
export const taskValidation = {
  title: {
    required: 'Title is required',
    minLength: {
      value: 3,
      message: 'Title must be at least 3 characters'
    },
    maxLength: {
      value: 100,
      message: 'Title must not exceed 100 characters'
    }
  },
  description: {
    maxLength: {
      value: 500,
      message: 'Description must not exceed 500 characters'
    }
  },
  dueDate: {
    validate: (value) => {
      if (value && new Date(value) < new Date()) {
        return 'Due date cannot be in the past';
      }
      return true;
    }
  }
};

// Component usage
import { useForm } from 'react-hook-form';
import { taskValidation } from '../utils/validation';

const TaskForm = ({ onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: initialData
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('title', taskValidation.title)}
        placeholder="Task title"
      />
      {errors.title && (
        <span className="error">{errors.title.message}</span>
      )}
      
      <textarea
        {...register('description', taskValidation.description)}
        placeholder="Task description"
      />
      {errors.description && (
        <span className="error">{errors.description.message}</span>
      )}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Task'}
      </button>
    </form>
  );
};
```

## Development Tools & Scripts

### Useful Scripts

#### Backend Scripts
```bash
#!/bin/bash
# scripts/dev-backend.sh

echo "Starting backend development environment..."

# Start MongoDB
docker-compose up mongodb -d

# Wait for MongoDB to be ready
echo "Waiting for MongoDB..."
until docker exec smart-task-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; do
  sleep 1
done

echo "MongoDB is ready!"

# Start backend with dev profile
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

#### Frontend Scripts
```bash
#!/bin/bash
# scripts/dev-frontend.sh

echo "Starting frontend development environment..."

cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start development server
npm start
```

#### Database Scripts
```bash
#!/bin/bash
# scripts/reset-db.sh

echo "Resetting development database..."

# Stop and remove MongoDB container
docker-compose down mongodb
docker volume rm smarttask_mongodb_data

# Start fresh MongoDB
docker-compose up mongodb -d

echo "Database reset complete!"
```

### Development Utilities

#### API Testing with HTTPie
```bash
# scripts/api-test.sh

# Register user
http POST localhost:8080/auth/register \
  firstName="John" \
  lastName="Doe" \
  email="john@test.com" \
  password="password123"

# Login and get token
TOKEN=$(http POST localhost:8080/auth/login \
  email="john@test.com" \
  password="password123" | jq -r '.token')

# Create task
http POST localhost:8080/api/tasks \
  Authorization:"Bearer $TOKEN" \
  title="Test Task" \
  description="Test Description" \
  status="TODO" \
  priority="HIGH"

# Get tasks
http GET localhost:8080/api/tasks \
  Authorization:"Bearer $TOKEN"
```

#### Database Seeding
```java
// src/main/java/com/todoapp/config/DataSeeder.java
@Component
@Profile("dev")
public class DataSeeder implements ApplicationRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() == 0) {
            seedData();
        }
    }
    
    private void seedData() {
        // Create test user
        User testUser = User.builder()
            .firstName("Test")
            .lastName("User")
            .email("test@example.com")
            .password(passwordEncoder.encode("password123"))
            .build();
        
        testUser = userRepository.save(testUser);
        
        // Create sample tasks
        List<Task> sampleTasks = Arrays.asList(
            Task.builder()
                .title("Complete project setup")
                .description("Set up development environment")
                .status(TaskStatus.DONE)
                .priority(Priority.HIGH)
                .userId(testUser.getId())
                .build(),
            Task.builder()
                .title("Implement authentication")
                .description("Add JWT-based authentication")
                .status(TaskStatus.IN_PROGRESS)
                .priority(Priority.HIGH)
                .userId(testUser.getId())
                .build(),
            Task.builder()
                .title("Write documentation")
                .description("Create comprehensive README")
                .status(TaskStatus.TODO)
                .priority(Priority.MEDIUM)
                .userId(testUser.getId())
                .build()
        );
        
        taskRepository.saveAll(sampleTasks);
        
        log.info("Development data seeded successfully");
    }
}
```

## Debugging Guide

### Backend Debugging

#### Common Debug Points
```java
// Add logging to key methods
@Service
@Slf4j
public class TaskService {
    
    public Task createTask(String userId, TaskRequest request) {
        log.debug("Creating task for user: {} with data: {}", userId, request);
        
        try {
            // Business logic here
            Task task = /* ... */;
            log.info("Successfully created task: {} for user: {}", task.getId(), userId);
            return task;
        } catch (Exception e) {
            log.error("Failed to create task for user: {}", userId, e);
            throw e;
        }
    }
}
```

#### Performance Monitoring
```java
@Component
@Aspect
@Slf4j
public class PerformanceAspect {
    
    @Around("@annotation(Timed)")
    public Object measureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        
        try {
            Object result = joinPoint.proceed();
            long executionTime = System.currentTimeMillis() - startTime;
            
            if (executionTime > 1000) { // Log slow operations
                log.warn("Slow operation detected: {} took {}ms", 
                    joinPoint.getSignature(), executionTime);
            }
            
            return result;
        } catch (Exception e) {
            log.error("Exception in {}: {}", joinPoint.getSignature(), e.getMessage());
            throw e;
        }
    }
}

// Usage
@Service
public class TaskService {
    
    @Timed
    public List<Task> getTasks(String userId) {
        // Method implementation
    }
}
```

### Frontend Debugging

#### React Developer Tools
```javascript
// Add displayName for better debugging
const TaskCard = React.memo(({ task, onUpdate }) => {
  // Component implementation
});

TaskCard.displayName = 'TaskCard';

// Debug render cycles
const TaskList = () => {
  console.log('TaskList render');
  
  const [tasks, setTasks] = useState([]);
  
  // Debug effect dependencies
  useEffect(() => {
    console.log('TaskList effect - loading tasks');
    loadTasks();
  }, []); // Empty dependency array
  
  return (
    <div>
      {tasks.map(task => (
        <TaskCard 
          key={task.id} 
          task={task} 
          onUpdate={onUpdate} 
        />
      ))}
    </div>
  );
};
```

#### Error Boundaries
```javascript
// components/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>Error details</summary>
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo.componentStack}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage in App.js
<ErrorBoundary>
  <Router>
    <Routes>
      {/* Your routes */}
    </Routes>
  </Router>
</ErrorBoundary>
```

## 🔧 Troubleshooting Guide

### Common Issues and Solutions

#### **Authentication Issues**

**Problem**: 403 Forbidden on /auth/register or /auth/login
```bash
# Solution: Check security configuration
# Ensure these endpoints are whitelisted in SecurityConfig.java
```

**Fix Applied**: Updated SecurityConfig to properly whitelist:
- `/auth/register` (not `/api/auth/register`)  
- `/auth/login` (not `/api/auth/login`)
- `/health` endpoint

**Problem**: Registration returns validation errors
```json
{"message":"Error: First name is required"}
```

**Fix Applied**: Updated RegisterRequest DTO to require:
```json
{
  "firstName": "John",    // Required
  "lastName": "Doe",      // Required  
  "email": "john@example.com",
  "password": "password123"
}
```

#### **Docker Issues**

**Problem**: Containers not starting
```bash
# Check status
docker-compose ps

# Restart with clean build
docker-compose down && docker-compose up -d --build

# Check logs for specific service
docker logs smart-task-backend
docker logs smart-task-frontend
docker logs smart-task-mongodb
docker logs smart-task-ollama
```

**Problem**: Port conflicts
```bash
# Check which ports are in use
netstat -ano | findstr :8080
netstat -ano | findstr :3000
netstat -ano | findstr :27017
netstat -ano | findstr :11434

# Stop conflicting services or change ports in docker-compose.yml
```

#### **Database Issues**

**Problem**: MongoDB connection failed
```bash
# Check MongoDB container
docker logs smart-task-mongodb

# Test connection
docker exec -it smart-task-mongodb mongosh --eval "db.adminCommand('ping')"

# Reset database if needed
docker-compose down -v && docker-compose up -d
```

#### **AI Chat Issues**

**Problem**: Ollama not responding or slow responses
```bash
# Check Ollama container status
docker logs smart-task-ollama

# Test Ollama directly
curl http://localhost:11434/api/tags

# Pull model manually if needed
docker exec smart-task-ollama ollama pull llama3.2:1b
```

**Problem**: Chat returns generic responses
- The llama3.2:1b model is lightweight but may struggle with complex prompts
- Consider upgrading to llama3.2:3b for better performance
- Check OllamaService logs for JSON parsing errors

#### **Frontend Issues**

**Problem**: CORS errors
```bash
# Ensure backend CORS is properly configured
# Check CrossOrigin annotation in controllers
# Verify REACT_APP_API_URL in frontend
```

**Problem**: Build failures
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check for version conflicts
npm ls
```

### **Performance Optimization**

#### Backend Optimization
```java
// Add to application.properties
server.tomcat.threads.max=200
server.tomcat.max-connections=8192
spring.data.mongodb.auto-index-creation=true

# For production
spring.jpa.show-sql=false
logging.level.org.springframework.data.mongodb.core.MongoTemplate=WARN
```

#### Frontend Optimization
```javascript
// Use React.memo for expensive components
const TaskCard = React.memo(({ task, onUpdate }) => {
  // Component implementation
});

// Implement lazy loading
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
```

### **Development Best Practices**

#### Environment-Specific Configs
```bash
# Development
SPRING_PROFILES_ACTIVE=dev
OLLAMA_BASE_URL=http://localhost:11434

# Production  
SPRING_PROFILES_ACTIVE=prod
OLLAMA_BASE_URL=http://ollama:11434
```

#### Testing Strategy
```bash
# Backend tests
cd backend
mvn test

# Frontend tests  
cd frontend
npm test

# Integration tests
# Use Postman collection or curl scripts
```

#### Monitoring and Logging
```bash
# View real-time logs
docker-compose logs -f backend

# Check specific error patterns
docker logs smart-task-backend 2>&1 | grep ERROR

# Monitor resource usage
docker stats
```

---

**Happy Developing! 🚀**

This guide provides a comprehensive foundation for developing SmartTask. For specific questions or issues, check our [GitHub Discussions](../../discussions) or create an [issue](../../issues).
