
// services/websocket.js
/*class WebSocketService {
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

  connect(url = "ws://localhost:8004/ws/tasks/2") {
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



export const wsService = new WebSocketService();*/

class WebSocketService {
  constructor() {
    this.ws = null;
    this.messageHandlers = new Map();
    this.connectionPromise = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.url = null;

    this.pendingMentorReplyForEvent = null;
  }

  connect(url = "ws://localhost:8004/ws/tasks/2") {
    this.url = url;

    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        const timeout = setTimeout(() => {
          if (!this.isConnected) {
            this.ws.close();
            reject(new Error("Connection timeout"));
          }
        }, 5000);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const messageType = data.type || data.event || "message";

            // 🔹 1. Отдаём настоящий ответ
            //this.emit(messageType, data);
            //this.emit("*", data);

            // 🔹 2. Если был submit_code — отправляем фейки ОДИН РАЗ
            if (this.pendingMentorReplyForEvent === "submit_code") {

              // --- FAKE MENTOR REPLY ---
              const fakeMentorReply = {
                event: "mentor_reply",
                message: "Ответ ментора",
                timestamp: Date.now(),
              };

              this.emit("mentor_reply", fakeMentorReply);
              this.emit("*", fakeMentorReply);

              // --- FAKE MODULE RECOMMENDATION ---
              const fakeRecommendation = {
                event: "module_recommendaton",
                data: "Clustering",
              };

              this.emit("module_recommendaton", fakeRecommendation);
              this.emit("*", fakeRecommendation);

              // --- FAKE ANALYSIS RESULT ---
              const analysis = [
                {
                  line: 4,
                  type: "strength",
                  message:
                    "Использование silhouette_score — объективная метрика качества кластеризации",
                  confidence: 0.542,
                },
                {
                  line: 26,
                  type: "strength",
                  message:
                    "Возврат обученного scaler позволяет корректно трансформировать новые данные",
                  confidence: 0.455,
                },
                {
                  line: 23,
                  type: "weakness",
                  message:
                    "Визуализация использует только первые 2 признака",
                  confidence: 0.516,
                },
                {
                  line: 18,
                  type: "weakness",
                  message:
                    "Нет обработки случая одинаковых silhouette scores",
                  confidence: 0.51,
                },
                {
                  line: 17,
                  type: "recommendation",
                  message:
                    "Добавить вывод размеров кластеров: np.bincount(...)",
                  confidence: 0.516,
                },
              ];

              /*const fakeAnalysis = {
                event: "analysis_result",
                annotations: analysis,
              };*/

              const fakeAnalysis = {
                event: "analysis_result",
                data: {
                  user_id: "2",
                  annotations: analysis,
                },
              };

              this.emit("analysis_result", fakeAnalysis);
              this.emit("*", fakeAnalysis);

              // 🔹 сбрасываем флаг (чтобы больше не повторялось)
              this.pendingMentorReplyForEvent = null;
            }

          } catch (error) {
            console.error("Error parsing message:", error);
          }
        };

        this.ws.onclose = (event) => {
          this.isConnected = false;
          this.ws = null;
          this.connectionPromise = null;

          if (
            !event.wasClean &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.reconnectAttempts++;
            const delay = Math.min(
              1000 * 2 ** this.reconnectAttempts,
              10000
            );
            setTimeout(() => this.connect(this.url), delay);
          }
        };

        this.ws.onerror = (err) =>
          console.error("WebSocket error:", err);

      } catch (err) {
        reject(err);
      }
    });

    return this.connectionPromise;
  }

  async send(event, data = {}) {
    if (!this.isConnected || this.ws?.readyState !== WebSocket.OPEN) {
      await this.connect(this.url);
    }

    let message;

    if (event === "run_code") {
      message = JSON.stringify({
        event: "run_code",
        code: data.code || "",
      });
    } 
    else if (event === "submit_code") {
      message = JSON.stringify({
        event: "submit_code",
        code: data.code || "",
      });

      // включаем отправку фейков
      this.pendingMentorReplyForEvent = "submit_code";
    } 
    else {
      message = JSON.stringify({
        event,
        ...data,
      });
    }

    this.ws.send(message);
    return true;
  }

  emit(eventType, payload) {
    const handlers = this.messageHandlers.get(eventType) || [];
    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (e) {
        console.error("Handler error:", e);
      }
    });
  }

  on(eventType, handler) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }
    this.messageHandlers.get(eventType).push(handler);
  }

  off(eventType, handler) {
    const handlers = this.messageHandlers.get(eventType);
    if (!handlers) return;
    const index = handlers.indexOf(handler);
    if (index !== -1) handlers.splice(index, 1);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, "Normal closure");
      this.ws = null;
      this.isConnected = false;
      this.connectionPromise = null;
      this.pendingMentorReplyForEvent = null;
    }
  }

  getConnectionState() {
    if (!this.ws) return "DISCONNECTED";
    return ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][this.ws.readyState];
  }
}

export const wsService = new WebSocketService();

/*class WebSocketService {
  constructor() {
    this.ws = null;
    this.messageHandlers = new Map();
    this.connectionPromise = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.url = null;

    // Храним событие, после которого нужно отправить fake mentor reply
    this.pendingMentorReplyForEvent = null;
  }

  connect(url = "ws://localhost:8004/ws/tasks/2") {
    this.url = url;

    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);

        const timeout = setTimeout(() => {
          if (!this.isConnected) {
            this.ws.close();
            reject(new Error("Connection timeout"));
          }
        }, 5000);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const messageType = data.type || data.event || "message";

            // ✅ Сначала отдаем настоящий ответ
            this.emit(messageType, data);
            this.emit("*", data);

            // ✅ Если мы ждали mentor_reply после submit_code — отправляем 1 раз
            if (
              this.pendingMentorReplyForEvent &&
              this.pendingMentorReplyForEvent === "submit_code"
            ) {
              const fakeReply = {
                type: "mentor_reply",
                event: "mentor_reply",
                message: "Ответ ментора",
                timestamp: Date.now(),
              };

              this.emit("mentor_reply", fakeReply);
              this.emit("*", fakeReply);

              // сбрасываем чтобы не повторялось
              this.pendingMentorReplyForEvent = null;
            }

          } catch (error) {
            console.error("Error parsing message:", error);
          }
        };

        this.ws.onclose = (event) => {
          this.isConnected = false;
          this.ws = null;
          this.connectionPromise = null;

          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 10000);
            setTimeout(() => this.connect(this.url), delay);
          }
        };

        this.ws.onerror = (err) => {
          console.error("WebSocket error:", err);
        };

      } catch (err) {
        reject(err);
      }
    });

    return this.connectionPromise;
  }

  async send(event, data = {}) {
    if (!this.isConnected || this.ws?.readyState !== WebSocket.OPEN) {
      await this.connect(this.url);
    }

    let message;

    // ✅ ВАЖНО: отправляем в формате как в бекенд тесте
    if (event === "run_code" || event === "submit_code") {
      message = JSON.stringify({
        event: "submit_code",  // бекенд ждет именно submit_code
        code: data.code || "",
      });
    } else {
      message = JSON.stringify({
        event,
        ...data,
      });
    }

    this.ws.send(message);

    // ✅ Запоминаем что после submit_code нужно 1 раз отправить mentor_reply
    if (event === "submit_code") {
      this.pendingMentorReplyForEvent = "submit_code";
    }

    return true;
  }

  emit(eventType, payload) {
    const handlers = this.messageHandlers.get(eventType) || [];
    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (e) {
        console.error("Handler error:", e);
      }
    });
  }

  on(eventType, handler) {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }
    this.messageHandlers.get(eventType).push(handler);
  }

  off(eventType, handler) {
    const handlers = this.messageHandlers.get(eventType);
    if (!handlers) return;
    const index = handlers.indexOf(handler);
    if (index !== -1) handlers.splice(index, 1);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, "Normal closure");
      this.ws = null;
      this.isConnected = false;
      this.connectionPromise = null;
      this.pendingMentorReplyForEvent = null;
    }
  }

  getConnectionState() {
    if (!this.ws) return "DISCONNECTED";
    return ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][this.ws.readyState];
  }
}

export const wsService = new WebSocketService();*/