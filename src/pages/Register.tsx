import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { register } from "../api/authService";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER" as "CUSTOMER" | "SELLER",
  });

  const [loading, setLoading] = useState(false);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.role
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
      });
      return;
    }

    try {
      setLoading(true);

      await register({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
      });

      await Swal.fire({
        icon: "success",
        title: "Cuenta creada",
        text: "Ahora puedes iniciar sesión.",
      });

      navigate("/login", { replace: true });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible registrarte",
        text:
          error?.response?.data ||
          "Ocurrió un error al crear la cuenta.",
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
            <h1 className="h3 fw-bold">Crear cuenta</h1>
            <p className="text-muted">
              Regístrate como cliente o vendedor
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) =>
                  updateField("name", e.target.value)
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Correo electrónico</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-control"
                value={form.password}
                onChange={(e) =>
                  updateField("password", e.target.value)
                }
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Tipo de cuenta</label>
              <select
                className="form-select"
                value={form.role}
                onChange={(e) =>
                  updateField(
                    "role",
                    e.target.value as "CUSTOMER" | "SELLER"
                  )
                }
              >
                <option value="CUSTOMER">Cliente</option>
                <option value="SELLER">Vendedor</option>
              </select>
            </div>

            <button
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Creando cuenta..." : "Registrarse"}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted">
              ¿Ya tienes cuenta?{" "}
            </span>
            <Link to="/login">Iniciar sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
