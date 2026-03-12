
// services/websocket.js
{/*class WebSocketService {
  constructor() {
    this.ws = null;
    this.messageHandlers = new Map();
    this.connectionPromise = null;
    this.isConnected = false;
    this.pendingMessages = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.url = null;
    console.log("NEW WS SERVICE INSTANCE CREATED");
  }

  connect(url = "ws://localhost:8004/ws/2") {
    console.log("CONNECT CALLED");
    this.url = url;
    
    //if (this.ws) {
    //  console.log("⚠️ WebSocket already exists. State:", this.ws.readyState);
    //  return this.connectionPromise || Promise.resolve();
    //}
    // Если уже подключены, возвращаем успех
    //if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
    //  console.log('✅ Already connected');
    //  return Promise.resolve();
    //}

    // Если соединение в процессе установки, возвращаем существующий промис
    //if (this.connectionPromise) {
    //  console.log('⏳ Connection already in progress');
    //  return this.connectionPromise;
    //}

      // если сокет уже открыт — выходим
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.log("✅ WS already open");
        return Promise.resolve();
      }

      // если в процессе подключения — возвращаем промис
      if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
        console.log("⏳ WS already connecting");
        return this.connectionPromise;
      }

      // если сокет есть, но CLOSED — очищаем
      if (this.ws) {
        console.log("♻️ Cleaning old websocket");
        this.ws.close();
        this.ws = null;
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
          console.log(
            "WILDCARD HANDLERS COUNT:",
            this.messageHandlers.get('*')?.length
          );
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

  async send(data) {
    console.log("🚀 SEND CALLED");
    if (!this.url) {
      throw new Error("WebSocket URL not initialized");
    }

    await this.connect(this.url);

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket connection not established");
    }

    const message = JSON.stringify(data);

    console.log("➡️ Sending message:", message);

    this.ws.send(message);
  }

  on(eventType, handler) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }

    const handlers = this.messageHandlers.get(eventType);

    // 🔥 защита от дубликатов
    if (!handlers.includes(handler)) {
      handlers.push(handler);
      console.log(`👂 Handler registered for event: ${eventType}`);
    } else {
      console.log(`⚠️ Handler already registered for: ${eventType}`);
    }
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

export const wsService = new WebSocketService();*/}

// services/websocket.js

class WebSocketService {
  constructor() {
    this.ws = null;
    this.url = null;

    this.messageHandlers = new Map();

    this.connectionPromise = null;
    this.reconnectTimeout = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.token = null;
    this.pendingMessages = [];

    console.log("✅ WS SERVICE INITIALIZED");
  }

  // --------------------------------------------------
  // CONNECT
  // --------------------------------------------------
  //connect(url = "ws://localhost:8004/ws/2") {
  
  /*connect(token) {
    if (!token) {
      throw new Error("No auth token provided for WebSocket connection");
    }

    const url = `ws://localhost:8004/ws?token=${token}`;
    this.url = url;*/
    connect(token) {
      if (token) {
        this.token = token;
      }

      if (!this.token) {
        throw new Error("No auth token provided");
      }

      const url = `ws://155.212.237.86:8004/ws?token=${this.token}`;
      this.url = url;

    // 🔒 Если уже открыт — ничего не делаем
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    // 🔒 Если уже подключается — возвращаем существующий promise
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      return this.connectionPromise;
    }

    // 🔒 Если сокет есть, но закрыт — полностью очищаем
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.close();
      this.ws = null;
    }

    console.log("🔄 Creating NEW WebSocket connection");

    this.connectionPromise = new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      this.ws = ws;

      const timeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          reject(new Error("WebSocket connection timeout"));
        }
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        console.log("SOCKET OPENED", this.ws);
        console.log("🟢 WS CONNECTED");

        this.reconnectAttempts = 0;

        // отправляем накопленные сообщения
        //while (this.pendingMessages.length > 0) {
        //  ws.send(this.pendingMessages.shift());
        //}

        resolve();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          const messageType =
            data.source?.split(":")[0] ||
            data.type ||
            data.event ||
            "message";

          const specific = this.messageHandlers.get(messageType);
          console.log("HANDLERS MAP:", this.messageHandlers);

          if (specific && specific.length > 0) {
            specific.forEach((handler) => handler(data));
          } else {
            const wildcard = this.messageHandlers.get("*") || [];
            wildcard.forEach((handler) => handler(data));
          }

        } catch (err) {
          console.error("❌ WS parse error:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("❌ WS error:", err);
      };

      ws.onclose = (event) => {
        console.log("🔌 WS CLOSED");

        this.ws = null;
        this.connectionPromise = null;

        // авто-reconnect только если не manual disconnect
        if (
          event.code !== 1000 &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.reconnectAttempts++;

          const delay = Math.min(
            1000 * Math.pow(2, this.reconnectAttempts),
            10000
          );

          console.log(`🔄 Reconnecting in ${delay}ms`);

          this.reconnectTimeout = setTimeout(() => {
            this.connect();
          }, delay);
        }
      };
    });

    return this.connectionPromise;
  }

  // --------------------------------------------------
  // SEND
  // --------------------------------------------------
  async send(data) {
    if (!this.url) {
      throw new Error("WebSocket URL not set");
    }

    await this.connect();

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    const message = JSON.stringify(data);
    this.ws.send(message);
  }

  // --------------------------------------------------
  // EVENTS
  // --------------------------------------------------
  on(eventType, handler) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }

    const handlers = this.messageHandlers.get(eventType);

    if (!handlers.includes(handler)) {
      handlers.push(handler);
    }
  }

  off(eventType, handler) {
    const handlers = this.messageHandlers.get(eventType);
    if (!handlers) return;

    this.messageHandlers.set(
      eventType,
      handlers.filter((h) => h !== handler)
    );
  }

  // --------------------------------------------------
  // DISCONNECT
  // --------------------------------------------------
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.ws) {
      this.ws.close(1000);
      this.ws = null;
    }

    this.connectionPromise = null;
    this.reconnectAttempts = 0;
    this.pendingMessages = [];

    console.log("🛑 WS MANUALLY DISCONNECTED");
  }

  getConnectionState() {
    if (!this.ws) return "DISCONNECTED";

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "CONNECTING";
      case WebSocket.OPEN:
        return "OPEN";
      case WebSocket.CLOSING:
        return "CLOSING";
      case WebSocket.CLOSED:
        return "CLOSED";
      default:
        return "UNKNOWN";
    }
  }
}

//export const wsService = new WebSocketService();
const globalKey = "__WS_SERVICE__";

export const wsService =
  globalThis[globalKey] ||
  (globalThis[globalKey] = new WebSocketService());