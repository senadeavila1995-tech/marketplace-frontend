import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { login } from "../api/authService";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!email.trim() || !password) {
      await Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Ingresa tu correo y contraseña.",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await login({
        email: email.trim(),
        password,
      });

      const role = response.user.role;

      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get("returnTo");

      if (
        role === "CUSTOMER" &&
        returnTo &&
        returnTo.startsWith("/") &&
        !returnTo.startsWith("//")
      ) {
        navigate(returnTo, { replace: true });
      } else if (role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else if (role === "SELLER") {
        navigate("/seller", { replace: true });
      } else {
        navigate("/shop", { replace: true });
      }
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible iniciar sesión",
        text:
          error?.response?.data ||
          "Verifica tus credenciales e inténtalo nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page p-3">
      <div className="card auth-card">
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <h1 className="h3 fw-bold">Marketplace</h1>
            <p className="text-muted mb-0">
              Inicia sesión para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted">¿No tienes cuenta? </span>
            <Link to="/register">Crear cuenta</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
