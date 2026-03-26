import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "./services/api";
import ModalMovimientos from "./ModalMovimientos";
import "./styles.css";

export default function Dashboard({ userId, logout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [receptorInput, setReceptorInput] = useState("");
  const [receptorList, setReceptorList] = useState([]);
  const [receptorData, setReceptorData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [monto, setMonto] = useState("");
  const [showModalMovimientos, setShowModalMovimientos] = useState(false);

  // 🔔 NOTIFICACIONES
  const [pendingNotifications, setPendingNotifications] = useState([]);
  const [processing, setProcessing] = useState(false);

  // ======================
  // 👤 USUARIO
  // ======================
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/wallet/usuario/${userId}`);
      setUser(res.data);
    } catch {
      Swal.fire("Error", "No se pudieron cargar los datos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // ======================
  // 🔔 OBTENER NOTIFICACIONES
  // ======================
  const fetchPendingNotifications = async () => {
    if (!user) return;

    try {
      const res = await api.get(
        `/api/notificaciones/pendientes/${user.telefono}`
      );
      setPendingNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPendingNotifications();
    const interval = setInterval(fetchPendingNotifications, 6000);
    return () => clearInterval(interval);
  }, [user]);

  // ======================
  // 🔥 PROCESAR NOTIFICACIONES
  // ======================
  useEffect(() => {
    if (!pendingNotifications.length || processing) return;

    const procesar = async () => {
      setProcessing(true);

      for (const n of pendingNotifications) {
        const esCompra =
          n.tipo === "compra" ||
          n.mensaje.toLowerCase().includes("compra") ||
          n.mensaje.toLowerCase().includes("pago");

        if (esCompra) {
          const result = await Swal.fire({
            title: "🛒 Solicitud de compra",
            html: `
              <p>${n.mensaje}</p>
              <strong>Monto: $${Number(n.monto).toLocaleString()}</strong>
            `,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "✅ Aceptar",
            cancelButtonText: "❌ Cancelar",
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#dc2626",
          });

          if (result.isConfirmed) {
            try {
              await api.post("/api/wallet/transferencia", {
                telefono_origen: user.telefono,
                telefono_destino: n.telefono_origen,
                monto: n.monto,
              });

              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "✅ Pago realizado",
                timer: 2000,
                showConfirmButton: false,
              });
            } catch {
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "Error al procesar",
                timer: 2000,
                showConfirmButton: false,
              });
            }
          } else {
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "info",
              title: "❌ Compra rechazada",
              timer: 2000,
              showConfirmButton: false,
            });
          }
        } else {
          // 🔔 DINERO RECIBIDO → TOAST
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: n.mensaje,
            timer: 3000,
            showConfirmButton: false,
          });
        }

        await api.put(`/api/notificaciones/leida/${n.notif_id}`);
      }

      setPendingNotifications([]);
      setProcessing(false);
    };

    procesar();
  }, [pendingNotifications]);

  // ======================
  // 🔍 BUSCADOR
  // ======================
  useEffect(() => {
    if (!receptorInput) {
      setReceptorList([]);
      setShowDropdown(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await api.get(`/api/wallet/buscar/${receptorInput}`);

        const filtrados = res.data.filter(
          (u) => u.telefono !== user.telefono
        );

        setReceptorList(filtrados);
        setShowDropdown(true);
      } catch {
        setReceptorList([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [receptorInput, user]);

  const seleccionarUsuario = (usuario) => {
    setReceptorData(usuario);
    setReceptorInput(usuario.telefono);
    setShowDropdown(false);
  };

  // ======================
  // 💸 TRANSFERENCIA
  // ======================
  const enviarDinero = async () => {
    if (!receptorData || !monto) {
      return Swal.fire("Error", "Completa los campos", "warning");
    }

    const montoFloat = parseFloat(monto);

    if (isNaN(montoFloat) || montoFloat <= 0) {
      return Swal.fire("Error", "Monto inválido", "warning");
    }

    if (montoFloat > user.saldo) {
      return Swal.fire("Error", "Saldo insuficiente", "warning");
    }

    try {
      await api.post("/api/wallet/transferencia", {
        telefono_origen: user.telefono,
        telefono_destino: receptorData.telefono,
        monto: montoFloat,
      });

      await api.post("/api/notificaciones", {
        telefono_destino: receptorData.telefono,
        mensaje: `💰 ${user.nombre} te envió $${montoFloat.toLocaleString()}`,
        monto: montoFloat,
        tipo: "transferencia",
      });

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "💸 Transferencia exitosa",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchData();
      setMonto("");
      setReceptorInput("");
      setReceptorData(null);
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.msg || "Error en la transferencia",
        "error"
      );
    }
  };

  if (loading || !user) return <p style={{ color: "#fff" }}>Cargando...</p>;

  return (
    <div className="container">
      {/* HEADER */}
      <header className="header-card">
        <div>
          <h1 className="title">
            Hola, <span className="highlight">{user.nombre}</span>
          </h1>
          <p className="subtitle">Saldo disponible</p>
          <h2 className="saldo">${user.saldo.toLocaleString()}</h2>
          <p style={{ color: "#fff" }}>📞 {user.telefono}</p>
        </div>

        {/* 🔔 CAMPANITA SIEMPRE */}
        <div className="notification-wrapper">
          <div className="notification-btn">
            🔔
            {pendingNotifications.length > 0 && (
              <span className="badge">
                {pendingNotifications.length}
              </span>
            )}
          </div>
        </div>

        <button className="logout-btn" onClick={logout}>
          Salir
        </button>
      </header>

      {/* RESTO IGUAL */}
      <div className="card">
        <h3 className="card-title">Enviar dinero</h3>

        <div className="form-row">
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              placeholder="Nombre o teléfono"
              value={receptorInput}
              onChange={(e) => {
                setReceptorInput(e.target.value);
                setReceptorData(null);
              }}
              className="input"
            />

            {showDropdown && receptorList.length > 0 && (
              <div className="dropdown">
                {receptorList.map((u) => (
                  <div
                    key={u.telefono}
                    className="dropdown-item"
                    onClick={() => seleccionarUsuario(u)}
                  >
                    <strong>{u.nombre}</strong>
                    <br />
                    <span>📞 {u.telefono}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <input
            type="number"
            placeholder="Monto"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="input"
          />
        </div>

        {receptorData && (
          <p className="receptor-info">
            ✅ {receptorData.nombre} {receptorData.telefono}
          </p>
        )}

        <button className="send-btn" onClick={enviarDinero}>
          💸 Enviar dinero
        </button>
      </div>

      <button
        className="mov-btn"
        onClick={() => setShowModalMovimientos(true)}
      >
        Ver movimientos
      </button>

      {showModalMovimientos && (
        <ModalMovimientos
          telefono={user.telefono}
          onClose={() => setShowModalMovimientos(false)}
        />
      )}
    </div>
  );
}