import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../../api/productService";
import { getCategories } from "../../api/categoryService";
import type { Category } from "../../types/Category";
import type {
  CreateProductRequest,
  Product,
  UpdateProductRequest,
} from "../../types/Product";
import { session } from "../../services/session";

const emptyForm: CreateProductRequest = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  imageUrl: "",
  categoryId: 0,
};

export default function ProductsPage() {
  const role = session.getRole();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CreateProductRequest>(emptyForm);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);

      const [productList, categoryList] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      setProducts(productList);
      setCategories(categoryList);
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible cargar productos",
        text: error?.response?.data || "Error de comunicación.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
  }

  function startEdit(product: Product) {
    setEditing(product);

    const categoryId =
      Number((product as Product & { categoryId?: number }).categoryId) ||
      categories.find((category) => category.name === product.category)?.id ||
      0;

    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl ?? "",
      categoryId,
    });
  }

  async function saveProduct(event: React.FormEvent) {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      form.price <= 0 ||
      form.stock < 0 ||
      form.categoryId <= 0
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text: "Completa nombre, descripción, precio, stock y categoría.",
      });
      return;
    }

    try {
      if (editing) {
        const payload: UpdateProductRequest = {
          ...form,
          name: form.name.trim(),
          description: form.description.trim(),
        };

        await updateProduct(editing.id, payload);

        await Swal.fire({
          icon: "success",
          title: "Producto actualizado",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        await createProduct({
          ...form,
          name: form.name.trim(),
          description: form.description.trim(),
        });

        await Swal.fire({
          icon: "success",
          title: "Producto creado",
          timer: 1200,
          showConfirmButton: false,
        });
      }

      startCreate();
      await load();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible guardar el producto",
        text: error?.response?.data || "Error de servidor.",
      });
    }
  }

  async function handleDelete(product: Product) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar producto",
      text: `¿Deseas eliminar "${product.name}"?`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deleteProduct(product.id);
      await load();

      await Swal.fire({
        icon: "success",
        title: "Producto eliminado",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible eliminar",
        text: error?.response?.data || "Error de servidor.",
      });
    }
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="h3 fw-bold">
            {role === "SELLER" ? "Mis productos" : "Productos"}
          </h1>
          <p className="text-muted mb-0">
            Administra el catálogo del marketplace.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={startCreate}
          data-bs-toggle="collapse"
          data-bs-target="#productForm"
        >
          Nuevo producto
        </button>
      </div>

      <div className="collapse show mb-4" id="productForm">
        <div className="card dashboard-card">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <h2 className="h5 mb-0">
                {editing ? "Editar producto" : "Nuevo producto"}
              </h2>

              {editing && (
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={startCreate}
                >
                  Cancelar edición
                </button>
              )}
            </div>

            <form onSubmit={saveProduct}>
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
                  <label className="form-label">Categoría</label>
                  <select
                    className="form-select"
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        categoryId: Number(e.target.value),
                      })
                    }
                  >
                    <option value={0}>
                      Selecciona una categoría
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label">
                    Descripción
                  </label>

                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Precio</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stock: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    URL de imagen
                  </label>
                  <input
                    className="form-control"
                    value={form.imageUrl ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        imageUrl: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <button className="btn btn-success mt-4">
                {editing ? "Guardar cambios" : "Crear producto"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              Cargando productos...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5 text-muted">
              No hay productos registrados.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>

                      <td>
                        <div className="fw-semibold">
                          {product.name}
                        </div>
                        <small className="text-muted">
                          {product.store}
                        </small>
                      </td>

                      <td>{product.category}</td>

                      <td>
                        ${product.price.toLocaleString("es-CO")}
                      </td>

                      <td>{product.stock}</td>

                      <td>
                        <span
                          className={`badge ${
                            product.status
                              ? "text-bg-success"
                              : "text-bg-secondary"
                          }`}
                        >
                          {product.status
                            ? "Disponible"
                            : "Inactivo"}
                        </span>
                      </td>

                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => startEdit(product)}
                          >
                            Editar
                          </button>

                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() =>
                              handleDelete(product)
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
