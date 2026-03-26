// Login.jsx
import { useState } from "react";
import api from "./services/api";
import Swal from "sweetalert2";

export default function Login({ setToken, setVista, setUsuario }) {
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // const login = async () => {
  //   if (!telefono || !password) {
  //     return Swal.fire({
  //       icon: "warning",
  //       title: "Campos incompletos",
  //       text: "Por favor completa todos los campos",
  //     });
  //   }

  //   if (!/^\d+$/.test(telefono)) {
  //     return Swal.fire({
  //       icon: "warning",
  //       title: "Teléfono inválido",
  //       text: "El número de teléfono debe contener solo dígitos",
  //     });
  //   }

  //   try {
  //     setLoading(true);

  //     // 🔑 Llamada al backend
  //     const res = await api.post("/api/login", { telefono, password });

  //     // Verificar respuesta
  //     if (!res.data || !res.data.token) {
  //       throw new Error("Respuesta inválida del servidor");
  //     }

  //     // Guardar token en App.jsx → habilita Dashboard
  //     setToken(res.data.token);

  //     // Guardar usuario completo
  //     setUsuario(res.data);

  //     Swal.fire({
  //       icon: "success",
  //       title: `Bienvenido ${res.data.nombre} 🔥`,
  //       text: `Tu saldo actual es $${res.data.saldo.toLocaleString()}`,
  //       showConfirmButton: false,
  //       timer: 2000,
  //     });
  //   } catch (error) {
  //     console.error("Login error:", error.response || error.message);
  //     Swal.fire({
  //       icon: "error",
  //       title: "Error",
  //       text: error.response?.data?.msg || error.message || "Credenciales incorrectas",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const login = async () => {
    if (!telefono || !password) {
      return Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos",
      });
    }

    if (!/^\d+$/.test(telefono)) {
      return Swal.fire({
        icon: "warning",
        title: "Teléfono inválido",
        text: "El número de teléfono debe contener solo dígitos",
      });
    }

    try {
      setLoading(true);

      console.log("⏳ Enviando login...", { telefono, password });
      const res = await api.post("/api/login", { telefono, password });
      // console.log("✅ Respuesta del backend:", res.data);

      if (!res.data || !res.data.user) {
  throw new Error("Usuario no encontrado o respuesta inválida");
}
      // setToken(res.data.user_id);
      // setUsuario(res.data);
      setToken(res.data.token); // guarda solo el token
      setUsuario(res.data.user); // guarda solo el objeto user

      Swal.fire({
        icon: "success",
        title: `Bienvenido ${res.data.nombre} 🔥`,
        text: `Tu saldo actual es $${res.data.user.saldo.toLocaleString()}`,
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error("❌ Login error completo:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.msg ||
          error.message ||
          "Credenciales incorrectas",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.logoContainer}>
        <h1 style={styles.logo}>SistelPay</h1>
        <p style={styles.subtitle}>Tu billetera digital 💳</p>
      </div>

      <div style={styles.card}>
        <h2 style={styles.title}>Iniciar sesión</h2>

        <input
          style={styles.input}
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={login}>
          {loading ? "Ingresando..." : "Entrar"}
        </button>

        <button
          style={styles.registerButton}
          onClick={() => setVista("register")}
        >
          Crear cuenta
        </button>
      </div>

      <p style={styles.footer}>🔐 Seguro • Rápido • Fácil</p>
    </div>
  );
}

// ================== ESTILOS ==================
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(180deg, #0f0f1a, #1a1a2e)",
    color: "white",
  },
  logoContainer: { textAlign: "center", marginBottom: 30 },
  logo: { color: "#ff2e63", fontSize: 38, margin: 0, fontWeight: "bold" },
  subtitle: { color: "#aaa" },
  card: {
    background: "#1c1c2e",
    padding: 30,
    borderRadius: 20,
    width: 320,
    boxShadow: "0px 10px 30px rgba(0,0,0,0.5)",
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
  registerButton: {
    width: "100%",
    padding: 12,
    background: "transparent",
    border: "1px solid #ff2e63",
    borderRadius: 10,
    color: "#ff2e63",
    fontWeight: "bold",
    cursor: "pointer",
  },
  footer: { marginTop: 20, fontSize: 12, color: "#777" },
};
