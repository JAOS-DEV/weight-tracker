import { useEffect } from "react";

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps): React.ReactElement {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 2500);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}
