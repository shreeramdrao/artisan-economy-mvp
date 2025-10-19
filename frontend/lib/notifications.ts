// Push notifications utilities

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

interface CustomPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class NotificationManager {
  private permission: NotificationPermission = {
    granted: false,
    denied: false,
    default: false,
  };

  private subscription: CustomPushSubscription | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.checkPermission();
      this.registerServiceWorker();
    }
  }

  private async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Notifications: Service worker registered');
      } catch (error) {
        console.error('Notifications: Service worker registration failed:', error);
      }
    }
  }

  private checkPermission() {
    // Only check permission on client side
    if (typeof window !== 'undefined' && 'Notification' in window) {
      switch (Notification.permission) {
        case 'granted':
          this.permission.granted = true;
          break;
        case 'denied':
          this.permission.denied = true;
          break;
        default:
          this.permission.default = true;
      }
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.warn('Notifications: Not supported in this browser');
      return false;
    }

    if (this.permission.granted) {
      return true;
    }

    if (this.permission.denied) {
      console.warn('Notifications: Permission denied by user');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.checkPermission();
      
      if (permission === 'granted') {
        console.log('Notifications: Permission granted');
        await this.subscribeToPush();
        return true;
      } else {
        console.log('Notifications: Permission denied');
        return false;
      }
    } catch (error) {
      console.error('Notifications: Permission request failed:', error);
      return false;
    }
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<CustomPushSubscription | null> {
    if (!this.serviceWorkerRegistration) {
      console.error('Notifications: Service worker not registered');
      return null;
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ) as unknown as ArrayBuffer,
      });

      this.subscription = subscription as unknown as CustomPushSubscription;
      console.log('Notifications: Push subscription created');

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription as unknown as CustomPushSubscription;
    } catch (error) {
      console.error('Notifications: Push subscription failed:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      const result = await (this.subscription as unknown as PushSubscription).unsubscribe();
      this.subscription = null;
      console.log('Notifications: Push subscription removed');
      return result;
    } catch (error) {
      console.error('Notifications: Unsubscribe failed:', error);
      return false;
    }
  }

  // Send subscription to server
  private async sendSubscriptionToServer(subscription: PushSubscription) {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify({
          subscription: subscription,
          userId: this.getUserId(),
        }),
      });

      if (response.ok) {
        console.log('Notifications: Subscription sent to server');
      } else {
        console.error('Notifications: Failed to send subscription to server');
      }
    } catch (error) {
      console.error('Notifications: Error sending subscription to server:', error);
    }
  }

  // Show local notification
  showNotification(title: string, options?: NotificationOptions) {
    if (typeof window === 'undefined' || !this.permission.granted) {
      console.warn('Notifications: Permission not granted or not in browser');
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/images/icon-192x192.png',
      badge: '/images/icon-192x192.png',
      requireInteraction: false,
      ...options,
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Notifications: Failed to show notification:', error);
    }
  }

  // Show toast notification (fallback)
  showToastNotification(title: string, message: string) {
    // Only emit custom event on client side
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toastNotification', { 
        detail: { title, message, variant: 'default' } 
      }));
    }
  }

  // Handle push notification from service worker
  handlePushNotification(data: any) {
    console.log('Notifications: Push notification received:', data);
    
    if (data.title && data.message) {
      this.showNotification(data.title, {
        body: data.message,
        data: data.data,
      });
    }
  }

  // Get notification permission status
  getPermissionStatus(): NotificationPermission {
    return { ...this.permission };
  }

  // Check if notifications are supported
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Get current subscription
  getSubscription(): CustomPushSubscription | null {
    return this.subscription;
  }

  // Utility function to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    if (typeof window === 'undefined') {
      throw new Error('urlBase64ToUint8Array can only be called on client side');
    }

    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Get auth token
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

  // Get user ID
  private getUserId(): string | undefined {
    if (typeof document !== 'undefined') {
      const userCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('authUser='));
      
      if (userCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
          return userData.userId;
        } catch (error) {
          console.error('Notifications: Failed to parse user data:', error);
        }
      }
    }
    return undefined;
  }

  // Setup notification event listeners
  setupEventListeners() {
    // Only set up event listeners on client side
    if (typeof window === 'undefined') return

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'PUSH_NOTIFICATION') {
          this.handlePushNotification(event.data);
        }
      });
    }

    // Listen for visibility change to show notifications when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.permission.granted) {
        // Page is hidden, notifications will be shown
        console.log('Notifications: Page hidden, notifications enabled');
      }
    });
  }
}

// Create singleton instance
export const notificationManager = new NotificationManager();

// Export convenience functions
export const requestNotificationPermission = () => notificationManager.requestPermission();
export const subscribeToPush = () => notificationManager.subscribeToPush();
export const unsubscribeFromPush = () => notificationManager.unsubscribeFromPush();
export const showNotification = (title: string, options?: NotificationOptions) => 
  notificationManager.showNotification(title, options);
export const showToastNotification = (title: string, message: string) => 
  notificationManager.showToastNotification(title, message);
export const getNotificationPermission = () => notificationManager.getPermissionStatus();
export const isNotificationSupported = () => notificationManager.isSupported();
export const getPushSubscription = () => notificationManager.getSubscription();

// Setup event listeners
if (typeof window !== 'undefined') {
  notificationManager.setupEventListeners();
}

// Auto-request permission on user interaction
if (typeof window !== 'undefined') {
  let permissionRequested = false;
  
  const requestPermissionOnInteraction = () => {
    if (!permissionRequested && isNotificationSupported()) {
      requestNotificationPermission();
      permissionRequested = true;
      
      // Remove event listeners after first interaction
      document.removeEventListener('click', requestPermissionOnInteraction);
      document.removeEventListener('scroll', requestPermissionOnInteraction);
    }
  };

  // Request permission on first user interaction
  document.addEventListener('click', requestPermissionOnInteraction);
  document.addEventListener('scroll', requestPermissionOnInteraction);
}
