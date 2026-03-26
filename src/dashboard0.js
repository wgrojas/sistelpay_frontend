// src/Dashboard.js
import { useEffect, useState } from "react";
import api from "./services/api";
import Swal from "sweetalert2";
import ModalMovimientos from "./ModalMovimientos";

export default function Dashboard({ userId, logout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [receptorInput, setReceptorInput] = useState("");
  const [receptorData, setReceptorData] = useState(null);
  const [monto, setMonto] = useState("");
  const [showModalMovimientos, setShowModalMovimientos] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resUser = await api.get(`/api/wallet/usuario/${userId}`);
      setUser(resUser.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los datos",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId]);

  const editarDatos = async () => {
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
    });

    if (!formValues) return;

    try {
      await api.put(`/api/wallet/editar/${userId}`, formValues);
      setUser({ ...user, ...formValues });
      Swal.fire("Actualizado!", "Tus datos se actualizaron correctamente", "success");
    } catch (error) {
      Swal.fire("Error", "No se pudieron actualizar tus datos", "error");
    }
  };

  useEffect(() => {
    const buscarReceptor = async () => {
      if (!receptorInput) {
        setReceptorData(null);
        return;
      }
      try {
        const res = await api.get(`/api/wallet/buscar/${receptorInput}`);
        setReceptorData(res.data);
      } catch {
        setReceptorData(null);
      }
    };
    const timeout = setTimeout(buscarReceptor, 500);
    return () => clearTimeout(timeout);
  }, [receptorInput]);

  const enviarDinero = async () => {
    if (!receptorData || !monto) {
      Swal.fire("Error", "Completa todos los campos", "warning");
      return;
    }
    if (parseFloat(monto) <= 0 || parseFloat(monto) > user.saldo) {
      Swal.fire("Error", "Monto inválido", "warning");
      return;
    }
    try {
      await api.post(`/api/wallet/transferencia`, {
        emisor_id: userId,
        receptor_id: receptorData.id,
        monto: parseFloat(monto),
      });
      Swal.fire("Éxito", "Transferencia realizada", "success");
      fetchData();
      setMonto("");
      setReceptorInput("");
      setReceptorData(null);
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.msg || "No se pudo realizar la transferencia",
        "error"
      );
    }
  };

  if (loading || !user) return <p style={styles.loading}>Cargando...</p>;

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.headerCard}>
        <div>
          <h1 style={styles.title}>Hola, <span style={styles.highlight}>{user.nombre}</span></h1>
          <p style={styles.subTitle}>Saldo disponible</p>
          <h2 style={styles.saldo}>${user.saldo.toLocaleString()}</h2>
        </div>
        <button style={styles.logoutButton} onClick={logout}>Cerrar sesión</button>
      </header>

      {/* TRANSFERENCIA */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Enviar dinero</h3>
        <input
          type="text"
          placeholder="Número de celular o identidad"
          value={receptorInput}
          onChange={(e) => setReceptorInput(e.target.value)}
          style={styles.input}
        />
        {receptorData && <p style={styles.receptorInfo}>Vas a transferir a: {receptorData.nombre}</p>}
        <input
          type="number"
          placeholder="Monto"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          style={styles.input}
        />
        <button style={styles.sendButton} onClick={enviarDinero}>💸 Enviar</button>
      </div>

      {/* BOTÓN MODAL */}
      <button style={styles.movButton} onClick={() => setShowModalMovimientos(true)}>
        Ver movimientos
      </button>

      {showModalMovimientos && (
        <ModalMovimientos
          userId={user.id}
          onClose={() => setShowModalMovimientos(false)}
        />
      )}

      <button style={styles.editButton} onClick={editarDatos}>✏️ Editar mis datos</button>
    </div>
  );
}

// ================== ESTILOS ==================
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#0f0f1a,#1a1a2e)",
    padding: 20,
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  loading: { color: "white", textAlign: "center", marginTop: 50, fontSize: 18 },

  headerCard: {
    width: "100%",
    maxWidth: 500,
    background: "#1e1e2f",
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  highlight: { color: "#ff2e63" },
  subTitle: { fontSize: 14, color: "#aaa", marginTop: 5 },
  saldo: { fontSize: 32, fontWeight: "bold", color: "#00d1b2", marginTop: 5 },
  logoutButton: {
    background: "#ff6b81",
    border: "none",
    padding: "10px 15px",
    borderRadius: 15,
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },

  card: {
    width: "100%",
    maxWidth: 500,
    background: "#2b2b45",
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  input: { padding: 12, borderRadius: 15, border: "none", fontSize: 16 },
  receptorInfo: { fontWeight: "bold", color: "#00d1b2" },
  sendButton: {
    background: "#ff3b30",
    color: "#fff",
    border: "none",
    padding: 14,
    borderRadius: 20,
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: 5,
  },

  movButton: {
    width: "100%",
    maxWidth: 500,
    background: "#ffb84d",
    border: "none",
    padding: 14,
    borderRadius: 20,
    cursor: "pointer",
    fontWeight: "bold",
    marginBottom: 15,
    color: "#000",
  },

  editButton: {
    width: "100%",
    maxWidth: 500,
    background: "#00d1b2",
    border: "none",
    padding: 14,
    borderRadius: 20,
    cursor: "pointer",
    fontWeight: "bold",
    marginTop: 10,
    fontSize: 16,
    color: "#fff",
  },
};