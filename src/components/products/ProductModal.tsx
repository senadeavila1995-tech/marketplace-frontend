import { useEffect, useState } from "react";
import type { Product } from "../../types/Product";

interface Category {
  id: number;
  name: string;
}

interface Props {
  show: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  editing?: Product | null;
  categories: Category[]; // 🔥 IMPORTANTE
}

export default function ProductModal({
  show,
  onClose,
  onSave,
  editing,
  categories,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    storeId: 1,
    categoryId: "", // 🔥 CORRECTO (NO category_id)
    imageUrl: "",
  });

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || "",
        description: editing.description || "",
        price: editing.price || 0,
        stock: editing.stock || 0,
        storeId: editing.storeId || 1,
        categoryId: editing.categoryId?.toString() || "",
        imageUrl: editing.imageUrl || "",
      });
    } else {
      setForm({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        storeId: 1,
        categoryId: "",
        imageUrl: "",
      });
    }
  }, [editing, show]);

  if (!show) return null;

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "price" ||
        name === "stock" ||
        name === "storeId" ||
        name === "categoryId"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.description) {
      alert("Nombre y descripción son obligatorios");
      return;
    }

    if (!form.categoryId) {
      alert("Debes seleccionar una categoría");
      return;
    }

    onSave({
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      storeId: Number(form.storeId),
      categoryId: Number(form.categoryId), // 🔥 BACKEND EXPECTS THIS
    });
  };

  return (
    <div className="modal d-block bg-dark bg-opacity-50">
      <div className="modal-dialog">
        <div className="modal-content p-3">

          <h5>{editing ? "Editar Producto" : "Nuevo Producto"}</h5>

          <input
            name="name"
            placeholder="Nombre"
            className="form-control my-2"
            value={form.name}
            onChange={handleChange}
          />

          <select
            name="categoryId"
            className="form-control my-2"
            value={form.categoryId}
            onChange={handleChange}
          >
            <option value="">Selecciona categoría</option>

            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            name="description"
            placeholder="Descripción"
            className="form-control my-2"
            value={form.description}
            onChange={handleChange}
          />

          <input
            name="price"
            type="number"
            placeholder="Precio"
            className="form-control my-2"
            value={form.price}
            onChange={handleChange}
          />

          <input
            name="stock"
            type="number"
            placeholder="Stock"
            className="form-control my-2"
            value={form.stock}
            onChange={handleChange}
          />

          <input
            name="imageUrl"
            placeholder="Imagen URL"
            className="form-control my-2"
            value={form.imageUrl}
            onChange={handleChange}
          />

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>

            <button className="btn btn-primary" onClick={handleSubmit}>
              Guardar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}