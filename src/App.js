import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";

function App() {
  // 🔹 Estado del usuario logueado
  const [userId, setUserId] = useState(null);        // ID del usuario
  const [identidad, setIdentidad] = useState(null);  // Identidad del usuario (para notificaciones)
  const [vista, setVista] = useState("login");       // Controla solo Login / Register

  // 🔹 Función de logout
  const logout = () => {
    setUserId(null);
    setIdentidad(null);
    setVista("login");
  };

  // 🔐 Usuario logueado → Dashboard
  if (userId) {
    return <Dashboard userId={userId} identidad={identidad} logout={logout} />;
  }

  // ⚡ Usuario NO logueado → Login o Register
  return vista === "register" ? (
    <Register setUserId={setUserId} setVista={setVista} setIdentidad={setIdentidad} />
  ) : (
    <Login setUserId={setUserId} setVista={setVista} setIdentidad={setIdentidad} />
  );
}

export default App;