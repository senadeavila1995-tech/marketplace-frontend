import { useEffect, useState } from "react";
import {
  getUsers,
  updateUser,
  deleteUser,
} from "../../api/userService";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "CUSTOMER",
    password: "",
  });

  // =========================
  // LOAD USERS
  // =========================
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================
  // UPDATE ROLE
  // =========================
  const handleRoleChange = async (id: number, role: string) => {
    try {
      await updateUser(id, { role });
      await loadUsers();
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  // =========================
  // DELETE USER
  // =========================
  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      await loadUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // =========================
  // CREATE USER (FIXED)
  // =========================
 const handleCreate = async () => {
  try {
    const res = await fetch("http://localhost:5108/api/Users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json().catch(() => null);

    console.log("STATUS:", res.status);
    console.log("RESPONSE:", data);

    if (!res.ok) {
      throw new Error(data?.message || "Error creando usuario");
    }

    await loadUsers();

    setForm({
      name: "",
      email: "",
      role: "CUSTOMER",
      password: "",
    });

  } catch (err: any) {
    console.error("Error creating user:", err.message);
  }
};

  return (
    <div className="container mt-4">

      <h2>Usuarios</h2>

      {/* CREATE USER */}
      <div className="card p-3 mb-3">
        <h5>Crear usuario</h5>

        <input
          className="form-control my-1"
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="form-control my-1"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="form-control my-1"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          className="form-control my-1"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="ADMIN">ADMIN</option>
          <option value="SELLER">SELLER</option>
          <option value="CUSTOMER">CUSTOMER</option>
        </select>

        <button className="btn btn-primary mt-2" onClick={handleCreate}>
          Crear usuario
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>

                <td>
                  <select
                    className="form-control"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="SELLER">SELLER</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                  </select>
                </td>

                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(u.id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}