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
import chatService from '../services/chatService';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: uuidv4(),
      type: 'bot',
      content: 'Hi! I\'m your smart task assistant. I can help you manage your tasks, upload files to extract action items, and answer questions about your to-do list. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(uuidv4());
  const [pendingTasks, setPendingTasks] = useState([]);
  const [showTaskConfirmation, setShowTaskConfirmation] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type, content, additionalData = {}) => {
    const newMessage = {
      id: uuidv4(),
      type,
      content,
      timestamp: new Date(),
      ...additionalData
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message
    addMessage('user', userMessage);    try {
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
    }

    setIsLoading(true);
    addMessage('user', `📎 Uploaded file: ${file.name}`, { isFile: true });

    try {
      const response = await chatService.uploadFile(file);
      
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
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleChatBot}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 z-50"
        title="Open Smart Assistant"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Bot size={20} />
          <span className="font-semibold">Smart Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMinimize}
            className="hover:bg-blue-700 p-1 rounded"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={toggleChatBot}
            className="hover:bg-blue-700 p-1 rounded"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-80">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`p-2 rounded-full ${
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
                        <span>{message.content}</span>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
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
          <div className="border-t p-4 space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message or ask about tasks..."
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
                Supports .txt, .pdf, .docx
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;
