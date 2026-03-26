import { useEffect, useState } from "react";
import "./toast.css";

export default function ToastContainer({ notifications, onDone }) {
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    if (notifications.length) setQueue((prev) => [...prev, ...notifications]);
  }, [notifications]);

  useEffect(() => {
    if (!queue.length) return;
    const timer = setTimeout(() => {
      setQueue((prev) => prev.slice(1));
      if (queue.length === 1 && onDone) onDone();
    }, 3000);
    return () => clearTimeout(timer);
  }, [queue]);

  if (!queue.length) return null;

  return (
    <div className="toast-container">
      {queue.map((n, idx) => (
        <div key={idx} className="toast">{n.mensaje}</div>
      ))}
    </div>
  );
}