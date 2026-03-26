import { useState } from "react";
import api from "./services/api";
import Swal from "sweetalert2";

export default function App() {
  const [vista, setVista] = useState("login"); // 'login' o 'register'
  const [userId, setUserId] = useState(null);

  // ================= LOGIN =================
  const Login = () => {
    const [telefono, setTelefono] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const login = async () => {
      if (!telefono || !password) {
        return Swal.fire({
          icon: "warning",
          title: "Campos incompletos",
          text: "Por favor completa todos los campos",
        });
      }

      try {
        setLoading(true);
        const res = await api.post("/api/login", {
          usuario: telefono,
          password,
        });

        setUserId(res.data.id);

        Swal.fire({
          icon: "success",
          title: `Bienvenido ${res.data.nombre} 🔥`,
          text: `Tu saldo actual es $${res.data.saldo}`,
          showConfirmButton: false,
          timer: 2000,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.msg || "Credenciales incorrectas",
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
            placeholder="Número de celular"
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
  };

  // ================= REGISTER =================
  const Register = () => {
    const [form, setForm] = useState({
      nombre: "",
      identidad: "",
      celular: "",
      email: "",
      password: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
    };

    const register = async () => {
      const { nombre, identidad, celular, email, password } = form;
      if (!nombre || !identidad || !celular || !email || !password) {
        return Swal.fire({
          icon: "warning",
          title: "Campos incompletos",
          text: "Por favor completa todos los campos",
        });
      }

      try {
        setLoading(true);
        await api.post("/api/register", form);

        Swal.fire({
          icon: "success",
          title: "Usuario creado correctamente 🔥",
          showConfirmButton: false,
          timer: 1500,
        });

        setForm({ nombre: "", identidad: "", celular: "", email: "", password: "" });

        setTimeout(() => setVista("login"), 1500);
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
        <div style={styles.logoContainer}>
          <h1 style={styles.logo}>SistelPay</h1>
          <p style={styles.subtitle}>Crea tu cuenta 💳</p>
        </div>

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
            name="celular"
            placeholder="Número de celular"
            value={form.celular}
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
  };

  // ================= VISTA PRINCIPAL =================
  return vista === "login" ? <Login /> : <Register />;
}

// ================== ESTILOS ==================
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(180deg, #0f0f1a, #1a1a2e)",
    color: "white",
    paddingTop: 20,
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
  registerButton: {
    width: "100%",
    padding: 12,
    background: "transparent",
    border: "1px solid #ff2e63",
    borderRadius: 10,
    color: "#ff2e63",
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