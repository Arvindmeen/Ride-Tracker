/**
 * Cross-Tab Real-Time Ride Synchronization Channel
 * 
 * Enables synchronized real-time state transitions between Passenger
 * tabs and Driver Partner cockpit tabs via standard BroadcastChannel API.
 */

class RideSyncChannel {
  constructor() {
    this.channel =
      typeof window !== 'undefined' && 'BroadcastChannel' in window
        ? new BroadcastChannel('veloq_ride_sync_v1')
        : null;
    this.listeners = new Set();

    if (this.channel) {
      this.channel.onmessage = (e) => {
        this.listeners.forEach((fn) => {
          try {
            fn(e.data);
          } catch (err) {
            console.warn('[RideSync listener error]:', err);
          }
        });
      };
    }
  }

  broadcast(type, payload) {
    if (this.channel) {
      try {
        this.channel.postMessage({ type, payload, timestamp: Date.now() });
      } catch (e) {}
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

export const rideSync = new RideSyncChannel();
