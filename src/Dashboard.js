// src/Dashboard.js
import { useEffect, useState } from "react";
import api from "./services/api";
import Swal from "sweetalert2";
import ModalMovimientos from "./ModalMovimientos";
import ToastContainer from "./ToastContainer";
import "./styles.css";

export default function Dashboard({ logout, usuario }) {
  const [user, setUser] = useState(usuario || null);
  const [loading, setLoading] = useState(false);

  // 🔍 Buscador
  const [receptorInput, setReceptorInput] = useState("");
  const [receptorList, setReceptorList] = useState([]);
  const [receptorData, setReceptorData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [monto, setMonto] = useState("");
  const [showModalMovimientos, setShowModalMovimientos] = useState(false);

  // 🔔 Notificaciones
  const [pendingNotifications, setPendingNotifications] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [showHoverNotif, setShowHoverNotif] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // ======================
  // 👤 Obtener usuario con JWT si no viene por prop
  // ======================
  const fetchData = async () => {
    if (user) return; // ya tenemos usuario
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No hay token, inicia sesión");

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
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ======================
  // 🔔 Notificaciones pendientes
  // ======================
  const fetchPendingNotifications = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/api/notificaciones/pendientes/${user.telefono}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPendingNotifications(res.data || []);
      setPendingCount((res.data && res.data.length) || 0);
    } catch (err) {
      console.error("Error notificaciones", err);
      setPendingNotifications([]);
      setPendingCount(0);
    }
  };

  useEffect(() => {
    fetchPendingNotifications();
    const interval = setInterval(fetchPendingNotifications, 8000);
    return () => clearInterval(interval);
  }, [user]);

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
        confirmButtonColor: "#16a34a",
        cancelButtonColor: "#dc2626",
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
          await Swal.fire("✅ Aprobado", "Pago realizado", "success");
        } catch {
          await Swal.fire("Error", "No se pudo procesar", "error");
        }
      } else {
        await Swal.fire("❌ Cancelado", "Compra rechazada", "info");
      }
    } else {
      setToasts((prev) => [...prev, { mensaje: n.mensaje }]);
    }

    // Marcar como leída
    await api.put(
      `/api/notificaciones/leida/${n.notif_id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  // ======================
  // 🔍 Buscador Autocomplete
  // ======================
  useEffect(() => {
    if (!receptorInput || !user) {
      setReceptorList([]);
      setShowDropdown(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/api/wallet/buscar/${receptorInput}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filtrados = (res.data || []).filter(
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
    setReceptorInput(usuario.nombre + " - " + usuario.telefono);
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
    if (isNaN(montoFloat) || montoFloat <= 0) {
      return Swal.fire("Error", "Monto inválido", "warning");
    }
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

      await api.post(
        "/api/notificaciones",
        {
          telefono_destino: receptorData.telefono,
          mensaje: `💰 ${user.nombre} te envió $${montoFloat.toLocaleString()}`,
          monto: montoFloat,
          tipo: "transferencia",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setToasts((prev) => [
        ...prev,
        {
          mensaje: `💰 Enviaste $${montoFloat.toLocaleString()} a ${receptorData.nombre}`,
        },
      ]);
      fetchData(); // refresca saldo
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

  if (loading || !user)
    return <p style={{ color: "#fff" }}>Cargando datos de usuario...</p>;

  return (
    <div className="container">
      {/* HEADER */}
      <header className="header-card">
        <div>
          <h1 className="title">
            Hola, <span className="highlight">{user.nombre}</span>
          </h1>
          <p className="subtitle">Saldo disponible</p>
          <h2 className="saldo">${user.saldo?.toLocaleString() || 0}</h2>
          <p style={{ color: "#fff" }}>📞 {user.telefono}</p>
        </div>

        <div
          className="notification-wrapper"
          onMouseEnter={() => setShowHoverNotif(true)}
          onMouseLeave={() => setShowHoverNotif(false)}
        >
          <button
            className="notification-btn"
            onClick={async () => {
              for (const n of pendingNotifications) {
                await handleProcessNotification(n);
              }
              setPendingNotifications([]);
              setPendingCount(0);
            }}
            title="Ver notificaciones"
          >
            🔔
            {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
          </button>

          {showHoverNotif && (
            <div className="hover-dropdown">
              {pendingNotifications.length > 0 ? (
                pendingNotifications.map((n) => (
                  <div key={n.notif_id} className="hover-item">
                    {n.mensaje.length > 50
                      ? n.mensaje.slice(0, 50) + "..."
                      : n.mensaje}
                  </div>
                ))
              ) : (
                <div className="hover-item">
                  No hay notificaciones pendientes
                </div>
              )}
            </div>
          )}
        </div>

        <button className="logout-btn" onClick={logout}>
          Salir
        </button>
      </header>

      {/* 💸 Enviar dinero */}
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
                    key={u.user_id}
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

      {/* BOTONES */}
      <button
        className="mov-btn"
        onClick={() => setShowModalMovimientos(true)}
      >
        Ver movimientos
      </button>

      {/* ✏️ Editar datos */}
      <button
        className="edit-btn"
        onClick={async () => {
          const { value: formValues } = await Swal.fire({
            title: "Editar tus datos",
            html:
              `<input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${user.nombre}">` +
              `<input id="swal-identidad" class="swal2-input" placeholder="Identidad" value="${user.identidad}">` +
              `<input id="swal-celular" class="swal2-input" placeholder="Celular" value="${user.telefono}">` +
              `<input id="swal-email" class="swal2-input" placeholder="Correo" value="${user.email}">`,
            focusConfirm: false,
            preConfirm: () => ({
              nombre: document.getElementById("swal-nombre").value,
              identidad: document.getElementById("swal-identidad").value,
              telefono: document.getElementById("swal-celular").value,
              email: document.getElementById("swal-email").value,
            }),
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#dc2626",
          });

          if (!formValues) return;

          try {
            const token = localStorage.getItem("token");
            await api.put(`/api/wallet/editar/${user.user_id}`, formValues, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUser({ ...user, ...formValues });
            Swal.fire(
              "Actualizado!",
              "Tus datos se actualizaron correctamente",
              "success"
            );
          } catch {
            Swal.fire("Error", "No se pudieron actualizar tus datos", "error");
          }
        }}
      >
        ✏️ Editar mis datos
      </button>

      {showModalMovimientos && (
        <ModalMovimientos
          telefono={user.telefono}
          onClose={() => setShowModalMovimientos(false)}
        />
      )}

      {/* TOASTS */}
      <ToastContainer notifications={toasts} onDone={() => setToasts([])} />
    </div>
  );
}