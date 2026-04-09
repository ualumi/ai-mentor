
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

      const url = `ws://89.248.207.102:8004/ws?token=${this.token}`;
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
        while (this.pendingMessages.length > 0) {
          ws.send(this.pendingMessages.shift());
        }

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
  /*async send(data) {
    if (!this.url) {
      throw new Error("WebSocket URL not set");
    }

    await this.connect();

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    const message = JSON.stringify(data);
    this.ws.send(message);
  }*/

    async send(data) {
      if (!this.url) {
        throw new Error("WebSocket URL not set");
      }

      const message = JSON.stringify(data);

      // 🔥 если сокет НЕ открыт → кладем в очередь
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        console.log("⏳ WS not ready, queue message:", data);

        this.pendingMessages.push(message);

        await this.connect();
        return;
      }

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