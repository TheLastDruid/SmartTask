# SmartTask Mobile

A comprehensive React Native mobile application built with Expo and TypeScript for intelligent task management with AI-powered assistance. Seamlessly integrates with the SmartTask backend for a unified experience across web and mobile platforms.

## 🚀 Quick Start

```bash
# Clone and navigate to project directory
cd SmartTask/mobile

# Install dependencies
npm install

# Start the development server
npx expo start

# For cache issues or troubleshooting
npx expo start --clear

# Run on specific platforms
npx expo start --android
npx expo start --ios
npx expo start --web
```

## 📡 Backend Integration

This mobile app seamlessly integrates with the **SmartTask Spring Boot backend** running on `http://localhost:8080`.

### Prerequisites
1. **Backend Server**: Start the backend server first:
   ```bash
   cd SmartTask/backend
   mvn spring-boot:run
   ```
2. **Database**: Ensure MongoDB is running and accessible
3. **Network**: Verify your device/emulator can reach the backend server
4. **Redis** (Optional): For real-time features and caching

### Network Configuration
- **Android Emulator**: Uses `http://10.0.2.2:8080`
- **iOS Simulator**: Uses `http://localhost:8080`
- **Physical Device**: Update `API_BASE_URL` in `src/utils/config.ts` to your computer's local IP address
- **Production**: Configure production API endpoint for app store builds

### Environment Variables
Create a `.env` file in the mobile directory:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080
EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws
EXPO_PUBLIC_APP_ENV=development
```

## 📱 Authentication & Registration

- **Email-based Authentication**: Register with a valid email address
- **JWT Token Management**: Secure token-based authentication
- **Email Verification**: Optional email verification flow (configurable)
- **Password Requirements**: Secure password validation
- **Biometric Authentication**: Support for fingerprint/face ID (planned)

## 🏗️ Project Structure

```
mobile/
├── App.tsx                     # Main app entry point with providers
├── app.json                    # Expo configuration
├── metro.config.js             # Metro bundler configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
├── .env                        # Environment variables
├── .gitignore                  # Git ignore rules
├── assets/                     # Static assets (images, icons)
│   ├── icon.png
│   ├── splash-icon.png
│   ├── adaptive-icon.png
│   └── favicon.png
└── src/
    ├── components/             # Reusable UI components
    │   ├── common/             # Generic components
    │   ├── forms/              # Form components
    │   └── TaskForm.tsx        # Task creation/editing form
    ├── context/                # React Context providers
    │   └── AuthContext.tsx     # Authentication state management
    ├── hooks/                  # Custom React hooks
    │   ├── useAuth.ts          # Authentication hook
    │   ├── useTasks.ts         # Task management hook
    │   └── useRealTime.ts      # WebSocket real-time updates
    ├── navigation/             # Navigation configuration
    │   ├── AppNavigator.tsx    # Main navigation setup
    │   └── types.ts            # Navigation type definitions
    ├── screens/                # Screen components
    │   ├── auth/               # Authentication screens
    │   │   ├── LoginScreen.tsx
    │   │   ├── RegisterScreen.tsx
    │   │   └── EmailVerificationScreen.tsx
    │   ├── tasks/              # Task management screens
    │   │   ├── TaskListScreen.tsx
    │   │   ├── TaskDetailScreen.tsx
    │   │   └── CreateTaskScreen.tsx
    │   ├── chat/               # AI chat screens
    │   │   ├── ChatScreen.tsx
    │   │   └── ChatHistoryScreen.tsx
    │   ├── profile/            # User profile screens
    │   │   ├── ProfileScreen.tsx
    │   │   └── SettingsScreen.tsx
    │   ├── LoadingScreen.tsx   # Loading/splash screen
    │   └── ConnectivityTestScreen.tsx # Network testing
    ├── services/               # API and external services
    │   ├── apiService.ts       # HTTP API client
    │   ├── authService.ts      # Authentication service
    │   ├── taskService.ts      # Task management service
    │   ├── chatService.ts      # AI chat service
    │   └── webSocketService.ts # Real-time communication
    ├── types/                  # TypeScript type definitions
    │   ├── index.ts            # Common types
    │   ├── auth.ts             # Authentication types
    │   ├── task.ts             # Task-related types
    │   └── chat.ts             # Chat-related types
    └── utils/                  # Utility functions
        ├── config.ts           # App configuration
        ├── storage.ts          # Local storage utilities
        ├── validation.ts       # Form validation
        └── constants.ts        # App constants
```

## 🔧 Technologies & Dependencies

### Core Technologies
- **Expo SDK 51+** with TypeScript
- **React Native** latest stable version
- **React Navigation 6** (Stack, Tab, Drawer navigation)
- **React Context** + **useReducer** for state management
- **Async Storage** for local data persistence

### UI & Styling
- **React Native StyleSheet** with custom themes
- **Expo Vector Icons** (Ionicons, MaterialIcons)
- **React Native Paper** for Material Design components
- **React Native Gesture Handler** for smooth interactions

### Networking & APIs
- **Axios** for HTTP requests with interceptors
- **WebSocket** for real-time communication
- **React Query/TanStack Query** for caching and data fetching
- **JWT Token** management with automatic refresh

### Development Tools
- **TypeScript** for type safety
- **ESLint** + **Prettier** for code formatting
- **React Native Flipper** for debugging
- **Expo Dev Tools** for development workflow

## 📋 Features

### Core Features
- ✅ **Authentication System**
  - Email/password registration and login
  - JWT token management with auto-refresh
  - Email verification workflow
  - Secure logout and session management

- ✅ **Task Management**
  - Create, edit, delete, and complete tasks
  - Task prioritization (LOW, MEDIUM, HIGH, URGENT)
  - Due date management with notifications
  - Task categories and tags
  - Bulk operations and filtering
  - Ticket number system for tracking

- ✅ **AI Chat Assistant**
  - Groq-powered AI integration
  - Natural language task creation
  - File upload support (.txt, .pdf, .docx)
  - Conversation history persistence
  - Smart task suggestions and automation

- ✅ **Real-time Features**
  - WebSocket integration for live updates
  - Real-time task synchronization
  - Live chat updates
  - Push notifications (planned)

### UI/UX Features
- ✅ **Modern, Responsive Design**
  - Clean, intuitive interface
  - Dark/light theme support (planned)
  - Smooth animations and transitions
  - Gesture-based interactions

- ✅ **Navigation & Flow**
  - Bottom tab navigation
  - Stack navigation for screens
  - Deep linking support
  - Smooth screen transitions

- ✅ **Form Validation & Error Handling**
  - Real-time form validation
  - Comprehensive error messages
  - Network error handling
  - Offline mode support (planned)

### Developer Features
- ✅ **Code Quality**
  - TypeScript for type safety
  - ESLint and Prettier configuration
  - Component testing setup
  - Git hooks for code quality

- ✅ **Development Tools**
  - Hot reloading and fast refresh
  - Debug mode with network inspector
  - Performance monitoring
  - Crash reporting integration

## 🔄 Development Workflow

### Getting Started
1. **Environment Setup**:
   ```bash
   # Install Expo CLI globally
   npm install -g @expo/cli

   # Install dependencies
   cd SmartTask/mobile
   npm install
   ```

2. **Backend Configuration**:
   - Start the Spring Boot backend server
   - Ensure MongoDB and Redis are running
   - Configure environment variables in `.env`

3. **Development Server**:
   ```bash
   # Start Expo development server
   npx expo start

   # Choose your platform:
   # - Press 'a' for Android emulator
   # - Press 'i' for iOS simulator
   # - Press 'w' for web browser
   # - Scan QR code with Expo Go app on physical device
   ```

### API Integration
The mobile app connects to the same backend API endpoints as the web version:

- **Authentication**: `/api/auth/*`
- **Tasks**: `/api/tasks/*`
- **Chat**: `/api/chat/*`
- **Users**: `/api/users/*`
- **WebSocket**: `/ws` for real-time updates

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# E2E testing with Detox (planned)
npm run test:e2e
```

### Building for Production
```bash
# Build for Android
npx expo build:android

# Build for iOS
npx expo build:ios

# Create development build
npx expo install --fix
npx expo run:android
npx expo run:ios
```

## 📱 Testing & Debugging

### Testing on Devices
1. **Physical Device**:
   - Install Expo Go app from App Store/Google Play
   - Scan QR code from `npx expo start`
   - Ensure device is on same network as development machine

2. **Emulators**:
   - **Android**: Use Android Studio AVD Manager
   - **iOS**: Use Xcode Simulator (macOS only)

3. **Web Browser**:
   - Press 'w' in Expo CLI to open in browser
   - Good for quick UI testing and debugging

### Common Issues & Solutions
- **Network Issues**: Check IP configuration in `config.ts`
- **Build Errors**: Run `npx expo install --fix` to resolve dependency issues
- **Cache Problems**: Use `npx expo start --clear` to clear Metro cache
- **Authentication Issues**: Verify backend JWT configuration

## 🚀 Deployment

### App Store Deployment
1. **Prepare for Production**:
   - Update app version in `app.json`
   - Configure production API endpoints
   - Add app icons and splash screens
   - Test on physical devices

2. **Build and Submit**:
   ```bash
   # Build and submit to app stores
   npx expo build:android --type=app-bundle
   npx expo build:ios --type=archive
   
   # Or use EAS Build (recommended)
   npx eas build --platform android
   npx eas build --platform ios
   ```

## 🧹 Project Status

**✅ PRODUCTION READY** - Mobile app is fully integrated with the SmartTask backend API. All core features implemented and tested:

### Completed Features
- ✅ Full authentication system with JWT
- ✅ Complete task management CRUD operations
- ✅ AI chat integration with file upload
- ✅ Real-time WebSocket communication
- ✅ Modern UI with smooth navigation
- ✅ Form validation and error handling
- ✅ Local storage and offline support
- ✅ TypeScript implementation
- ✅ Production build configuration

### Upcoming Features
- 🔄 Push notifications
- 🔄 Biometric authentication
- 🔄 Dark theme support
- 🔄 Advanced task filtering
- 🔄 Calendar integration
- 🔄 Voice commands for AI assistant
- 🔄 Collaborative task sharing

## 🔀 Git Workflow & Branch Management

### Branch Structure
```bash
# Main branches
main                    # Production-ready code
develop                 # Integration branch for features
mobile/feature/*        # Feature development branches
mobile/bugfix/*         # Bug fix branches
mobile/release/*        # Release preparation branches
mobile/hotfix/*         # Emergency fixes for production
```

### Setting Up Your Development Branch
```bash
# Create and switch to a new feature branch
git checkout -b mobile/feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat(mobile): add your feature description"

# Push your branch to remote
git push -u origin mobile/feature/your-feature-name

# When ready, create a pull request to develop branch
```

### Commit Message Convention
Follow conventional commits for better tracking:
```bash
# Format: type(scope): description
feat(mobile): add user authentication
fix(mobile): resolve task creation bug
docs(mobile): update README with setup instructions
style(mobile): improve UI components styling
refactor(mobile): restructure navigation logic
test(mobile): add unit tests for auth service
chore(mobile): update dependencies
```

### Pre-commit Setup
Ensure code quality with pre-commit hooks:
```bash
# Install husky for git hooks
npm install --save-dev husky

# Set up pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
```

### Development Workflow
1. **Start from develop branch**:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create feature branch**:
   ```bash
   git checkout -b mobile/feature/new-feature
   ```

3. **Make changes and test**:
   ```bash
   # Make your changes
   npm run lint
   npm run type-check
   npm test
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat(mobile): implement new feature"
   git push -u origin mobile/feature/new-feature
   ```

5. **Create Pull Request**:
   - Target: `develop` branch
   - Include description of changes
   - Add screenshots for UI changes
   - Request review from team members

6. **After approval and merge**:
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d mobile/feature/new-feature
   ```

---

## 📞 Support & Contributing

### Getting Help
- Check the [Issues](../issues) section for known problems
- Review the backend API documentation
- Test connectivity with the ConnectivityTestScreen

### Contributing
1. Fork the repository
2. Create a feature branch
3. Follow TypeScript and ESLint guidelines
4. Test on both iOS and Android
5. Submit a pull request

---

**SmartTask Mobile** - Your intelligent task management companion, now in your pocket! 📱✨
