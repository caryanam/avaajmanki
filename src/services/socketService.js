import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/env.js';

let socketInstance = null;
let activeToken = null;
let activeUserId = null;

/**
 * Returns the current singleton Socket.IO instance if available.
 */
export function getSocket() {
  return socketInstance;
}

/**
 * Obtains or creates a single shared Socket.IO connection.
 * Connects ONLY when authenticated with a valid token.
 * Prevents multiple socket instances from double-mounts or multiple contexts.
 */
export function getOrCreateSocket(token, currentUser) {
  if (!token || token.startsWith('mock') || !currentUser || !currentUser.id) {
    disconnectSocket();
    return null;
  }

  const userId = String(currentUser.id);

  // If already connected with the same credentials, return existing singleton
  if (socketInstance) {
    if (activeToken === token && activeUserId === userId) {
      if (!socketInstance.connected && !socketInstance.connecting) {
        socketInstance.connect();
      }
      return socketInstance;
    }

    // Credentials changed (e.g. switch user): cleanly disconnect previous
    disconnectSocket();
  }

  activeToken = token;
  activeUserId = userId;

  socketInstance = io(SOCKET_URL, {
    transports: ['polling', 'websocket'],
    query: { token },
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socketInstance.on('connect', () => {
    socketInstance.emit('join_user_room', userId);
  });

  return socketInstance;
}

/**
 * Disconnects and cleans up the shared socket instance.
 */
export function disconnectSocket() {
  if (socketInstance) {
    try {
      socketInstance.removeAllListeners();
      socketInstance.disconnect();
    } catch {}
    socketInstance = null;
  }
  activeToken = null;
  activeUserId = null;
}
