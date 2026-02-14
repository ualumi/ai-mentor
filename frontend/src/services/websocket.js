// services/websocket.js
/*class WebSocketService {
  constructor() {
    this.ws = null;
    this.messageHandlers = new Map();
    this.connectionPromise = null;
  }

  connect(url = "ws://localhost:8004/ws/tasks/test1") {
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('⬅️ Received:', data);
        
        // Вызываем обработчики для этого типа сообщения
        const handlers = this.messageHandlers.get(data.type) || [];
        handlers.forEach(handler => handler(data));
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.connectionPromise = null;
        this.messageHandlers.clear();
      };
    });

    return this.connectionPromise;
  }

  async send(event, data = {}) {
    await this.connect();
    const message = JSON.stringify({ event, ...data });
    console.log('➡️ Sending:', message);
    this.ws.send(message);
  }

  on(eventType, handler) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }
    this.messageHandlers.get(eventType).push(handler);
  }

  off(eventType, handler) {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) handlers.splice(index, 1);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connectionPromise = null;
    }
  }
}

export const wsService = new WebSocketService();*/
// services/websocket.js
class WebSocketService {
  constructor() {
    this.ws = null;
    this.messageHandlers = new Map();
    this.connectionPromise = null;
    this.isConnected = false;
    this.pendingMessages = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.url = null;
  }

  connect(url = "ws://localhost:8004/ws/tasks/test1") {
    this.url = url;
    
    // Если уже подключены, возвращаем успех
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('✅ Already connected');
      return Promise.resolve();
    }

    // Если соединение в процессе установки, возвращаем существующий промис
    if (this.connectionPromise) {
      console.log('⏳ Connection already in progress');
      return this.connectionPromise;
    }

    console.log(`🔄 Connecting to WebSocket... (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts + 1})`);
    
    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        // Таймаут для соединения
        const connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            console.error('❌ Connection timeout');
            this.ws.close();
            reject(new Error('Connection timeout'));
          }
        }, 5000);

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('✅ WebSocket connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Отправляем все накопленные сообщения
          while (this.pendingMessages.length > 0) {
            const message = this.pendingMessages.shift();
            this.ws.send(message);
            console.log('📤 Sent queued message:', message);
          }
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            console.log('📥 Raw message received:', event.data);
            const data = JSON.parse(event.data);
            console.log('⬅️ Parsed message:', data);
            
            // Определяем тип сообщения
            const messageType = data.type || data.event || 'message';
            
            // Вызываем обработчики
            const handlers = this.messageHandlers.get(messageType) || [];
            handlers.forEach(handler => {
              try {
                handler(data);
              } catch (e) {
                console.error(`Error in handler for ${messageType}:`, e);
              }
            });
            
            // Также вызываем общие обработчики
            const generalHandlers = this.messageHandlers.get('*') || [];
            generalHandlers.forEach(handler => {
              try {
                handler(data);
              } catch (e) {
                console.error('Error in wildcard handler:', e);
              }
            });
          } catch (error) {
            console.error('❌ Error parsing message:', error, 'Raw data:', event.data);
          }
        };

        this.ws.onerror = (event) => {
          console.error('❌ WebSocket error:', event);
          console.log('WebSocket state:', this.ws ? this.ws.readyState : 'no websocket');
          
          // Дополнительная диагностика
          if (this.ws) {
            console.log('ReadyState:', this.ws.readyState);
            console.log('URL:', this.ws.url);
          }
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log(`🔌 WebSocket closed. Code: ${event.code}, Reason: ${event.reason || 'No reason'}, Clean: ${event.wasClean}`);
          
          this.isConnected = false;
          this.ws = null;
          this.connectionPromise = null;
          
          // Пытаемся переподключиться если это не было чистым закрытием
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
            console.log(`🔄 Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
              if (!this.isConnected) {
                this.connect(this.url);
              }
            }, delay);
          } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
          }
        };

      } catch (error) {
        console.error('❌ Error creating WebSocket:', error);
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  async send(event, data = {}) {
    try {
      // Проверяем и подключаемся
      if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
        console.log('⏳ Not connected, connecting before send...');
        await this.connect(this.url);
      }
      
      const message = JSON.stringify({ event, ...data });
      console.log('➡️ Sending message:', message);
      
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(message);
        console.log('✅ Message sent');
        return true;
      } else {
        console.error('❌ WebSocket not ready after connect attempt');
        throw new Error('WebSocket not ready');
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }

  on(eventType, handler) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }
    this.messageHandlers.get(eventType).push(handler);
    console.log(`👂 Handler registered for event: ${eventType}`);
  }

  off(eventType, handler) {
    const handlers = this.messageHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
        console.log(`👋 Handler removed for event: ${eventType}`);
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Normal closure');
      this.ws = null;
      this.isConnected = false;
      this.connectionPromise = null;
      this.pendingMessages = [];
      this.reconnectAttempts = 0;
      console.log('🔌 Disconnected manually');
    }
  }

  getConnectionState() {
    if (!this.ws) return 'DISCONNECTED';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}

export const wsService = new WebSocketService();