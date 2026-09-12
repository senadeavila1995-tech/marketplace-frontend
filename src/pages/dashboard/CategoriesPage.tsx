import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../api/categoryService";
import type { Category } from "../../types/Category";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      setCategories(await getCategories());
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data || "No se pudieron cargar categorías.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!name.trim()) {
      return;
    }

    try {
      if (editing) {
        await updateCategory(editing.id, {
          name: name.trim(),
        });
      } else {
        await createCategory({
          name: name.trim(),
        });
      }

      setName("");
      setEditing(null);
      await load();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible guardar",
        text: error?.response?.data || "Error del servidor.",
      });
    }
  }

  async function remove(category: Category) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar categoría",
      text: `¿Eliminar "${category.name}"?`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deleteCategory(category.id);
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
        <h1 className="h3 fw-bold">Categorías</h1>
        <p className="text-muted">
          Administra las categorías de productos.
        </p>
      </div>

      <div className="card dashboard-card mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-8">
              <input
                className="form-control"
                placeholder="Nombre de categoría"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="col-md-4 d-flex gap-2">
              <button
                className="btn btn-primary flex-grow-1"
                onClick={save}
              >
                {editing ? "Actualizar" : "Crear"}
              </button>

              {editing && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setEditing(null);
                    setName("");
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="card-body">
          {loading ? (
            <div className="py-5 text-center">
              Cargando...
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Creada</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td>{category.id}</td>
                      <td>{category.name}</td>

                      <td>
                        {category.createdAt
                          ? new Date(
                              category.createdAt
                            ).toLocaleDateString("es-CO")
                          : "-"}
                      </td>

                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => {
                              setEditing(category);
                              setName(category.name);
                            }}
                          >
                            Editar
                          </button>

                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => remove(category)}
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
