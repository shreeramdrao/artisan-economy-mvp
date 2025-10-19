import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? (process.env.FRONTEND_URL || 'http://localhost:3000')
      : '*', // Allow all origins in development
    credentials: true,
  },
  namespace: '/updates',
})
export class UpdatesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(UpdatesGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  async handleConnection(client: AuthenticatedSocket) {
    try {
      this.logger.log(`🔌 Client attempting connection: ${client.id}`);
      
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      // Extract token from handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (token) {
        // Verify JWT token
        const jwtService = new JwtService({ secret: process.env.JWT_SECRET });
        const payload = jwtService.verify(token);
        
        client.userId = payload.userId;
        client.userRole = payload.role;
        
        // Store user connection
        this.connectedUsers.set(client.userId, client.id);
        
        this.logger.log(`✅ User ${client.userId} (${client.userRole}) connected with socket ${client.id}`);
        
        // Join user to their personal room
        await client.join(`user:${client.userId}`);
        
        // Join user to role-based rooms
        await client.join(`role:${client.userRole}`);
        
        // Send welcome message
        client.emit('connected', {
          message: 'Connected to real-time updates',
          userId: client.userId,
          role: client.userRole,
        });
        
        this.logger.log(`📊 Total connected users: ${this.connectedUsers.size}`);
      } else {
        // Handle unauthenticated connections based on environment
        if (isDevelopment) {
          // Development mode: Allow connection without authentication
          this.logger.log(`✅ [DevMode] Client connected (no auth): ${client.id}`);
          
          // Join to a general development room for testing
          await client.join('dev:anonymous');
          
          // Send welcome message for development
          client.emit('connected', {
            message: 'Connected to real-time updates (Development Mode)',
            userId: 'anonymous',
            role: 'developer',
          });
          
          this.logger.log(`📊 Total connected users: ${this.connectedUsers.size}`);
        } else {
          // Production mode: Require authentication
          this.logger.warn(`⚠️ Unauthenticated connection attempt from ${client.id}`);
          client.disconnect();
        }
      }
    } catch (error) {
      this.logger.error(`❌ Connection error for ${client.id}: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      this.logger.log(`🔌 User ${client.userId} disconnected (${this.connectedUsers.size} users remaining)`);
    } else {
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        this.logger.log(`🔌 [DevMode] Anonymous client ${client.id} disconnected`);
      } else {
        this.logger.log(`🔌 Anonymous client ${client.id} disconnected`);
      }
    }
  }

  // Product updates
  sendProductUpdate(product: any) {
    this.logger.log(`Broadcasting product update: ${product.productId}`);
    this.server.emit('productUpdate', {
      type: 'product',
      data: product,
      timestamp: new Date().toISOString(),
    });
  }

  // Order status updates
  sendOrderStatusUpdate(order: any) {
    this.logger.log(`Sending order status update: ${order.orderId}`);
    
    // Send to specific user
    this.server.to(`user:${order.buyerId}`).emit('orderStatus', {
      type: 'order',
      data: order,
      timestamp: new Date().toISOString(),
    });

    // Send to seller if they're online
    if (order.sellerId) {
      this.server.to(`user:${order.sellerId}`).emit('orderStatus', {
        type: 'order',
        data: order,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Cart updates
  sendCartUpdate(userId: string, cartData: any) {
    this.logger.log(`Sending cart update to user: ${userId}`);
    this.server.to(`user:${userId}`).emit('cartUpdate', {
      type: 'cart',
      data: cartData,
      timestamp: new Date().toISOString(),
    });
  }

  // Price updates
  sendPriceUpdate(productId: string, newPrice: number) {
    this.logger.log(`Broadcasting price update for product: ${productId}`);
    this.server.emit('priceUpdate', {
      type: 'price',
      data: {
        productId,
        newPrice,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Inventory updates
  sendInventoryUpdate(productId: string, stock: number) {
    this.logger.log(`Broadcasting inventory update for product: ${productId}`);
    this.server.emit('inventoryUpdate', {
      type: 'inventory',
      data: {
        productId,
        stock,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Notification updates
  sendNotification(userId: string, notification: any) {
    this.logger.log(`Sending notification to user: ${userId}`);
    this.server.to(`user:${userId}`).emit('notification', {
      type: 'notification',
      data: notification,
      timestamp: new Date().toISOString(),
    });
  }

  // AI recommendation updates
  sendRecommendationUpdate(userId: string, recommendations: any[]) {
    this.logger.log(`Sending AI recommendations to user: ${userId}`);
    this.server.to(`user:${userId}`).emit('recommendationUpdate', {
      type: 'recommendations',
      data: recommendations,
      timestamp: new Date().toISOString(),
    });
  }

  // Chat assistant updates
  sendChatUpdate(userId: string, chatData: any) {
    this.logger.log(`Sending chat update to user: ${userId}`);
    this.server.to(`user:${userId}`).emit('chatUpdate', {
      type: 'chat',
      data: chatData,
      timestamp: new Date().toISOString(),
    });
  }

  // System announcements
  sendSystemAnnouncement(message: string, targetRole?: string) {
    this.logger.log(`Sending system announcement: ${message}`);
    
    if (targetRole) {
      this.server.to(`role:${targetRole}`).emit('systemAnnouncement', {
        type: 'system',
        data: { message },
        timestamp: new Date().toISOString(),
      });
    } else {
      this.server.emit('systemAnnouncement', {
        type: 'system',
        data: { message },
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Client message handlers
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (client.userId) {
      client.join(data.room);
      this.logger.log(`User ${client.userId} joined room: ${data.room}`);
    } else if (isDevelopment) {
      // Allow anonymous users to join rooms in development
      client.join(data.room);
      this.logger.log(`[DevMode] Anonymous client ${client.id} joined room: ${data.room}`);
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    client.leave(data.room);
    
    if (client.userId) {
      this.logger.log(`User ${client.userId} left room: ${data.room}`);
    } else if (isDevelopment) {
      this.logger.log(`[DevMode] Anonymous client ${client.id} left room: ${data.room}`);
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get user's socket ID
  getUserSocketId(userId: string): string | undefined {
    return this.connectedUsers.get(userId);
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}
