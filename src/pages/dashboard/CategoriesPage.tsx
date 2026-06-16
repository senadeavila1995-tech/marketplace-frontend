import { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../../api/categoryService";

type Category = {
  id: number;
  name: string;
  created_at?: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD CATEGORIES
  // =========================
  const load = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // =========================
  // CREATE CATEGORY
  // =========================
const handleCreate = async () => {
  if (!name.trim()) {
    alert("Nombre requerido");
    return;
  }

  const res = await createCategory({ name: name.trim() });

  console.log("✅ RESPONSE:", res);

  setName("");
  await load();
};

  // =========================
  // DELETE CATEGORY
  // =========================
  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      await load();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Categorías</h2>

      {/* ================= CREATE ================= */}
      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          placeholder="Nueva categoría"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button className="btn btn-primary" onClick={handleCreate}>
          Crear
        </button>
      </div>

      {/* ================= LIST ================= */}
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                <td>{cat.name}</td>
                <td>
                  {cat.created_at
                    ? new Date(cat.created_at).toLocaleDateString()
                    : "-"}
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(cat.id)}
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