import { io, Socket } from 'socket.io-client';

interface SocketEvents {
  connected: (data: { message: string; userId: string; role: string }) => void;
  productUpdate: (data: { type: string; data: any; timestamp: string }) => void;
  orderStatus: (data: { type: string; data: any; timestamp: string }) => void;
  cartUpdate: (data: { type: string; data: any; timestamp: string }) => void;
  priceUpdate: (data: { type: string; data: any; timestamp: string }) => void;
  inventoryUpdate: (data: { type: string; data: any; timestamp: string }) => void;
  notification: (data: { type: string; data: any; timestamp: string }) => void;
  recommendationUpdate: (data: { type: string; data: any; timestamp: string }) => void;
  chatUpdate: (data: { type: string; data: any; timestamp: string }) => void;
  systemAnnouncement: (data: { type: string; data: any; timestamp: string }) => void;
  pong: (data: { timestamp: string }) => void;
}

class SocketManager {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor() {
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Store event handlers for cleanup
    this.eventHandlers.set('connect', []);
    this.eventHandlers.set('disconnect', []);
    this.eventHandlers.set('error', []);
  }

  // Connect to WebSocket server
  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if sockets are disabled via environment variable
      if (process.env.NEXT_PUBLIC_ENABLE_SOCKETS === 'false') {
        console.log('🔌 WebSocket connections disabled via NEXT_PUBLIC_ENABLE_SOCKETS=false');
        reject(new Error('WebSocket connections disabled'));
        return;
      }

      if (this.socket?.connected) {
        resolve();
        return;
      }

      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
      
      console.log(`🔌 Attempting to connect to WebSocket server: ${socketUrl}/updates`);
      
      this.socket = io(`${socketUrl}/updates`, {
        auth: {
          token: token || this.getAuthToken(),
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });

      this.socket.on('connect', () => {
        console.log('🔌 Connected to backend WebSocket');
        this.isConnected = true;
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        this.emit('connect');
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from server:', reason);
        this.isConnected = false;
        this.emit('disconnect', reason);
        
        // Attempt to reconnect if not manually disconnected
        if (reason !== 'io client disconnect') {
          this.attemptReconnect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.warn('🔌 Connection error, will retry:', error.message);
        this.emit('error', error);
        
        // Don't reject immediately, try to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        } else {
          reject(error);
        }
      });

      this.socket.on('connected', (data) => {
        console.log('🔌 Server confirmed connection:', data);
      });

      // Set up event listeners
      this.setupSocketEventListeners();

      // Set timeout for connection
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  private setupSocketEventListeners() {
    if (!this.socket) return;

    // Product updates
    this.socket.on('productUpdate', (data) => {
      console.log('Socket: Product update received:', data);
      this.handleProductUpdate(data);
    });

    // Order status updates
    this.socket.on('orderStatus', (data) => {
      console.log('Socket: Order status update received:', data);
      this.handleOrderStatusUpdate(data);
    });

    // Cart updates
    this.socket.on('cartUpdate', (data) => {
      console.log('Socket: Cart update received:', data);
      this.handleCartUpdate(data);
    });

    // Price updates
    this.socket.on('priceUpdate', (data) => {
      console.log('Socket: Price update received:', data);
      this.handlePriceUpdate(data);
    });

    // Inventory updates
    this.socket.on('inventoryUpdate', (data) => {
      console.log('Socket: Inventory update received:', data);
      this.handleInventoryUpdate(data);
    });

    // Notifications
    this.socket.on('notification', (data) => {
      console.log('Socket: Notification received:', data);
      this.handleNotification(data);
    });

    // AI recommendations
    this.socket.on('recommendationUpdate', (data) => {
      console.log('Socket: Recommendation update received:', data);
      this.handleRecommendationUpdate(data);
    });

    // Chat updates
    this.socket.on('chatUpdate', (data) => {
      console.log('Socket: Chat update received:', data);
      this.handleChatUpdate(data);
    });

    // System announcements
    this.socket.on('systemAnnouncement', (data) => {
      console.log('Socket: System announcement received:', data);
      this.handleSystemAnnouncement(data);
    });

    // Pong response
    this.socket.on('pong', (data) => {
      console.log('Socket: Pong received:', data);
    });
  }

  private handleProductUpdate(data: any) {
    // Emit custom event for product updates
    window.dispatchEvent(new CustomEvent('productUpdate', { detail: data }));
  }

  private handleOrderStatusUpdate(data: any) {
    // Emit custom event for order updates
    window.dispatchEvent(new CustomEvent('orderStatus', { detail: data }));
    
    // Show browser notification if available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Order Update', {
        body: `Your order status has been updated to: ${data.data.status}`,
        icon: '/images/icon-192x192.png'
      });
    }
  }

  private handleCartUpdate(data: any) {
    // Emit custom event for cart updates
    window.dispatchEvent(new CustomEvent('cartUpdate', { detail: data }));
  }

  private handlePriceUpdate(data: any) {
    // Emit custom event for price updates
    window.dispatchEvent(new CustomEvent('priceUpdate', { detail: data }));
    
    // Show browser notification if available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Price Update', {
        body: `Price updated for product: ${data.data.productId}`,
        icon: '/images/icon-192x192.png'
      });
    }
  }

  private handleInventoryUpdate(data: any) {
    // Emit custom event for inventory updates
    window.dispatchEvent(new CustomEvent('inventoryUpdate', { detail: data }));
  }

  private handleNotification(data: any) {
    // Emit custom event for notifications
    window.dispatchEvent(new CustomEvent('notification', { detail: data }));
    
    // Show browser notification if available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(data.data.title || 'Notification', {
        body: data.data.message,
        icon: '/images/icon-192x192.png'
      });
    }
  }

  private handleRecommendationUpdate(data: any) {
    // Emit custom event for recommendation updates
    window.dispatchEvent(new CustomEvent('recommendationUpdate', { detail: data }));
  }

  private handleChatUpdate(data: any) {
    // Emit custom event for chat updates
    window.dispatchEvent(new CustomEvent('chatUpdate', { detail: data }));
  }

  private handleSystemAnnouncement(data: any) {
    // Emit custom event for system announcements
    window.dispatchEvent(new CustomEvent('systemAnnouncement', { detail: data }));
    
    // Show browser notification if available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('System Announcement', {
        body: data.data.message,
        icon: '/images/icon-192x192.png'
      });
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('🔌 Max reconnection attempts reached, giving up');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000); // Max 30s delay

    console.log(`🔌 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect().catch((error) => {
          console.warn('🔌 Reconnection attempt failed:', error.message);
          // Continue trying if we haven't reached max attempts
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        });
      }
    }, delay);
  }

  private getAuthToken(): string | undefined {
    if (typeof document !== 'undefined') {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      return token;
    }
    return undefined;
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a room
  joinRoom(room: string) {
    if (this.socket?.connected) {
      this.socket.emit('joinRoom', { room });
    }
  }

  // Leave a room
  leaveRoom(room: string) {
    if (this.socket?.connected) {
      this.socket.emit('leaveRoom', { room });
    }
  }

  // Send ping to server
  ping() {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }

  // Add event listener
  on(event: string, handler: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(handler);
  }

  // Remove event listener
  off(event: string, handler: Function) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Emit custom event
  private emit(event: string, data?: any) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Create singleton instance
export const socketManager = new SocketManager();

// Export convenience functions
export const connectSocket = (token?: string) => socketManager.connect(token);
export const disconnectSocket = () => socketManager.disconnect();
export const joinRoom = (room: string) => socketManager.joinRoom(room);
export const leaveRoom = (room: string) => socketManager.leaveRoom(room);
export const pingSocket = () => socketManager.ping();
export const getSocketStatus = () => socketManager.getConnectionStatus();
export const getSocket = () => socketManager.getSocket();

// Auto-connect when token is available and sockets are enabled
if (typeof window !== 'undefined') {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];

  if (token && process.env.NEXT_PUBLIC_ENABLE_SOCKETS !== 'false') {
    connectSocket(token).catch((error) => {
      console.warn('🔌 Auto-connect failed:', error.message);
    });
  }
}
