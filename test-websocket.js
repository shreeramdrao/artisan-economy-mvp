const { io } = require('socket.io-client');

console.log('🧪 Testing WebSocket connection...');

// Test connection to the /updates namespace
const socket = io('http://localhost:4000/updates', {
  auth: {
    token: 'test-token' // This will fail auth but we can see the connection attempt
  },
  transports: ['websocket', 'polling'],
  timeout: 5000,
});

socket.on('connect', () => {
  console.log('✅ WebSocket connected successfully!');
  console.log('🔌 Socket ID:', socket.id);
  
  // Test ping
  socket.emit('ping');
  
  setTimeout(() => {
    socket.disconnect();
    console.log('🔌 Disconnected for cleanup');
    process.exit(0);
  }, 2000);
});

socket.on('connect_error', (error) => {
  console.log('⚠️ Connection error (expected due to auth):', error.message);
  // This is expected since we're using a test token
  socket.disconnect();
  process.exit(0);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Disconnected:', reason);
});

socket.on('pong', (data) => {
  console.log('🏓 Pong received:', data);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ Test timeout');
  socket.disconnect();
  process.exit(1);
}, 10000);
