import { useEffect, useState } from "react";
import "./toast.css";

export default function ToastContainer({ notifications, onDone }) {
  const [queue, setQueue] = useState([]);

  // Agregar nuevas notificaciones
  useEffect(() => {
    if (notifications.length) {
      setQueue((prev) => [...prev, ...notifications]);
    }
  }, [notifications]);

  // Procesar cola de notificaciones
  useEffect(() => {
    if (!queue.length) return;

    const timer = setTimeout(() => {
      setQueue((prev) => {
        const nuevaCola = prev.slice(1);

        // ✅ usar nuevaCola para evitar valor viejo
        if (nuevaCola.length === 0 && onDone) {
          onDone();
        }

        return nuevaCola;
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [queue, onDone]); // ✅ agregado onDone

  if (!queue.length) return null;

  return (
    <div className="toast-container">
      {queue.map((n, idx) => (
        <div key={idx} className="toast">
          {n.mensaje}
        </div>
      ))}
    </div>
  );
}