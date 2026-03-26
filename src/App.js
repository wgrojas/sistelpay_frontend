// src/App.js
import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";

function App() {
  // 🔹 Estado del token (guardado en localStorage)
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // 🔹 Estado del usuario logueado
  const [usuario, setUsuario] = useState(null);

  // 🔹 Estado de la vista (login o register)
  const [vista, setVista] = useState("login");

  // 🔹 Función de logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUsuario(null); // limpiar usuario al salir
  };

  // 🔹 Función para actualizar el token desde login o register
  const handleSetToken = (t) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  // 🔹 Si hay token y usuario, mostramos Dashboard
  if (token && usuario) {
    return <Dashboard token={token} usuario={usuario} logout={logout} />;
  }

  // 🔹 Renderizado condicional: login o register
  return vista === "register" ? (
    <Register setToken={handleSetToken} setVista={setVista} setUsuario={setUsuario} />
  ) : (
    <Login setToken={handleSetToken} setVista={setVista} setUsuario={setUsuario} />
  );
}

export default App;