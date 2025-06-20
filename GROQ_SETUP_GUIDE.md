# SmartTask - Groq Integration Setup Guide

This guide will help you replace the Ollama integration with Groq API for faster, cloud-based AI responses.

## 🚀 Quick Setup

### 1. Get Your Groq API Key
1. Visit [Groq Console](https://console.groq.com/keys)
2. Sign up for a free account if you don't have one
3. Create a new API key
4. Copy the API key (it starts with `gsk_...`)

### 2. Configure the API Key

#### Option A: Using the Setup Script (Recommended)
```powershell
# Run the PowerShell setup script
.\setup_groq.ps1 your-groq-api-key-here

# Or run it interactively
.\setup_groq.ps1
```

#### Option B: Manual Configuration
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` file and add your API key:
   ```
   GROQ_API_KEY=your-actual-groq-api-key-here
   ```

3. **IMPORTANT**: Never commit `.env` to version control! It should already be in `.gitignore`.
   ```properties
   groq.api.key=your-groq-api-key-here
   ```

### 3. Start the Application

1. **Start Infrastructure** (MongoDB - Ollama no longer needed):
   ```powershell
   docker-compose -f docker-compose.infra.yml up -d mongodb
   ```

2. **Start Backend**:
   ```powershell
   cd backend
   mvn spring-boot:run
   ```

3. **Start Frontend**:
   ```powershell
   cd frontend
   pnpm start
   ```

### 4. Test the Integration

1. Open your browser and go to `http://localhost:3000`
2. Log in to your account
3. Look for the chat bubble (usually bottom-right corner)
4. Click the chat bubble and send a message like "Create a task to buy groceries"
5. The AI should respond using Groq instead of Ollama

## 🔧 What Changed

### Backend Changes:
- **New GroqService**: Replaces OllamaService with Groq API integration
- **Updated ChatBotService**: Now uses GroqService instead of OllamaService  
- **Updated ChatBotController**: Health check now includes Groq status
- **Configuration**: Added Groq API settings in application.properties

### Frontend Changes:
- **Uncommented ChatBot**: The chat popup is now visible in the UI
- **No other changes needed**: Frontend remains the same

## 🎯 Available Groq Models

The default model is `llama-3.1-8b-instant`, but you can change it in `application.properties`:

```properties
groq.model=llama-3.1-8b-instant     # Default - Fastest and most reliable
groq.model=llama-3.2-11b-text-preview  # Latest medium model (if available)
groq.model=llama-3.2-90b-text-preview  # Latest large model (if available)
```

**⚠️ Important**: Groq frequently decommissions models. Many previously available models like:
- ❌ `llama-3.1-70b-versatile` (recently decommissioned)
- ❌ `mixtral-8x7b-32768` (decommissioned)
- ❌ `llama-4-scout-17b-16e-instruct` (never existed)

Always check [Groq's model documentation](https://console.groq.com/docs/models) for the latest available models. If you get a "model decommissioned" error, switch to `llama-3.1-8b-instant` which is the most stable option.

## 🚦 Health Check

Check if Groq integration is working:
```powershell
curl http://localhost:8080/api/chat/health
```

Expected response:
```json
{
  "service": "ChatBot with Groq AI",
  "groq_status": "UP",
  "status": "UP",
  "timestamp": "1640995200000"
}
```

## 🔄 Rollback to Ollama (if needed)

If you want to go back to Ollama:

1. Start Ollama container:
   ```powershell
   docker-compose -f docker-compose.infra.yml up -d
   ```

2. Update ChatBotService.java to use OllamaService instead of GroqService

3. Restart the backend

## 🆘 Troubleshooting

### "Invalid API Key" Error
- Double-check your API key starts with `gsk_`
- Make sure there are no extra spaces in the key
- Try regenerating the API key from Groq Console

### Chat Popup Not Showing
- Make sure you're logged in
- Check browser console for JavaScript errors
- Ensure frontend is running on http://localhost:3000

### "Model has been decommissioned" Error
- Groq frequently retires models without much notice
- Update to `llama-3.1-8b-instant` which is the most stable
- Change in `application.properties`: `groq.model=llama-3.1-8b-instant`
- Restart the backend after making changes

### "Groq API call failed" Error
- Check your internet connection
- Verify API key is correctly configured
- Check backend logs for detailed error messages

## 💰 Groq Pricing

Groq offers:
- **Free Tier**: Generous limits for development and testing
- **Pay-per-use**: Only pay for what you use
- **Much faster**: Responses typically under 1 second vs several seconds with local Ollama

## 📚 Next Steps

1. **Test thoroughly**: Try different types of requests (create tasks, list tasks, general questions)
2. **Customize prompts**: Modify the prompts in GroqService.java for better responses
3. **Monitor usage**: Keep an eye on your Groq API usage in the console
4. **Consider upgrading**: If you hit free tier limits, Groq's paid tiers are very reasonable

---

The integration is now complete! Your SmartTask application will use Groq's lightning-fast AI instead of local Ollama, providing much better performance and reliability.
