import { useState } from "react";
import { login } from "../api/authService";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { session } from "../services/session";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Iniciando sesión...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await login({ email, password });

      console.log("LOGIN RESPONSE:", res);

      // =========================
      // NORMALIZAR ROLE (CRÍTICO)
      // =========================
      const role = res.user?.role?.toUpperCase().trim();

      console.log("ROLE DETECTADO:", role);

      // =========================
      // GUARDAR SESIÓN
      // =========================
      session.setSession({
        token: res.token,
        role,
        user: {
          id: res.user?.id,
          email: res.user?.email,
          storeId: res.user?.storeId,
        },
      });

      Swal.fire({
        icon: "success",
        title: "Bienvenido",
        timer: 1200,
        showConfirmButton: false,
      });

      // =========================
      // REDIRECCIÓN POR ROL
      // =========================
      if (role === "CUSTOMER") {
        navigate("/shop", { replace: true });
      } else if (role === "SELLER") {
        navigate("/products", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

    } catch (err: any) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Error de login",
        text:
          err?.response?.data?.message ||
          "Credenciales incorrectas",
      });
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2>Login</h2>

      <input
        className="form-control my-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="form-control my-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn btn-primary w-100" onClick={handleLogin}>
        Iniciar sesión
      </button>

      <p className="mt-3 text-center">
        ¿No tienes cuenta? <a href="/register">Registrarse</a>
      </p>
    </div>
  );
}