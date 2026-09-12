import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../../api/userService";
import type { User, UserRole } from "../../types/User";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER" as UserRole,
  });

  async function load() {
    try {
      setLoading(true);
      setUsers(await getUsers());
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data || "No se pudieron cargar usuarios.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
      });
      return;
    }

    try {
      await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      setForm({
        name: "",
        email: "",
        password: "",
        role: "CUSTOMER",
      });

      await load();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible crear el usuario",
        text: error?.response?.data || "Error del servidor.",
      });
    }
  }

  async function handleUpdate(user: User) {
    const name = window.prompt("Nombre", user.name);
    if (name === null) return;

    const email = window.prompt("Email", user.email);
    if (email === null) return;

    const role = window.prompt(
      "Rol (ADMIN, SELLER, CUSTOMER)",
      user.role
    ) as UserRole | null;

    if (!role) return;

    if (!["ADMIN", "SELLER", "CUSTOMER"].includes(role)) {
      await Swal.fire({
        icon: "warning",
        title: "Rol inválido",
      });
      return;
    }

    try {
      await updateUser(user.id, {
        name: name.trim(),
        email: email.trim(),
        role,
      });

      await load();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible actualizar",
        text: error?.response?.data || "Error del servidor.",
      });
    }
  }

  async function handleDelete(user: User) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar usuario",
      text: `¿Eliminar a ${user.name}?`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteUser(user.id);
      await load();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible eliminar",
        text: error?.response?.data || "Error del servidor.",
      });
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold">Usuarios</h1>
        <p className="text-muted">
          Administración de usuarios y roles.
        </p>
      </div>

      <div className="card dashboard-card mb-4">
        <div className="card-body">
          <h2 className="h5">Crear usuario</h2>

          <form onSubmit={handleCreate}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Correo</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Rol</label>
                <select
                  className="form-select"
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value as UserRole,
                    })
                  }
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="SELLER">SELLER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>

            <button className="btn btn-primary mt-3">
              Crear usuario
            </button>
          </form>
        </div>
      </div>

      <div className="card table-card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              Cargando usuarios...
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className="badge text-bg-light border">
                          {user.role}
                        </span>
                      </td>

                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() =>
                              handleUpdate(user)
                            }
                          >
                            Editar
                          </button>

                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() =>
                              handleDelete(user)
                            }
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
