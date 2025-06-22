import React, { useState, useEffect } from 'react';
import webSocketService from '../services/webSocketService';
import { useAuth } from '../context/AuthContext';

const WebSocketDebugger = ({ isVisible, onClose }) => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [messages, setMessages] = useState([]);
  const [lastMessage, setLastMessage] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.id) {
      console.log('🔌 Attempting to connect WebSocket for user:', user.id);
      
      const onConnected = (frame) => {
        console.log('✅ WebSocket Connected:', frame);
        setConnectionStatus('Connected');
      };

      const onError = (error) => {
        console.error('❌ WebSocket Error:', error);
        setConnectionStatus('Error: ' + error.message);
      };

      // Connect to WebSocket
      webSocketService.connect(user.id, onConnected, onError);

      // Register message handlers for debugging
      const removeTaskHandler = webSocketService.onMessage('tasks', (message) => {
        console.log('📨 Received task message:', message);
        setLastMessage({ type: 'tasks', data: message, timestamp: new Date() });
        setMessages(prev => [...prev.slice(-9), { type: 'tasks', data: message, timestamp: new Date() }]);
      });

      const removeNotificationHandler = webSocketService.onMessage('notifications', (message) => {
        console.log('🔔 Received notification:', message);
        setLastMessage({ type: 'notifications', data: message, timestamp: new Date() });
        setMessages(prev => [...prev.slice(-9), { type: 'notifications', data: message, timestamp: new Date() }]);
      });

      const removeSystemHandler = webSocketService.onMessage('system-notifications', (message) => {
        console.log('🌐 Received system notification:', message);
        setLastMessage({ type: 'system', data: message, timestamp: new Date() });
        setMessages(prev => [...prev.slice(-9), { type: 'system', data: message, timestamp: new Date() }]);
      });

      // Cleanup
      return () => {
        removeTaskHandler();
        removeNotificationHandler();
        removeSystemHandler();
        webSocketService.disconnect();
        setConnectionStatus('Disconnected');
      };
    }
  }, [user]);

  const testConnection = () => {
    console.log('🧪 Testing WebSocket connection...');
    console.log('WebSocket connected:', webSocketService.isConnected());
    console.log('User:', user);
  };
  const sendTestMessage = () => {
    if (webSocketService.isConnected()) {
      webSocketService.sendMessage('/app/test', { message: 'Test message', timestamp: new Date() });
      console.log('📤 Sent test message');
    } else {
      console.log('❌ WebSocket not connected');
    }
  };
  const testRedisIntegration = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/tasks/test-redis', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      console.log('🧪 Redis test result:', result);
      alert('Redis test sent! Check console and debugger for results.');
    } catch (error) {
      console.error('❌ Redis test failed:', error);
      alert('Redis test failed: ' + error.message);
    }
  };

  const clearAuthAndReload = () => {
    console.log('🧹 Clearing authentication data and reloading...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    webSocketService.disconnect();
    window.location.reload();  };
  
  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: isMinimized ? '10px' : '15px', 
      borderRadius: '8px',
      maxWidth: isMinimized ? '200px' : '400px',
      fontSize: '12px',
      zIndex: 999,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease'
    }}>      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMinimized ? '0' : '10px' }}>
        <h4 style={{ margin: '0', color: '#333', fontSize: isMinimized ? '11px' : '12px' }}>
          {isMinimized ? 'WS Debug' : 'WebSocket Debug Panel'}
        </h4>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              padding: '2px 5px',
              borderRadius: '3px',
              hover: { background: '#f0f0f0' }
            }}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              padding: '2px 5px',
              borderRadius: '3px',
              color: '#666',
              hover: { background: '#f0f0f0' }
            }}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <div style={{ marginBottom: '10px' }}>
            <strong>Status:</strong> 
            <span style={{ 
              color: connectionStatus === 'Connected' ? 'green' : 'red',
              marginLeft: '5px'
            }}>
              {connectionStatus}
            </span>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>User ID:</strong> {user?.id || 'Not logged in'}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <button onClick={testConnection} style={{ marginRight: '5px', fontSize: '11px' }}>
              Test Connection
            </button>
            <button onClick={sendTestMessage} style={{ marginRight: '5px', fontSize: '11px' }}>
              Send Test Message
            </button>
            <button onClick={testRedisIntegration} style={{ marginRight: '5px', fontSize: '11px' }}>
              Test Redis
            </button>
            <button onClick={clearAuthAndReload} style={{ fontSize: '11px', backgroundColor: '#ff4444', color: 'white' }}>
              Clear Auth & Reload
            </button>
          </div>

          {lastMessage && (
            <div style={{ marginBottom: '10px', padding: '8px', background: '#f0f0f0', borderRadius: '4px' }}>
              <strong>Last Message:</strong>
              <div>Type: {lastMessage.type}</div>
              <div>Time: {lastMessage.timestamp.toLocaleTimeString()}</div>
              <div>Data: {JSON.stringify(lastMessage.data, null, 2).substring(0, 100)}...</div>
            </div>
          )}

          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            <strong>Recent Messages ({messages.length}):</strong>
            {messages.length === 0 ? (
              <div style={{ fontStyle: 'italic', color: '#666' }}>No messages received</div>
            ) : (
              messages.map((msg, index) => (
                <div key={`${msg.type}-${msg.timestamp.getTime()}-${index}`} style={{ 
                  padding: '4px', 
                  margin: '2px 0', 
                  background: '#f8f8f8', 
                  borderRadius: '2px',
                  fontSize: '10px'
                }}>
                  <strong>{msg.type}</strong> at {msg.timestamp.toLocaleTimeString()}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {isMinimized && (
        <div style={{ fontSize: '10px', color: connectionStatus === 'Connected' ? 'green' : 'red' }}>
          {connectionStatus} | {user?.id ? 'Logged in' : 'Not logged in'}
        </div>
      )}
    </div>
  );
};

export default WebSocketDebugger;
