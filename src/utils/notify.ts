// utils/notify.ts
import toast from 'react-hot-toast';

interface NotificationController {
  id: string;
  cancel: () => void;
}

// Store controllers in a more contained way
const notificationControllers = new Map<string, AbortController>();

export const notifyPromise = (
  message: string, 
  type: "info" | "success" | "error"
): NotificationController => {
  const id = Math.random().toString(36).substr(2, 9);
  
  // Create abort controller for this notification
  const controller = new AbortController();
  notificationControllers.set(id, controller);
  
  // Show actual notification
  toast.loading(message, { id });
  
  return {
    id,
    cancel: () => {
      controller.abort();
      notificationControllers.delete(id);
      toast.dismiss(id);
    }
  };
};

export const notifyResolve = (
  notificationController: NotificationController, 
  message: string, 
  type: "success" | "error"
) => {
  const { id } = notificationController;
  
  // Clean up controller
  notificationControllers.delete(id);
  
  // Update the notification with result
  if (type === "success") {
    toast.success(message, { id });
  } else {
    toast.error(message, { id });
  }
};

export const notify = (message: string, type: "info" | "success" | "error") => {
  if (type === "success") {
    toast.success(message);
  } else if (type === "error") {
    toast.error(message);
  } else {
    toast(message);
  }
};