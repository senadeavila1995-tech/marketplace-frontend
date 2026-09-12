import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { getProducts } from "../../api/productService";
import { getCategories } from "../../api/categoryService";
import { addLocalCartItem } from "../../services/localCart";
import type { Product } from "../../types/Product";
import type { Category } from "../../types/Category";

export default function CustomerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);

      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No pudimos cargar el catálogo",
        text:
          error?.response?.data ||
          "No fue posible consultar los productos y categorías.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "Todas") {
      return products;
    }

    return products.filter(
      (product) =>
        product.category?.toLowerCase() ===
        selectedCategory.toLowerCase()
    );
  }, [products, selectedCategory]);

  async function add(product: Product) {
    if (!product.status || product.stock <= 0) {
      await Swal.fire({
        icon: "warning",
        title: "Producto no disponible",
        text: "Este producto no tiene unidades disponibles.",
      });
      return;
    }

    try {
      addLocalCartItem(product, 1);

      await Swal.fire({
        icon: "success",
        title: "Agregado al carrito",
        text: `${product.name} fue agregado correctamente.`,
        timer: 1200,
        showConfirmButton: false,
      });
    } catch {
      await Swal.fire({
        icon: "error",
        title: "No fue posible agregar",
        text: "Ocurrió un error al agregar el producto.",
      });
    }
  }

  return (
    <div className="container-fluid beauty-catalog">

      <section className="beauty-hero mb-4 mb-lg-5">
        <div className="position-relative" style={{ zIndex: 1 }}>
          <div className="beauty-eyebrow mb-2">
            Cuidado · Belleza · Bienestar
          </div>

          <h1 className="beauty-hero-title mb-3">
            Todo lo que necesitas para cuidar de ti.
          </h1>

          <p className="beauty-hero-text mb-0">
            Descubre productos seleccionados para el cuidado
            personal y encuentra todo en un solo lugar.
          </p>
        </div>
      </section>

      <section className="mb-4">
        <div className="beauty-section-title fs-5 mb-1">
          Explora por categoría
        </div>

        <div className="beauty-section-subtitle small mb-3">
          Encuentra productos según tus necesidades.
        </div>

        <div className="d-flex flex-wrap gap-2">

          <button
            type="button"
            className={`beauty-category-pill border-0 ${
              selectedCategory === "Todas" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("Todas")}
          >
            Todas
          </button>

          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              className={`beauty-category-pill border-0 ${
                selectedCategory === category.name ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.name}
            </button>
          ))}

        </div>
      </section>

      <section>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">

          <div>
            <div className="beauty-eyebrow mb-1">
              Nuestra colección
            </div>

            <h2 className="beauty-section-title h3 mb-1">
              Productos destacados
            </h2>

            <p className="beauty-section-subtitle mb-0">
              {selectedCategory === "Todas"
                ? "Elige tus favoritos y agrégalos a tu carrito."
                : `Productos de la categoría "${selectedCategory}".`}
            </p>
          </div>

          {!loading && (
            <span className="small text-muted mt-3 mt-md-0">
              {filteredProducts.length} productos
            </span>
          )}

        </div>

        {loading ? (
          <div className="beauty-loading text-center py-5">

            <div
              className="spinner-border"
              role="status"
              style={{ color: "#c98791" }}
            >
              <span className="visually-hidden">
                Cargando...
              </span>
            </div>

            <div className="mt-3">
              Preparando nuestro catálogo...
            </div>

          </div>
        ) : filteredProducts.length === 0 ? (

          <div className="beauty-empty">

            <div className="fs-1 mb-2">
              ✦
            </div>

            <h3 className="h5 fw-bold">
              No hay productos en esta categoría
            </h3>

            <p className="mb-0">
              Prueba con otra categoría o revisa todos los productos.
            </p>

          </div>

        ) : (

          <div className="row g-4">

            {filteredProducts.map((product) => (

              <div
                className="col-sm-6 col-lg-4 col-xl-3"
                key={product.id}
              >

                <div className="card product-card h-100">

                  {product.imageUrl ? (

                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-image"
                    />

                  ) : (

                    <div className="product-image d-flex align-items-center justify-content-center">

                      <div className="text-center text-muted">

                        <div className="fs-1 mb-2">
                          ✦
                        </div>

                        <small>
                          Imagen próximamente
                        </small>

                      </div>

                    </div>

                  )}

                  <div className="card-body d-flex flex-column p-4">

                    <div className="product-category mb-2">
                      {product.category || "Sin categoría"}
                    </div>

                    <h2 className="product-title h5 mb-2">
                      {product.name}
                    </h2>

                    <p className="product-description small flex-grow-1 mb-3">
                      {product.description ||
                        "Producto seleccionado para tu rutina de cuidado personal."}
                    </p>

                    <div className="beauty-store mb-2">
                      {product.store || "Tienda"}
                    </div>

                    <div className="product-price fs-4 mb-3">
                      ${product.price.toLocaleString("es-CO")}
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">

                      <span className="beauty-stock">
                        {product.stock > 0
                          ? `${product.stock} disponibles`
                          : "Sin stock"}
                      </span>

                      <span className="beauty-badge">
                        {product.status && product.stock > 0
                          ? "Disponible"
                          : "Agotado"}
                      </span>

                    </div>

                    <button
                      className="btn beauty-btn w-100"
                      disabled={
                        !product.status ||
                        product.stock <= 0
                      }
                      onClick={() => add(product)}
                    >
                      Agregar al carrito
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </div>
  );
}
