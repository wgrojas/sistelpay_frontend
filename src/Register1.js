import { useState } from "react";
import api from "./services/api";
import Swal from "sweetalert2";

export default function Register({ setVista }) {
  const [form, setForm] = useState({
    nombre: "",
    identidad: "",
    telefono: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const register = async () => {
    const { nombre, identidad, telefono, email, password } = form;

    if (!nombre || !identidad || !telefono || !email || !password) {
      return Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos",
      });
    }

    try {
      setLoading(true);

      // Agregar saldo inicial en 0
      await api.post("/api/register", {
        ...form,
        saldo: 0,
      });

      Swal.fire({
        icon: "success",
        title: "Usuario creado correctamente 🔥",
        showConfirmButton: false,
        timer: 1500,
      });

      // Limpiar formulario
      setForm({
        nombre: "",
        identidad: "",
        telefono: "",
        email: "",
        password: "",
      });

      // Redirigir al login después de 1.5s
      setTimeout(() => setVista("dashboard"), 1500);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.msg || "Error al registrar",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* LOGO */}
      <div style={styles.logoContainer}>
        <h1 style={styles.logo}>SistelPay</h1>
        <p style={styles.subtitle}>Crea tu cuenta 💳</p>
      </div>

      {/* CARD */}
      <div style={styles.card}>
        <h2 style={styles.title}>Registrarse</h2>

        <input
          style={styles.input}
          name="nombre"
          placeholder="Nombre completo"
          value={form.nombre}
          onChange={handleChange}
        />

        <input
          style={styles.input}
          name="identidad"
          placeholder="Número de identificación"
          value={form.identidad}
          onChange={handleChange}
        />

        <input
          style={styles.input}
          name="telefono"
          placeholder="Número de celular"
          value={form.telefono}
          onChange={handleChange}
        />

        <input
          style={styles.input}
          name="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={handleChange}
        />

        <input
          style={styles.input}
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
        />

        <button style={styles.button} onClick={register}>
          {loading ? "Creando..." : "Crear cuenta"}
        </button>

        <button style={styles.backButton} onClick={() => setVista("login")}>
          Volver al login
        </button>
      </div>

      <p style={styles.footer}>🔐 Tus datos están protegidos</p>
    </div>
  );
}

// ================== ESTILOS ==================
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0f0f1a, #1a1a2e)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "white",
    paddingTop: 40,
  },
  logoContainer: { textAlign: "center", marginBottom: 20 },
  logo: { color: "#ff2e63", fontSize: 38, margin: 0, fontWeight: "bold" },
  subtitle: { color: "#aaa", fontSize: 14 },
  card: {
    background: "#1c1c2e",
    padding: 30,
    borderRadius: 20,
    width: 320,
    boxShadow: "0px 10px 30px rgba(0,0,0,0.5)",
    marginTop: 10,
  },
  title: { marginBottom: 20, textAlign: "center" },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 15,
    borderRadius: 10,
    border: "none",
    background: "#2a2a40",
    color: "white",
  },
  button: {
    width: "100%",
    padding: 12,
    background: "#ff2e63",
    border: "none",
    borderRadius: 10,
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: 10,
  },
  backButton: {
    width: "100%",
    padding: 12,
    background: "transparent",
    border: "1px solid #ff2e63",
    borderRadius: 10,
    color: "#ff2e63",
    cursor: "pointer",
  },
  footer: { marginTop: 20, fontSize: 12, color: "#777" },
};