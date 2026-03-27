// src/Dashboard.js
import { useEffect, useState, useCallback } from "react";
import api from "./services/api";
import Swal from "sweetalert2";
import ModalMovimientos from "./ModalMovimientos";
import ToastContainer from "./ToastContainer";
import "./styles.css";

export default function Dashboard({ logout, usuario }) {
  const [user, setUser] = useState(usuario || null);
  const [loading, setLoading] = useState(false);

  const [receptorInput, setReceptorInput] = useState("");
  const [receptorList, setReceptorList] = useState([]);
  const [receptorData, setReceptorData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [monto, setMonto] = useState("");
  const [showModalMovimientos, setShowModalMovimientos] = useState(false);

  const [pendingNotifications, setPendingNotifications] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [showHoverNotif, setShowHoverNotif] = useState(false);

  const [toasts, setToasts] = useState([]);

  // ======================
  // 👤 Obtener usuario
  // ======================
  const fetchData = useCallback(async () => {
    if (user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token");

      const res = await api.get("/api/wallet/usuario", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
      logout();
    } finally {
      setLoading(false);
    }
  }, [user, logout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ======================
  // 🔔 Notificaciones
  // ======================
  const fetchPendingNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");

      const res = await api.get(
        `/api/notificaciones/pendientes/${user.telefono}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPendingNotifications(res.data || []);
      setPendingCount(res.data?.length || 0);
    } catch (err) {
      console.error(err);
      setPendingNotifications([]);
      setPendingCount(0);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    fetchPendingNotifications();

    const interval = setInterval(fetchPendingNotifications, 8000);
    return () => clearInterval(interval);
  }, [fetchPendingNotifications]);

  // ======================
  // 🔔 Procesar notificación
  // ======================
  const handleProcessNotification = async (n) => {
    const esCompra =
      n.tipo === "compra" ||
      n.mensaje.toLowerCase().includes("compra") ||
      n.mensaje.toLowerCase().includes("pago");

    const token = localStorage.getItem("token");

    if (esCompra) {
      const result = await Swal.fire({
        title: "🛒 Solicitud de compra",
        html: `<p>${n.mensaje}</p><strong>Monto: $${Number(
          n.monto
        ).toLocaleString()}</strong>`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "✅ Aceptar",
        cancelButtonText: "❌ Cancelar",
      });

      if (result.isConfirmed) {
        try {
          await api.post(
            "/api/wallet/transferencia",
            {
              telefono_origen: user.telefono,
              telefono_destino: n.telefono_origen,
              monto: n.monto,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          await Swal.fire("Aprobado", "Pago realizado", "success");
        } catch {
          await Swal.fire("Error", "No se pudo procesar", "error");
        }
      }
    } else {
      setToasts((prev) => [...prev, { mensaje: n.mensaje }]);
    }

    await api.put(
      `/api/notificaciones/leida/${n.notif_id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  // ======================
  // 🔍 Buscador
  // ======================
  useEffect(() => {
    if (!receptorInput || !user) {
      setShowDropdown(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await api.get(
          `/api/wallet/buscar/${receptorInput}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const filtrados = (res.data || []).filter(
          (u) => u.telefono !== user.telefono
        );

        setReceptorList(filtrados);
        setShowDropdown(true);
      } catch {
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [receptorInput, user]);

  const seleccionarUsuario = (u) => {
    setReceptorData(u);
    setReceptorInput(`${u.nombre} - ${u.telefono}`);
    setShowDropdown(false);
  };

  // ======================
  // 💸 Transferencia
  // ======================
  const enviarDinero = async () => {
    if (!receptorData || !monto) {
      return Swal.fire("Error", "Completa los campos", "warning");
    }

    const montoFloat = parseFloat(monto);

    if (montoFloat > user.saldo) {
      return Swal.fire("Error", "Saldo insuficiente", "warning");
    }

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/api/wallet/transferencia",
        {
          telefono_origen: user.telefono,
          telefono_destino: receptorData.telefono,
          monto: montoFloat,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setToasts((prev) => [
        ...prev,
        {
          mensaje: `💰 Enviaste $${montoFloat.toLocaleString()} a ${receptorData.nombre}`,
        },
      ]);

      fetchData();
      setMonto("");
      setReceptorInput("");
      setReceptorData(null);
    } catch (err) {
      Swal.fire("Error", "Error en la transferencia", "error");
    }
  };

  if (loading || !user)
    return <p style={{ color: "#fff" }}>Cargando...</p>;

  return (
    <div className="container">
      <h1>Hola {user.nombre}</h1>
      <h2>${user.saldo}</h2>

      <button onClick={() => setShowModalMovimientos(true)}>
        Ver movimientos
      </button>

      {showModalMovimientos && (
        <ModalMovimientos
          telefono={user.telefono}
          onClose={() => setShowModalMovimientos(false)}
        />
      )}

      <ToastContainer notifications={toasts} onDone={() => setToasts([])} />
    </div>
  );
}