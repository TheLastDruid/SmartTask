#!/bin/bash
# setup_groq.sh - Script to configure Groq API for SmartTask

echo "=========================================="
echo "SmartTask - Groq API Setup"
echo "=========================================="
echo ""

# Check if GROQ_API_KEY is provided as argument
if [ -n "$1" ]; then
    GROQ_API_KEY="$1"
    echo "Using provided Groq API key..."
else
    echo "Please enter your Groq API key:"
    echo "(You can get one free from https://console.groq.com/keys)"
    read -p "Groq API Key: " GROQ_API_KEY
fi

if [ -z "$GROQ_API_KEY" ]; then
    echo "❌ Error: Groq API key is required!"
    echo "Get your free API key from: https://console.groq.com/keys"
    exit 1
fi

# Update .env file
echo "📝 Updating .env file..."
if [ -f ".env" ]; then
    # Replace existing GROQ_API_KEY line or add it
    if grep -q "GROQ_API_KEY=" .env; then
        sed -i "s/GROQ_API_KEY=.*/GROQ_API_KEY=$GROQ_API_KEY/" .env
    else
        echo "GROQ_API_KEY=$GROQ_API_KEY" >> .env
    fi
    echo "✅ .env file updated successfully!"
else
    echo "❌ Error: .env file not found!"
    exit 1
fi

# Update application.properties for development
echo "📝 Updating application.properties..."
PROPS_FILE="backend/src/main/resources/application.properties"
if [ -f "$PROPS_FILE" ]; then
    if grep -q "groq.api.key=" "$PROPS_FILE"; then
        sed -i "s|groq.api.key=.*|groq.api.key=$GROQ_API_KEY|" "$PROPS_FILE"
    else
        echo "groq.api.key=$GROQ_API_KEY" >> "$PROPS_FILE"
    fi
    echo "✅ application.properties updated successfully!"
else
    echo "❌ Warning: application.properties not found at $PROPS_FILE"
fi

echo ""
echo "🎉 Groq API setup completed!"
echo ""
echo "Next steps:"
echo "1. Restart your backend server"
echo "2. Test the chat functionality in your application"
echo ""
echo "Available Groq models:"
echo "- llama-3.1-8b-instant (default)"
echo "- llama-3.1-70b-versatile"
echo "- mixtral-8x7b-32768"
echo ""
echo "For more models, visit: https://console.groq.com/docs/models"
