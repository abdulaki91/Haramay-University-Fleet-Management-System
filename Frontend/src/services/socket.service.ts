import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  connect() {
    const token = useAuthStore.getState().token;

    if (!token) {
      console.warn("Cannot connect to socket: No authentication token");
      return;
    }

    if (this.socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    const baseURL =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
    const socketURL = baseURL.replace("/api", "");

    this.socket = io(socketURL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("✓ Connected to WebSocket server");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("✗ Disconnected from WebSocket:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    // Re-attach all listeners
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket?.on(event, callback as any);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("Socket disconnected");
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  off(event: string, callback?: Function) {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
      if (this.socket) {
        this.socket.off(event, callback as any);
      }
    } else {
      this.listeners.delete(event);
      if (this.socket) {
        this.socket.off(event);
      }
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn("Socket not connected. Cannot emit event:", event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
