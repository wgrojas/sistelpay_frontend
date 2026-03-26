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

// import { useState } from "react";
// import Login from "./Login";
// import Register from "./Register";
// import Dashboard from "./Dashboard";

// function App() {
//   const [usuario, setUsuario] = useState(null);  // Estado global del usuario
//   const [vista, setVista] = useState("login");   // Controla Login / Register

//   const logout = () => {
//     setUsuario(null);
//     setVista("login");
//   };

//   // 🔐 Si el usuario ya hizo login → mostrar Dashboard
//   if (usuario) {
//     return <Dashboard usuario={usuario} logout={logout} />;
//   }

//   // ⚡ Usuario NO logueado → Login o Register
//   return vista === "register" ? (
//     <Register setUsuario={setUsuario} setVista={setVista} />
//   ) : (
//     <Login setUsuario={setUsuario} setVista={setVista} />
//   );
// }

// export default App;

// import { useState } from "react";
// import Login from "./Login";
// import Register from "./Register";
// import Dashboard from "./Dashboard";

// function App() {
//   // 🔹 Estado global del usuario (null si no está logueado)
//   const [usuario, setUsuario] = useState(null);

//   // 🔹 Controla si se muestra Login o Register
//   const [vista, setVista] = useState("login");

//   // 🔹 Función de logout
//   const logout = () => {
//     setUsuario(null);
//     setVista("login");
//   };

//   // 🔐 Usuario logueado → mostrar Dashboard
//   if (usuario) {
//     return <Dashboard usuario={usuario} logout={logout} />;
//   }

//   // ⚡ Usuario NO logueado → Login o Register
//   return vista === "register" ? (
//     <Register setUsuario={setUsuario} setVista={setVista} />
//   ) : (
//     <Login setUsuario={setUsuario} setVista={setVista} />
//   );
// }

// export default App;