import { useEffect, useState } from "react";
import type { Product } from "../../types/Product";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/productService";

import { getCategories } from "../../api/categoryService";

import ProductTable from "../../components/products/ProductTable";
import ProductModal from "../../components/products/ProductModal";

import { toBackendProduct } from "../../mappers/productMapper";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD PRODUCTS
  // =========================
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD CATEGORIES
  // =========================
  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // =========================
  // SAVE PRODUCT
  // =========================
  const handleSave = async (data: any) => {
    try {
      const payload = toBackendProduct(data);

      console.log("📦 PAYLOAD ENVIADO:", payload);

      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
      }

      setShow(false);
      setEditing(null);
      await loadProducts();
    } catch (error: any) {
      console.error("❌ ERROR:", error?.response?.data);
    }
  };

  // =========================
  // DELETE PRODUCT
  // =========================
  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h2>Productos</h2>

        <button
          className="btn btn-success"
          onClick={() => {
            setEditing(null);
            setShow(true);
          }}
        >
          Nuevo
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <ProductTable
          products={products}
          onEdit={(p) => {
            setEditing(p);
            setShow(true);
          }}
          onDelete={handleDelete}
        />
      )}

      <ProductModal
        show={show}
        onClose={() => {
          setShow(false);
          setEditing(null);
        }}
        onSave={handleSave}
        editing={editing}
        categories={categories}
      />
    </div>
  );
}