const CACHE_NAME = 'artisan-cache-v1';
const DATA_CACHE_NAME = 'artisan-data-v1';
const OFFLINE_URL = '/offline.html';

// Dynamic configuration - will be updated via postMessage
let CONFIG = {
  apiBaseUrl: 'http://localhost:4000', // Default fallback
  environment: 'development'
};

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/manifest.json',
  '/images/fallback.svg',
  '/images/blur-placeholder.png',
  '/images/apple-touch-icon.png',
  '/images/fallback.png'
];

// API endpoint definitions
const API_ENDPOINTS = {
  buyer: {
    products: '/buyer/products',
    categories: '/buyer/categories',
    featured: '/buyer/featured',
    cart: '/buyer/cart'
  },
  seller: {
    dashboard: '/seller/dashboard',
    products: '/seller/products',
    orders: '/seller/orders',
    analytics: '/seller/analytics',
    payments: '/seller/payments'
  },
  ai: {
    recommendations: '/ai/recommendations',
    chat: '/ai/chat',
    transcribe: '/ai/transcribe'
  }
};

// Dynamic URL builder
function buildApiUrl(endpoint) {
  return `${CONFIG.apiBaseUrl}${endpoint}`;
}

// Get buyer API cache patterns (public data for prefetching)
function getBuyerCachePatterns() {
  return [
    buildApiUrl(API_ENDPOINTS.buyer.products),
    buildApiUrl(API_ENDPOINTS.buyer.categories),
    buildApiUrl(API_ENDPOINTS.buyer.featured),
    buildApiUrl(API_ENDPOINTS.ai.recommendations)
  ];
}

// Get prefetch URLs for installation
function getPrefetchUrls() {
  return [
    buildApiUrl(API_ENDPOINTS.buyer.products) + '?page=1&limit=12',
    buildApiUrl(API_ENDPOINTS.buyer.categories),
    buildApiUrl(API_ENDPOINTS.buyer.featured)
  ];
}

// Configuration message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CONFIG_UPDATE') {
    CONFIG = { ...CONFIG, ...event.data.config };
    console.log('Service Worker: Configuration updated', CONFIG);
  }
});

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Prefetch key API data using dynamic URLs
      caches.open(DATA_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Prefetching API data');
        const prefetchUrls = getPrefetchUrls();
        return Promise.all(
          prefetchUrls.map(url => cache.add(url))
        ).catch(err => {
          console.log('Service Worker: Some API prefetch failed:', err);
        });
      })
    ])
  );
  
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests to our backend
  if (url.origin === CONFIG.apiBaseUrl) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with caching
function handleApiRequest(request) {
  return caches.open(DATA_CACHE_NAME).then((cache) => {
    return cache.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('Service Worker: Serving API from cache:', request.url);
        return cachedResponse;
      }
      
      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          cache.put(request, responseClone);
        }
        return response;
      }).catch(() => {
        // Return cached data if available, even if stale
        return cachedResponse || new Response(
          JSON.stringify({ error: 'Offline - no cached data available' }),
          { 
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      });
    });
  });
}

// Handle static asset requests
function handleStaticRequest(request) {
  return caches.match(request).then((cachedResponse) => {
    if (cachedResponse) {
      console.log('Service Worker: Serving from cache:', request.url);
      return cachedResponse;
    }
    
    return fetch(request).then((response) => {
      // Cache successful responses
      if (response.status === 200) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      // Serve offline page for navigation requests
      if (request.mode === 'navigate') {
        return caches.match(OFFLINE_URL);
      }
      
      // Return fallback for other requests
      return new Response('Offline', { status: 503 });
    });
  });
}

// Background sync for cart actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCartActions());
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const data = event.data ? event.data.json() : {
    title: 'Artisan Economy',
    message: 'You have a new update!',
    icon: '/images/apple-touch-icon.png'
  };
  
  const options = {
    body: data.message,
    icon: data.icon || '/images/apple-touch-icon.png',
    badge: '/images/apple-touch-icon.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/images/apple-touch-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});

// Helper function to sync cart actions
async function syncCartActions() {
  try {
    console.log('Service Worker: Syncing cart actions...');
    
    // Get queued actions from IndexedDB or localStorage
    const queue = await getCartQueue();
    
    if (queue.length === 0) {
      console.log('Service Worker: No cart actions to sync');
      return;
    }
    
    // Process each action
    for (const action of queue) {
      try {
        await fetch(`${CONFIG.apiBaseUrl}/buyer/cart${action.endpoint}`, {
          method: action.method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${action.token}`
          },
          body: action.body ? JSON.stringify(action.body) : undefined
        });
        
        console.log('Service Worker: Synced action:', action.type);
      } catch (error) {
        console.error('Service Worker: Failed to sync action:', action.type, error);
        // Stop syncing on first failure
        return;
      }
    }
    
    // Clear the queue after successful sync
    await clearCartQueue();
    console.log('Service Worker: All cart actions synced successfully');
    
  } catch (error) {
    console.error('Service Worker: Cart sync failed:', error);
  }
}

// Helper functions for cart queue management
async function getCartQueue() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['cartQueue'], 'readonly');
    const store = transaction.objectStore('cartQueue');
    const result = await store.getAll();
    return result;
  } catch (error) {
    console.error('Service Worker: Failed to get cart queue:', error);
    return [];
  }
}

async function clearCartQueue() {
  try {
    const db = await openDB();
    const transaction = db.transaction(['cartQueue'], 'readwrite');
    const store = transaction.objectStore('cartQueue');
    await store.clear();
  } catch (error) {
    console.error('Service Worker: Failed to clear cart queue:', error);
  }
}

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ArtisanEconomyDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('cartQueue')) {
        db.createObjectStore('cartQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}
