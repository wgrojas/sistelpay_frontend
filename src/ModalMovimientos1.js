import { useEffect, useState } from "react";
import api from "./services/api";
import Swal from "sweetalert2";

export default function ModalMovimientos({ telefono, onClose }) {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/wallet/movimientos/${telefono}`);
      setMovimientos(res.data);
    } catch (error) {
      Swal.fire("Error", "No se pudieron cargar los movimientos", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (telefono) fetchMovimientos();
  }, [telefono]);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Movimientos recientes</h2>
        <button style={styles.closeButton} onClick={onClose}>
          ✖ Cerrar
        </button>

        {loading ? (
          <p style={styles.loading}>Cargando...</p>
        ) : (
          <ul style={styles.movimientosList}>
            {movimientos.length === 0 && (
              <li style={styles.noMovimientos}>No hay movimientos aún</li>
            )}

            {movimientos.map((mov) => {
              const esEmisor = mov.telefono_origen === telefono;
              const tipoTexto = esEmisor ? "Enviado" : "Recibido";

              // Flecha según envío o recepción
              const flecha = esEmisor ? "→" : "←";

              // Nombre y teléfono de la contraparte
              const counterpartNombre = esEmisor ? mov.receptor : mov.emisor;
              const counterpartTelefono = esEmisor ? mov.telefono_destino : mov.telefono_origen;

              return (
                <li
                  key={mov.trans_id}
                  style={esEmisor ? styles.movimientoEmisor : styles.movimientoReceptor}
                >
                  <div style={styles.movInfo}>
                    <span style={styles.movTipo}>
                      {tipoTexto} {flecha} {counterpartNombre} ({counterpartTelefono})
                    </span>
                  </div>
                  <div style={styles.movMonto}>
                    {esEmisor ? "-" : "+"}${mov.monto.toLocaleString()}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// ================== ESTILOS ==================
const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
    padding: 10,
  },
  modal: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "80vh",
    overflowY: "auto",
    background: "#1e1e2f",
    borderRadius: 20,
    padding: 20,
    color: "#fff",
    position: "relative",
    boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
  },
  title: {
    marginBottom: 15,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#ffb84d",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "#ff6b81",
    border: "none",
    padding: 8,
    borderRadius: 10,
    cursor: "pointer",
    color: "#fff",
    fontWeight: "bold",
  },
  loading: { textAlign: "center", fontSize: 16, color: "#aaa" },
  movimientosList: {
    listStyle: "none",
    padding: 0,
    marginTop: 10,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  noMovimientos: {
    textAlign: "center",
    color: "#aaa",
    fontStyle: "italic",
  },
  movInfo: {
    display: "flex",
    flexDirection: "column",
  },
  movimientoEmisor: {
    display: "flex",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    background: "#ff3b30",
    color: "#fff",
    fontWeight: "bold",
    boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
  },
  movimientoReceptor: {
    display: "flex",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    background: "#00d1b2",
    color: "#fff",
    fontWeight: "bold",
    boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
  },
  movTipo: { fontWeight: "bold" },
  movMonto: { fontWeight: "bold" },
};