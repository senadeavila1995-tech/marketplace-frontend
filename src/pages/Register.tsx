import { useState } from "react";
import { register } from "../services/authService";
import Swal from "sweetalert2";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  const submit = async () => {
    try {
      if (!form.name || !form.email || !form.password || !form.role) {
        Swal.fire({
          icon: "warning",
          title: "Campos incompletos",
        });
        return;
      }

      const res = await register(form);

      // 🔥 guardar sesión
      localStorage.setItem("user", JSON.stringify(res));

      Swal.fire({
        icon: "success",
        title: "Usuario creado",
      });

      console.log("REGISTER OK:", res);
    } catch (err: any) {
      console.log("ERROR:", err.response?.data);

      Swal.fire({
        icon: "error",
        title: "Error de registro",
        text: err.response?.data || "Error desconocido",
      });
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "400px" }}>
      <h2>Registro</h2>

      <input
        className="form-control my-2"
        placeholder="Nombre"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        className="form-control my-2"
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        className="form-control my-2"
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <select
        className="form-control my-2"
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      >
        <option value="">Selecciona rol</option>
        <option value="CUSTOMER">CUSTOMER</option>
        <option value="SELLER">SELLER</option>
      </select>

      <button className="btn btn-primary w-100" onClick={submit}>
        Registrarse
      </button>
    </div>
  );
}