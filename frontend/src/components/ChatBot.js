import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Upload, 
  X, 
  Bot, 
  User, 
  FileText,
  CheckCircle,
  XCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/chatService';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [showTaskConfirmation, setShowTaskConfirmation] = useState(false);
  const { user } = useAuth();
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);  // Load conversation from backend on component mount, fallback to localStorage
  useEffect(() => {
    if (user && user.id) {
      const mainConversationId = `main_${user.id}`;
      setConversationId(mainConversationId);
      loadConversationHistory(mainConversationId);
    }
  }, [user]);

  const loadConversationHistory = async (convId) => {
    if (!user || !convId) return;
    
    try {
      // Try to load from backend first
      const conversation = await chatService.getMainConversation();
      if (conversation && conversation.messages && conversation.messages.length > 0) {
        const backendMessages = conversation.messages.map(msg => ({
          id: msg.id || uuidv4(),
          type: msg.role === 'user' ? 'user' : 'bot',
          content: msg.content,
          timestamp: new Date(msg.timestamp || msg.createdAt),
          isFile: msg.isFile || false,
          fileName: msg.fileName || null
        }));
        setMessages(backendMessages);
        // Also save to localStorage as backup
        saveConversation(backendMessages);
        return;
      }
    } catch (error) {
      console.error('Error loading conversation from backend:', error);
    }
      // Fallback to localStorage if backend fails or no conversation exists
    const savedConversation = localStorage.getItem(`chatbot-conversation-${convId}`);
    if (savedConversation) {
      try {
        const parsedMessages = JSON.parse(savedConversation);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map(message => ({
          ...message,
          timestamp: new Date(message.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Error loading saved conversation:', error);        // Initialize with welcome message if loading fails
        initializeConversation();
      }
    } else {
      initializeConversation();
    }
  };

  const initializeConversation = () => {
    const welcomeMessage = {
      id: uuidv4(),
      type: 'bot',
      content: 'Hi! I\'m your smart task assistant. I can help you manage your tasks, upload files to extract action items, and answer questions about your to-do list. How can I help you today?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    saveConversation([welcomeMessage]);
  };

  // Save conversation to localStorage whenever messages change
  const saveConversation = (messagesToSave) => {
    try {
      localStorage.setItem(`chatbot-conversation-${conversationId}`, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);  const addMessage = (type, content, additionalData = {}) => {
    const newMessage = {
      id: uuidv4(),
      type,
      content,
      timestamp: new Date(),
      ...additionalData
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    saveConversation(updatedMessages);
    return newMessage;
  };
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !conversationId) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message
    addMessage('user', userMessage);

    try {
      const response = await chatService.sendMessage(userMessage, conversationId);
      
      // Add bot response
      addMessage('bot', response.message);

      // Handle special actions
      if (response.suggestedTasks && response.suggestedTasks.length > 0) {
        setPendingTasks(response.suggestedTasks);
        setShowTaskConfirmation(true);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('bot', 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.txt', '.pdf', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast.error('Please upload a .txt, .pdf, or .docx file');
      return;
    }    setIsLoading(true);
    addMessage('user', `📎 Uploaded file: ${file.name}`, { isFile: true });

    try {
      const response = await chatService.uploadFile(file, conversationId);
      
      // Add bot response
      addMessage('bot', response.message);

      // Handle extracted tasks
      if (response.suggestedTasks && response.suggestedTasks.length > 0) {
        setPendingTasks(response.suggestedTasks);
        setShowTaskConfirmation(true);
      }

    } catch (error) {
      console.error('Error uploading file:', error);
      addMessage('bot', 'Sorry, I couldn\'t process that file. Please make sure it\'s a valid .txt, .pdf, or .docx file.');
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirmTasks = async (confirmed = true) => {
    if (!confirmed) {
      setPendingTasks([]);
      setShowTaskConfirmation(false);
      addMessage('bot', 'No problem! I won\'t add those tasks. Is there anything else I can help you with?');
      return;
    }

    setIsLoading(true);
    
    try {
      // Convert pending tasks to task requests
      const taskRequests = pendingTasks.map(task => ({
        title: task.title,
        description: task.description,
        priority: task.priority || 'MEDIUM',
        dueDate: task.dueDate
      }));

      const response = await chatService.confirmTasks(taskRequests);
      addMessage('bot', response.message);
      
      toast.success(`Successfully added ${pendingTasks.length} tasks!`);
      
    } catch (error) {
      console.error('Error confirming tasks:', error);
      addMessage('bot', 'Sorry, I couldn\'t add those tasks. Please try again.');
      toast.error('Failed to add tasks');
    } finally {
      setPendingTasks([]);
      setShowTaskConfirmation(false);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const toggleChatBot = () => {
    setIsOpen(!isOpen);
    if (isMinimized && !isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const clearConversation = () => {
    if (window.confirm('Are you sure you want to clear the conversation? This cannot be undone.')) {
      localStorage.removeItem(`chatbot-conversation-${conversationId}`);
      initializeConversation();
    }  };
  
  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChatBot}
          className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-[1001] transition-all duration-300 hover:scale-110"
          title="Open Smart Assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Sidebar */}
      {isOpen && (
        <div className={`fixed top-0 right-0 h-full bg-white shadow-2xl border-l z-[1001] transition-all duration-300 ${
          isMinimized ? 'w-16' : 'w-96'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white">
            <div className={`flex items-center space-x-2 ${isMinimized ? 'justify-center w-full' : ''}`}>
              <Bot size={20} />
              {!isMinimized && <span className="font-semibold">Smart Assistant</span>}
            </div>
            {!isMinimized && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearConversation}
                  className="hover:bg-blue-700 p-1 rounded"
                  title="Clear conversation"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={toggleMinimize}
                  className="hover:bg-blue-700 p-1 rounded"
                  title="Minimize"
                >
                  <Minimize2 size={16} />
                </button>
                <button
                  onClick={toggleChatBot}
                  className="hover:bg-blue-700 p-1 rounded"
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {isMinimized && (
              <button
                onClick={toggleMinimize}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hover:bg-blue-700 p-1 rounded"
                title="Expand"
              >
                <Maximize2 size={16} />
              </button>
            )}
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100vh - 200px)' }}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[85%] ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <div className={`p-2 rounded-full flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className={`p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {message.isFile ? (
                          <div className="flex items-center space-x-2">
                            <FileText size={16} />
                            <span className="text-sm">{message.content}</span>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}                        <div className="text-xs opacity-70 mt-1">
                          {(() => {
                            const timestamp = message.timestamp instanceof Date 
                              ? message.timestamp 
                              : new Date(message.timestamp);
                            return timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="p-2 rounded-full bg-gray-100 text-gray-600">
                        <Bot size={16} />
                      </div>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Task Confirmation */}
              {showTaskConfirmation && pendingTasks.length > 0 && (
                <div className="border-t bg-yellow-50 p-4">
                  <p className="text-sm font-medium text-yellow-800 mb-2">
                    Found {pendingTasks.length} tasks:
                  </p>
                  <div className="space-y-1 mb-3 max-h-20 overflow-y-auto">
                    {pendingTasks.map((task, index) => (
                      <div key={index} className="text-xs text-yellow-700">
                        • {task.title}
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleConfirmTasks(true)}
                      className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                      disabled={isLoading}
                    >
                      <CheckCircle size={14} />
                      <span>Add All</span>
                    </button>
                    <button
                      onClick={() => handleConfirmTasks(false)}
                      className="flex items-center space-x-1 bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
                      disabled={isLoading}
                    >
                      <XCircle size={14} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-4 space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 text-xs"
                  >
                    <Upload size={14} />
                    <span>Upload file</span>
                  </button>
                  <div className="text-xs text-gray-500">
                    .txt, .pdf, .docx
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBot;
