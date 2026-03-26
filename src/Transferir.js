import { useState, useEffect } from "react";
import api from "../services/api"; // Asegúrate de usar tu API configurada
import Swal from "sweetalert2";

export default function Transferir({ userId }) {
  const [receptorInput, setReceptorInput] = useState("");
  const [receptorData, setReceptorData] = useState(null);
  const [monto, setMonto] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===== Obtener datos del usuario (saldo) =====
  const fetchUser = async () => {
    try {
      const res = await api.get(`/api/wallet/usuario/${userId}`);
      setUser(res.data);
    } catch (err) {
      Swal.fire("Error", "No se pudieron cargar tus datos", "error");
    }
  };

  useEffect(() => {
    if (userId) fetchUser();
  }, [userId]);

  // ===== Buscar receptor =====
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

  // ===== Enviar dinero =====
  const enviar = async () => {
    if (!receptorData || !monto) {
      Swal.fire("Error", "Completa todos los campos", "warning");
      return;
    }

    if (parseFloat(monto) <= 0 || parseFloat(monto) > user.saldo) {
      Swal.fire("Error", "Monto inválido", "warning");
      return;
    }

    try {
      await api.post("/api/wallet/transferencia", {
        emisor_id: userId,
        receptor_id: receptorData.id,
        monto: parseFloat(monto),
      });

      Swal.fire("Éxito", `Transferencia de $${monto} realizada`, "success");

      // Limpiar campos
      setMonto("");
      setReceptorInput("");
      setReceptorData(null);

      // Actualizar saldo del usuario
      fetchUser();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.msg || "No se pudo realizar la transferencia",
        "error"
      );
    }
  };

  if (!user) return <p>Cargando datos...</p>;

  return (
    <div style={styles.container}>
      <h2>Enviar dinero</h2>
      <p>Saldo disponible: ${user.saldo.toLocaleString()}</p>

      <input
        placeholder="Número de celular o identidad"
        value={receptorInput}
        onChange={(e) => setReceptorInput(e.target.value)}
        style={styles.input}
      />
      {receptorData && <p>Vas a transferir a: {receptorData.nombre}</p>}

      <input
        placeholder="Monto"
        type="number"
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        style={styles.input}
      />

      <button onClick={enviar} style={styles.button}>💸 Enviar</button>
    </div>
  );
}

// ===== ESTILOS =====
const styles = {
  container: { maxWidth: 400, margin: "auto", padding: 20, color: "#fff" },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    border: "none",
  },
  button: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#ff2e63",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
};