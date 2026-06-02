type Severity = 'success' | 'error' | 'info';

type NotificationEvent =
  | { type: 'show';    id: string; message: string; severity: Severity | 'loading'; duration?: number }
  | { type: 'update';  id: string; message: string; severity: Severity }
  | { type: 'dismiss'; id: string };

type Listener = (event: NotificationEvent) => void;

const listeners = new Set<Listener>();

export const notificationEmitter = {
  emit(event: NotificationEvent) {
    listeners.forEach(l => l(event));
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

interface NotificationController {
  id: string;
  cancel: () => void;
}

export const notifyPromise = (
  message: string,
  _type: 'info' | 'success' | 'error'
): NotificationController => {
  const id = Math.random().toString(36).substr(2, 9);
  notificationEmitter.emit({ type: 'show', id, message, severity: 'loading' });
  return {
    id,
    cancel: () => notificationEmitter.emit({ type: 'dismiss', id }),
  };
};

export const notifyResolve = (
  notificationController: NotificationController,
  message: string,
  type: 'success' | 'error'
) => {
  notificationEmitter.emit({
    type: 'update',
    id: notificationController.id,
    message,
    severity: type,
  });
};

export const notify = (
  message: string,
  type: 'info' | 'success' | 'error',
  duration?: number
) => {
  const id = Math.random().toString(36).substr(2, 9);
  notificationEmitter.emit({ type: 'show', id, message, severity: type, duration });
};
