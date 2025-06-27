import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/chatService';
import notificationService from '../utils/notificationService';
import Logger from '../utils/logger';

const ChatBot = ({ onTaskUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [showTaskConfirmation, setShowTaskConfirmation] = useState(false);
  const { user } = useAuth();
    const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const loadConversationHistory = useCallback(async (convId) => {
    if (!user || !convId) return;
    
    Logger.debug('Loading conversation history for:', convId);
    
    try {
      // Try to load from backend first
      const conversation = await chatService.getMainConversation();
      if (conversation && conversation.messages && conversation.messages.length > 0) {
        Logger.debug('Loaded from backend:', conversation.messages.length, 'messages');
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
        try {
          localStorage.setItem(`chatbot-conversation-${convId}`, JSON.stringify(backendMessages));
        } catch (error) {
          Logger.error('Error saving conversation to localStorage:', error);
        }
        return;
      }
    } catch (error) {
      Logger.error('Error loading conversation from backend:', error);
    }
      // Fallback to localStorage if backend fails or no conversation exists
    const savedConversation = localStorage.getItem(`chatbot-conversation-${convId}`);
    if (savedConversation) {
      try {
        const parsedMessages = JSON.parse(savedConversation);
        Logger.debug('Loaded from localStorage:', parsedMessages.length, 'messages');
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsedMessages.map(message => ({
          ...message,
          timestamp: new Date(message.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        Logger.error('Error loading saved conversation:', error);        // Initialize with welcome message if loading fails
        const welcomeMessage = {
          id: uuidv4(),
          type: 'bot',
          content: 'Hi! I\'m your smart task assistant. I can help you manage your tasks, upload files to extract action items, and answer questions about your to-do list. How can I help you today?',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
        try {
          localStorage.setItem(`chatbot-conversation-${convId}`, JSON.stringify([welcomeMessage]));
        } catch (error) {
          Logger.error('Error saving welcome message to localStorage:', error);
        }
      }
    } else {
      Logger.debug('No saved conversation found, initializing');
      const welcomeMessage = {
        id: uuidv4(),
        type: 'bot',
        content: 'Hi! I\'m your smart task assistant. I can help you manage your tasks, upload files to extract action items, and answer questions about your to-do list. How can I help you today?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      try {
        localStorage.setItem(`chatbot-conversation-${convId}`, JSON.stringify([welcomeMessage]));
      } catch (error) {
        Logger.error('Error saving welcome message to localStorage:', error);
      }
    }
  }, [user]);

  // Load conversation from backend on component mount, fallback to localStorage
  useEffect(() => {
    Logger.debug('useEffect triggered, user:', user?.id, 'conversationId:', conversationId);
    if (user && user.id && !conversationId) {
      const mainConversationId = `main_${user.id}`;
      Logger.debug('Setting conversation ID:', mainConversationId);
      setConversationId(mainConversationId);
      loadConversationHistory(mainConversationId);
    }
  }, [user, conversationId, loadConversationHistory]);
  // Save conversation to localStorage whenever messages change
  const saveConversation = (messagesToSave) => {
    try {
      if (conversationId) {
        localStorage.setItem(`chatbot-conversation-${conversationId}`, JSON.stringify(messagesToSave));
      }
    } catch (error) {
      Logger.error('Error saving conversation:', error);
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
    Logger.debug('Adding message:', newMessage);
    Logger.debug('Current messages before add:', messages.length);
    
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newMessage];
      Logger.debug('Updated messages after add:', updatedMessages.length);
      // Save to localStorage in the state setter to ensure it happens after state update
      setTimeout(() => saveConversation(updatedMessages), 0);
      return updatedMessages;
    });
    
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

      // Check if this was a task-related action and refresh tasks
      const taskActions = ['CREATE', 'UPDATE', 'DELETE', 'MARK_COMPLETE', 'BULK_MARK_COMPLETE'];
      const isTaskAction = taskActions.some(action => 
        response.message.includes('✅') || 
        response.message.includes('created') ||
        response.message.includes('updated') ||
        response.message.includes('deleted') ||
        response.message.includes('completed') ||
        response.message.includes('marked')
      );

      if (isTaskAction && onTaskUpdate) {
        // Trigger task refresh in parent component
        Logger.debug('Task action detected, triggering refresh');
        onTaskUpdate();
        
        // Show brief success notification for task operations
        if (response.message.includes('✅')) {
          notificationService.chatResponse('Task updated successfully');
        }
      }

      // Handle special actions
      if (response.suggestedTasks && response.suggestedTasks.length > 0) {
        setPendingTasks(response.suggestedTasks);
        setShowTaskConfirmation(true);
      }

    } catch (error) {
      Logger.error('Error sending message:', error);
      addMessage('bot', 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.');
      notificationService.error('Failed to send message. Please try again.');
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
      notificationService.error('Please upload a .txt, .pdf, or .docx file');
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
      Logger.error('Error uploading file:', error);
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
      
      // Less intrusive success notification
      notificationService.taskUpdate(`${pendingTasks.length} tasks added`);
      
    } catch (error) {
      Logger.error('Error confirming tasks:', error);
      addMessage('bot', 'Sorry, I couldn\'t add those tasks. Please try again.');
      notificationService.error('Failed to add tasks');
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
      // Initialize with welcome message
      const welcomeMessage = {
        id: uuidv4(),
        type: 'bot',
        content: 'Hi! I\'m your smart task assistant. I can help you manage your tasks, upload files to extract action items, and answer questions about your to-do list. How can I help you today?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      try {
        localStorage.setItem(`chatbot-conversation-${conversationId}`, JSON.stringify([welcomeMessage]));
      } catch (error) {
        Logger.error('Error saving welcome message to localStorage:', error);
      }
    }  };
  
  return (
    <>      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChatBot}
          className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-[1001] transition-all duration-300 hover:scale-105"
          title="Open Smart Assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Sidebar */}
      {isOpen && (
        <div className={`fixed top-0 right-0 h-full bg-white shadow-2xl border-l border-gray-200 z-[1001] transition-all duration-300 flex flex-col ${
          isMinimized ? 'w-16' : 'w-full sm:w-96'
        }`}>          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm">
            <div className={`flex items-center space-x-3 ${isMinimized ? 'justify-center w-full' : ''}`}>
              <div className="p-2 bg-white/10 rounded-lg">
                <Bot size={20} />
              </div>
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
            <>              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide" style={{ height: 'calc(100vh - 160px)' }}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}
                  >
                    <div className={`flex items-start space-x-3 max-w-[85%] ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      <div className={`p-2 rounded-full flex-shrink-0 shadow-sm ${
                        message.type === 'user' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className={`p-3 rounded-2xl shadow-sm ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      }`}>
                        {message.isFile ? (
                          <div className="flex items-center space-x-2">
                            <FileText size={16} />
                            <span className="text-sm">{message.content}</span>
                          </div>                        ) : (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        )}
                        <div className="text-xs opacity-70 mt-2 font-medium">
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
              </div>              {/* Task Confirmation */}
              {showTaskConfirmation && pendingTasks.length > 0 && (
                <div className="border-t bg-gradient-to-r from-yellow-50 to-orange-50 p-4 shadow-inner">
                  <p className="text-sm font-semibold text-yellow-800 mb-3">
                    🎯 Found {pendingTasks.length} tasks:
                  </p>
                  <div className="space-y-2 mb-4 max-h-20 overflow-y-auto">
                    {pendingTasks.map((task, index) => (
                      <div key={index} className="text-xs text-yellow-700 bg-white/50 rounded-lg p-2">
                        • {task.title}
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleConfirmTasks(true)}
                      className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors shadow-sm"
                      disabled={isLoading}
                    >
                      <CheckCircle size={14} />
                      <span>Add All</span>
                    </button>
                    <button
                      onClick={() => handleConfirmTasks(false)}
                      className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors shadow-sm"
                      disabled={isLoading}
                    >
                      <XCircle size={14} />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}              {/* Input Area */}
              <div className="border-t bg-white p-4 space-y-3 shadow-lg">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
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
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 text-xs bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                  >
                    <Upload size={14} />
                    <span>Upload file</span>
                  </button>
                  <div className="text-xs text-gray-500 font-medium">
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
