/**
 * Enhanced ChatScreen with AI assistant, file upload, and        const formattedMessages = conversation.mes        response = await apiService.uploadFileToChat(content, fileName ?? 'file');ages.map((msg: any) => ({
          id: msg.id ?? Date.now().toString(),
          type: msg.role === 'user' ? 'user' : 'bot',
          content: msg.content,
          timestamp: new Date(msg.timestamp ?? msg.createdAt),
          isFile: msg.isFile ?? false,
          fileName: msg.fileName ?? null,
        }));eation
 * Based on frontend ChatBot functionality
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/apiService';
import { useRealTimeChat } from '../../hooks/useRealTime';
import { CreateTaskRequest } from '../../types';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isFile?: boolean;
  fileName?: string;
}

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [pendingTasks, setPendingTasks] = useState<CreateTaskRequest[]>([]);
  const [showTaskConfirmation, setShowTaskConfirmation] = useState(false);
  
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  // Real-time chat updates - kept for future features
  useRealTimeChat();

  // Load conversation history on mount
  useEffect(() => {
    loadConversationHistory();
  }, []);

  const loadConversationHistory = async () => {
    try {
      const conversation = await apiService.getMainConversation();
      if (conversation?.messages) {
        const formattedMessages = conversation.messages.map((msg: any) => ({
          id: msg.id || Date.now().toString(),
          type: (msg.role === 'user' ? 'user' : 'bot') as 'user' | 'bot',
          content: msg.content,
          timestamp: new Date(msg.timestamp || msg.createdAt),
          isFile: msg.isFile || false,
          fileName: msg.fileName || null,
        }));
        setMessages(formattedMessages);
        setConversationId(conversation.id);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
      // Start with welcome message if no history
      setMessages([{
        id: '1',
        type: 'bot',
        content: 'Hello! I\'m your AI assistant. I can help you manage tasks, answer questions, and more. How can I help you today?',
        timestamp: new Date(),
      }]);
    }
  };

  const sendMessage = async (content: string, isFile = false, fileName?: string) => {
    if (!content.trim() && !isFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
      isFile,
      fileName,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let response;
      if (isFile) {
        // Handle file upload
        response = await apiService.uploadFileToChat(content, fileName || 'file');
      } else {
        // Handle text message
        response = await apiService.sendChatMessage(content, conversationId);
      }

      // Add bot response
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

      // Update conversation ID if this is the first message
      if (!conversationId && response.conversationId) {
        setConversationId(response.conversationId);
      }

      // Handle pending tasks if any
      if (response.suggestedTasks && response.suggestedTasks.length > 0) {
        setPendingTasks(response.suggestedTasks);
        setShowTaskConfirmation(true);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(inputMessage);
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        
        // Check file size (10MB limit)
        if (file.size && file.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a file smaller than 10MB.');
          return;
        }

        // Read file content (for text files, you might want to implement proper file reading)
        const fileContent = `[File uploaded: ${file.name}]`;
        await sendMessage(fileContent, true, file.name);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Upload Error', 'Failed to upload file. Please try again.');
    }
  };

  const confirmTasks = async () => {
    try {
      setIsLoading(true);
      await apiService.confirmChatTasks(pendingTasks, conversationId);
      
      const confirmationMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `Great! I've created ${pendingTasks.length} task(s) for you. You can view and manage them in the Tasks tab.`,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, confirmationMessage]);
      setPendingTasks([]);
      setShowTaskConfirmation(false);
    } catch (error) {
      console.error('Error confirming tasks:', error);
      Alert.alert('Error', 'Failed to create tasks. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelTasks = () => {
    setPendingTasks([]);
    setShowTaskConfirmation(false);
    
    const cancelMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: 'No problem! The tasks won\'t be created. Is there anything else I can help you with?',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, cancelMessage]);
  };

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.type === 'user';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.botMessage]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
          {!isUser && (
            <View style={styles.botIcon}>
              <Ionicons name="chatbubble-ellipses" size={16} color="#3b82f6" />
            </View>
          )}
          
          <View style={styles.messageContent}>
            {item.isFile && (
              <View style={styles.fileMessage}>
                <Ionicons name="document" size={16} color={isUser ? 'white' : '#374151'} />
                <Text style={[styles.fileName, isUser ? styles.userText : styles.botText]}>
                  {item.fileName}
                </Text>
              </View>
            )}
            
            <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
              {item.content}
            </Text>
          </View>
          
          {isUser && (
            <View style={styles.userIcon}>
              <Ionicons name="person" size={16} color="white" />
            </View>
          )}
        </View>
        
        <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.botTimestamp]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  const renderTaskConfirmation = () => {
    if (!showTaskConfirmation) return null;

    return (
      <View style={styles.taskConfirmationContainer}>
        <View style={styles.taskConfirmationHeader}>
          <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          <Text style={styles.taskConfirmationTitle}>Confirm Task Creation</Text>
        </View>
        
        <Text style={styles.taskConfirmationText}>
          I found {pendingTasks.length} task(s) to create:
        </Text>
        
        {pendingTasks.map((task) => (
          <View key={`${task.title}-${task.description}`} style={styles.pendingTask}>
            <Text style={styles.pendingTaskTitle}>• {task.title}</Text>
            <Text style={styles.pendingTaskDescription}>{task.description}</Text>
            {task.priority && (
              <Text style={styles.pendingTaskMeta}>Priority: {task.priority}</Text>
            )}
            {task.dueDate && (
              <Text style={styles.pendingTaskMeta}>Due: {task.dueDate}</Text>
            )}
          </View>
        ))}
        
        <View style={styles.taskConfirmationActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={cancelTasks}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={confirmTasks}>
            <Text style={styles.confirmButtonText}>Create Tasks</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={20} color="#3b82f6" />
          </View>
          <Text style={styles.title}>AI Assistant</Text>
        </View>
        <TouchableOpacity style={styles.clearButton} onPress={() => setMessages([])}>
          <Ionicons name="refresh" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        />

        {renderTaskConfirmation()}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handleFileUpload}>
            <Ionicons name="attach" size={24} color="#6b7280" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Ask me anything or describe a task..."
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity 
            style={[styles.sendButton, (!inputMessage.trim() || isLoading) && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={!inputMessage.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  clearButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 20,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  botMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    flexDirection: 'row',
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 8,
    alignItems: 'flex-end',
    gap: 8,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  botIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContent: {
    flex: 1,
  },
  fileMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  botText: {
    color: '#374151',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    marginHorizontal: 8,
  },
  userTimestamp: {
    color: '#9ca3af',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#9ca3af',
    textAlign: 'left',
  },
  taskConfirmationContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  taskConfirmationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  taskConfirmationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  taskConfirmationText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  pendingTask: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  pendingTaskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  pendingTaskDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  pendingTaskMeta: {
    fontSize: 12,
    color: '#9ca3af',
  },
  taskConfirmationActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  attachButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f9fafb',
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
});

export default ChatScreen;
