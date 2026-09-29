import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { googleLogin, login } from "../api/authService";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [promotionsAuthorized, setPromotionsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleGoogleSuccess(
    credentialResponse: { credential?: string }
  ) {
    if (!credentialResponse.credential) {
      await Swal.fire({
        icon: "error",
        title: "Google no entregó la credencial",
      });
      return;
    }

    if (!termsAccepted || !promotionsAuthorized) {
      await Swal.fire({
        icon: "warning",
        title: "Autorizaciones requeridas",
        text:
          "Para continuar con Google debes aceptar los Términos y condiciones y autorizar el envío de comunicaciones, promociones y ofertas por correo electrónico.",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await googleLogin({
        credential: credentialResponse.credential,
        termsAccepted: true,
        promotionsAuthorized: true,
      });

      await Swal.fire({
        icon: "success",
        title: "Inicio de sesión exitoso",
        text: "Tu cuenta de cliente fue autenticada correctamente.",
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
      const data = error?.response?.data;

      await Swal.fire({
        icon: "error",
        title: "No fue posible iniciar sesión con Google",
        text:
          typeof data === "string"
            ? data
            : data?.message ||
              "Ocurrió un error al autenticar con Google.",
      });
    } finally {
      setLoading(false);
    }
  }

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

          <div className="d-flex align-items-center gap-2 my-4">
            <hr className="flex-grow-1" />
            <span className="text-muted small">O</span>
            <hr className="flex-grow-1" />
          </div>

          <div className="text-center">
            <div className="mb-3">
              <span className="fw-semibold">
                Continuar como cliente con Google
              </span>
            </div>

            <div className="text-start mb-3">
              <div className="form-check mb-2">
                <input
                  id="googleTermsAccepted"
                  type="checkbox"
                  className="form-check-input"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />

                <label
                  htmlFor="googleTermsAccepted"
                  className="form-check-label"
                >
                  Acepto los Términos y condiciones de Marketplace.
                </label>
              </div>

              <div className="form-check">
                <input
                  id="googlePromotionsAuthorized"
                  type="checkbox"
                  className="form-check-input"
                  checked={promotionsAuthorized}
                  onChange={(e) =>
                    setPromotionsAuthorized(e.target.checked)
                  }
                />

                <label
                  htmlFor="googlePromotionsAuthorized"
                  className="form-check-label"
                >
                  Autorizo recibir comunicaciones, promociones y ofertas
                  de Marketplace en mi correo electrónico.
                </label>
              </div>
            </div>

            <div className="d-flex justify-content-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  Swal.fire({
                    icon: "error",
                    title: "Google no pudo autenticarte",
                    text:
                      "No fue posible seleccionar la cuenta de Google.",
                  });
                }}
              />
            </div>
          </div>

          <div className="text-center mt-4">
            <span className="text-muted">¿No tienes cuenta? </span>
            <Link to="/register">Crear cuenta</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
