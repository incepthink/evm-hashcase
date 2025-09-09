// utils/notify.ts - Enhanced notification system with cancellation
interface NotificationController {
  id: string;
  cancel: () => void;
}

// Global storage for abort controllers
declare global {
  interface Window {
    __notificationControllers?: Record<string, AbortController>;
  }
}

export const notifyPromise = (
  message: string, 
  type: "info" | "success" | "error"
): NotificationController => {
  const id = Math.random().toString(36).substr(2, 9);
  
  // Create abort controller for this notification
  const controller = new AbortController();
  
  // Store the controller globally so it can be accessed
  if (typeof window !== 'undefined') {
    window.__notificationControllers = window.__notificationControllers || {};
    window.__notificationControllers[id] = controller;
  }
  
  // Your existing notification logic here - integrate with your actual notification system
  // For now, using console.log as placeholder
  console.log(`[${type.toUpperCase()}] ${message} (ID: ${id})`);
  
  // Show notification with cancel button in your UI
  showCancellableNotification(id, message, type);
  
  return {
    id,
    cancel: () => {
      controller.abort();
      // Clean up
      if (typeof window !== 'undefined' && window.__notificationControllers) {
        delete window.__notificationControllers[id];
      }
      // Dismiss the notification
      dismissNotification(id);
      console.log(`[CANCELLED] ${message}`);
    }
  };
};

export const notifyResolve = (
  notificationController: NotificationController | string, 
  message: string, 
  type: "success" | "error"
) => {
  const id = typeof notificationController === 'string' ? notificationController : notificationController.id;
  
  // Clean up controller
  if (typeof window !== 'undefined' && window.__notificationControllers) {
    delete window.__notificationControllers[id];
  }
  
  // Resolve the notification
  dismissNotification(id);
  
  // Show new notification with the result
  console.log(`[${type.toUpperCase()}] ${message} (Resolved: ${id})`);
  
  // You would call your actual notification system here
  // Example: toast.success(message) or toast.error(message)
};

// Helper functions to integrate with your notification system
const showCancellableNotification = (id: string, message: string, type: string) => {
  // This would integrate with your actual notification system
  // Example with react-hot-toast:
  // toast.loading(message, {
  //   id,
  //   action: {
  //     label: 'Cancel',
  //     onClick: () => {
  //       const controller = window.__notificationControllers?.[id];
  //       if (controller) {
  //         controller.abort();
  //         delete window.__notificationControllers[id];
  //         toast.dismiss(id);
  //       }
  //     }
  //   }
  // });
};

const dismissNotification = (id: string) => {
  // This would integrate with your actual notification system
  // Example: toast.dismiss(id);
};

// Utility to get abort signal for a notification
export const getNotificationAbortSignal = (notificationId: string): AbortSignal | undefined => {
  if (typeof window !== 'undefined' && window.__notificationControllers) {
    return window.__notificationControllers[notificationId]?.signal;
  }
  return undefined;
};