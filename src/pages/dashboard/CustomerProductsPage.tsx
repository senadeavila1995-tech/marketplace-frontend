import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import { getProducts } from "../../api/productService";
import { getCategories } from "../../api/categoryService";
import { getActivePromotions } from "../../api/promotionService";

import { addLocalCartItem } from "../../services/localCart";

import type { Product } from "../../types/Product";
import type { Category } from "../../types/Category";
import type { Promotion } from "../../types/Promotion";

import {
  subscribeToPromotionNotifications,
  sendPromotionHeartbeat,
} from "../../api/pushNotificationService";

export default function CustomerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  const [selectedCategory, setSelectedCategory] =
    useState<string>("Todas");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] = useState(true);

  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | "unsupported">(
      typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "unsupported"
    );

  async function requestPromotionNotifications() {
    if (!("Notification" in window)) {
      setNotificationPermission("unsupported");

      await Swal.fire({
        icon: "info",
        title: "Notificaciones no disponibles",
        text: "Tu navegador no permite notificaciones.",
      });

      return;
    }

    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      await Swal.fire({
        icon: "info",
        title: "Push no disponible",
        text: "Tu navegador no soporta notificaciones Push.",
      });

      return;
    }

    try {
      let permission = Notification.permission;

      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      setNotificationPermission(permission);

      if (permission === "denied") {
        await Swal.fire({
          icon: "warning",
          title: "Notificaciones bloqueadas",
          text:
            "Debes permitir las notificaciones desde la configuración del navegador.",
        });

        return;
      }

      if (permission !== "granted") {
        return;
      }

      await subscribeToPromotionNotifications();

      await Swal.fire({
        icon: "success",
        title: "Promociones activadas",
        text:
          "Recibirás notificaciones cuando publiquemos productos promocionados.",
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(
        "Error al activar las notificaciones Push:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "No fue posible registrar las notificaciones Push.";

      await Swal.fire({
        icon: "error",
        title: "No se pudieron activar",
        text: message,
      });
    }
  }

  async function load() {
    try {
      setLoading(true);

      const [
        productsData,
        categoriesData,
        promotionsData,
      ] = await Promise.all([
        getProducts(),
        getCategories(),
        getActivePromotions(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setPromotions(promotionsData);
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No pudimos cargar el catálogo",
        text:
          error?.response?.data ||
          "No fue posible consultar los productos, categorías y promociones.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    let heartbeatInterval: number | undefined;

    const sendHeartbeat = async () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      try {
        await sendPromotionHeartbeat();
      } catch (error) {
        console.error(
          "Error actualizando actividad del cliente:",
          error
        );
      }
    };

    sendHeartbeat();

    heartbeatInterval = window.setInterval(
      sendHeartbeat,
      60 * 1000
    );

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      if (heartbeatInterval !== undefined) {
        window.clearInterval(heartbeatInterval);
      }

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const productIdParam = params.get("productId");

    if (!productIdParam || products.length === 0) {
      return;
    }

    const productId = Number(productIdParam);

    if (!Number.isInteger(productId)) {
      return;
    }

    const product = products.find(
      (item) => item.id === productId
    );

    if (!product) {
      console.warn(
        `No se encontró el producto promocionado con ID ${productId}`
      );
      return;
    }

    setSelectedProduct(product);

    const cleanUrl =
      window.location.pathname +
      window.location.hash;

    window.history.replaceState(
      {},
      document.title,
      cleanUrl
    );
  }, [products]);

  const matchesFilters = (product: Product) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesCategory =
      selectedCategory === "Todas" ||
      product.category?.toLowerCase() ===
        selectedCategory.toLowerCase();

    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search) ||
      product.store?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      matchesFilters(product)
    );
  }, [
    products,
    selectedCategory,
    searchTerm,
  ]);

  const visibleProductCount =
    filteredProducts.length;

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
        text:
          `${product.name} fue agregado correctamente.`,
        timer: 1200,
        showConfirmButton: false,
      });
    } catch {
      await Swal.fire({
        icon: "error",
        title: "No fue posible agregar",
        text:
          "Ocurrió un error al agregar el producto.",
      });
    }
  }

  function renderProductCard(
    product: Product,
    promotion?: Promotion
  ) {
    return (
      <div
        className="col-sm-6 col-lg-4 col-xl-3"
        key={product.id}
      >
        <div
          className="card product-card h-100 position-relative"
          role="button"
          tabIndex={0}
          onClick={() =>
            setSelectedProduct(product)
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter" ||
              event.key === " "
            ) {
              event.preventDefault();
              setSelectedProduct(product);
            }
          }}
        >
          {promotion && (
            <div
              className="position-absolute top-0 start-0 m-3 px-3 py-1 rounded-pill fw-semibold small beauty-promo-badge"
              style={{
                background: "#9f6570",
                color: "#ffffff",
                zIndex: 2,
                boxShadow:
                  "0 4px 12px rgba(120, 80, 90, 0.18)",
              }}
            >
              🔥 PROMOCIONADO
            </div>
          )}

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
              {product.category ||
                "Sin categoría"}
            </div>

            <h2 className="product-title h5 mb-2">
              {product.name}
            </h2>

            {promotion && (
              <div
                className="small fw-semibold mb-2"
                style={{
                  color: "#9f6570",
                }}
              >
                {promotion.title}
              </div>
            )}

            <p className="product-description small flex-grow-1 mb-3">
              {promotion?.description ||
                product.description ||
                "Producto seleccionado para tu rutina de cuidado personal."}
            </p>

            <div className="beauty-store mb-2">
              {product.store || "Tienda"}
            </div>

            <div className="product-price fs-4 mb-3">
              ${product.price.toLocaleString(
                "es-CO"
              )}
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="beauty-stock">
                {product.stock > 0
                  ? `${product.stock} disponibles`
                  : "Sin stock"}
              </span>

              <span className="beauty-badge">
                {product.status &&
                product.stock > 0
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
              onClick={(event) => {
                event.stopPropagation();
                add(product);
              }}
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="catalogo" className="container-fluid beauty-catalog">
      <section className="beauty-hero mb-4 mb-lg-5">
        <div
          className="position-relative d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-4"
          style={{ zIndex: 1 }}
        >
          <div>
            <div className="beauty-eyebrow mb-2">
              Cuidado · Belleza · Bienestar
            </div>

            <h1 className="beauty-hero-title mb-3">
              Todo lo que necesitas para cuidar de ti.
            </h1>

            <p className="beauty-hero-text mb-0">
              Descubre productos seleccionados para
              el cuidado personal y encuentra todo
              en un solo lugar.
            </p>
          </div>

          <div className="flex-shrink-0">
            <button
              type="button"
              className="btn rounded-pill px-4 py-2 fw-semibold"
              onClick={
                requestPromotionNotifications
              }
              disabled={
                notificationPermission ===
                "unsupported"
              }
              style={{
                background:
                  notificationPermission ===
                  "granted"
                    ? "#f4e7e9"
                    : "#ffffff",
                color: "#9f6570",
                border:
                  "1px solid #eadcdf",
                boxShadow:
                  "0 4px 14px rgba(120, 80, 90, 0.08)",
              }}
            >
              {notificationPermission ===
              "granted"
                ? "✓ Promociones activadas"
                : "🔔 Recibir promociones"}
            </button>
          </div>
        </div>
      </section>

      <section className="mb-4">
        <div className="beauty-section-title fs-5 mb-1">
          Explora por categoría
        </div>

        <div className="beauty-section-subtitle small mb-3">
          Encuentra productos según tus
          necesidades.
        </div>

        <div className="beauty-category-list d-flex flex-wrap gap-2 justify-content-center">
          <button
            type="button"
            className={`beauty-category-pill border-0 ${
              selectedCategory === "Todas"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setSelectedCategory("Todas")
            }
          >
            Todas
          </button>

          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              className={`beauty-category-pill border-0 ${
                selectedCategory ===
                category.name
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSelectedCategory(
                  category.name
                )
              }
            >
              {category.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <div className="row align-items-end g-3">
            <div className="col-12 col-lg">
              <div className="beauty-eyebrow mb-1">
                Nuestra colección
              </div>

              <h2 className="beauty-section-title h3 mb-1">
                Catálogo de productos
              </h2>

              <p className="beauty-section-subtitle mb-0">
                {selectedCategory ===
                "Todas"
                  ? "Explora productos destacados y encuentra tus favoritos."
                  : `Productos de la categoría "${selectedCategory}".`}
              </p>
            </div>

            <div className="col-12 col-lg-auto">
              <div
                className="beauty-search-box position-relative"
                style={{
                  width: "100%",
                  maxWidth: "360px",
                  minWidth: "280px",
                }}
              >
                <span
                  className="beauty-search-icon position-absolute top-50 translate-middle-y text-muted"
                  style={{
                    left: "16px",
                    pointerEvents: "none",
                    fontSize: "0.95rem",
                  }}
                >
                  🔎
                </span>

                <input
                  type="search"
                  className="form-control beauty-search-input rounded-pill ps-5 pe-4"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  aria-label="Buscar productos"
                  style={{
                    height: "44px",
                    borderColor: "#eadcdf",
                    background: "#fffafb",
                  }}
                />

                {!loading && (
                  <div className="beauty-search-meta text-end small mt-2">
                    {visibleProductCount}{" "}
                    {visibleProductCount === 1
                      ? "producto"
                      : "productos"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="beauty-loading text-center py-5">
            <div
              className="spinner-border"
              role="status"
              style={{
                color: "#c98791",
              }}
            >
              <span className="visually-hidden">
                Cargando...
              </span>
            </div>

            <div className="mt-3">
              Preparando nuestro catálogo...
            </div>
          </div>
        ) : visibleProductCount === 0 ? (
          <div className="beauty-empty">
            <div className="fs-1 mb-2">
              ✦
            </div>

            <h3 className="h5 fw-bold">
              No encontramos productos
            </h3>

            <p className="mb-0">
              Prueba con otra búsqueda o
              selecciona otra categoría.
            </p>
          </div>
        ) : (
          <>
            {filteredProducts.length > 0 && (
              <section>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-2 mb-3">
                  <div>
                    <div className="beauty-eyebrow mb-1">
                      Catálogo
                    </div>

                    <h2 className="beauty-section-title h4 mb-1">
                      Todos los productos
                    </h2>

                    <p className="beauty-section-subtitle mb-0">
                      {selectedCategory ===
                      "Todas"
                        ? "Compra directamente desde nuestro catálogo."
                        : `Productos disponibles en "${selectedCategory}".`}
                    </p>
                  </div>

                  <span className="small text-muted">
                    {filteredProducts.length}{" "}
                    disponibles
                  </span>
                </div>

                <div className="row g-4">
                  {filteredProducts.map(
                    (product) =>
                      renderProductCard(
                        product,
                        promotions.find(
                          (promotion) =>
                            promotion.productId ===
                            product.id
                        )
                      )
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </section>

      {selectedProduct && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          onClick={() =>
            setSelectedProduct(null)
          }
          style={{
            backgroundColor:
              "rgba(0, 0, 0, 0.55)",
            zIndex: 1050,
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-content border-0 shadow-lg overflow-hidden">
              {(() => {
                const promotion =
                  promotions.find(
                    (item) =>
                      item.productId ===
                      selectedProduct.id
                  );

                return (
                  <>
                    <div className="modal-header border-0">
                      <div>
                        {promotion && (
                          <div
                            className="d-inline-block px-3 py-1 rounded-pill fw-semibold small mb-2"
                            style={{
                              background:
                                "#f4e7e9",
                              color:
                                "#9f6570",
                            }}
                          >
                            🔥 Producto
                            promocionado
                          </div>
                        )}

                        <div className="product-category mb-1">
                          {selectedProduct.category ||
                            "Sin categoría"}
                        </div>

                        <h2 className="modal-title h4 mb-0">
                          {
                            selectedProduct.name
                          }
                        </h2>
                      </div>

                      <button
                        type="button"
                        className="btn-close"
                        aria-label="Cerrar"
                        onClick={() =>
                          setSelectedProduct(
                            null
                          )
                        }
                      />
                    </div>

                    <div className="modal-body p-4">
                      <div className="row g-4 align-items-center">
                        <div className="col-md-6">
                          {selectedProduct.imageUrl ? (
                            <img
                              src={
                                selectedProduct.imageUrl
                              }
                              alt={
                                selectedProduct.name
                              }
                              className="img-fluid rounded w-100"
                              style={{
                                maxHeight:
                                  "420px",
                                objectFit:
                                  "cover",
                              }}
                            />
                          ) : (
                            <div
                              className="d-flex align-items-center justify-content-center rounded"
                              style={{
                                minHeight:
                                  "320px",
                                background:
                                  "#f8f3f4",
                              }}
                            >
                              <div className="text-center text-muted">
                                <div className="fs-1 mb-2">
                                  ✦
                                </div>

                                <div>
                                  Imagen
                                  próximamente
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="col-md-6">
                          <div className="beauty-store mb-2">
                            {selectedProduct.store ||
                              "Tienda"}
                          </div>

                          {promotion && (
                            <div
                              className="rounded-3 p-3 mb-3"
                              style={{
                                background:
                                  "#fff7f8",
                                border:
                                  "1px solid #eadcdf",
                              }}
                            >
                              <div
                                className="fw-semibold mb-1"
                                style={{
                                  color:
                                    "#9f6570",
                                }}
                              >
                                {promotion.title}
                              </div>

                              {promotion.description && (
                                <div className="small text-muted">
                                  {
                                    promotion.description
                                  }
                                </div>
                              )}
                            </div>
                          )}

                          <div className="product-price fs-3 mb-3">
                            $
                            {selectedProduct.price.toLocaleString(
                              "es-CO"
                            )}
                          </div>

                          <p className="text-muted mb-4">
                            {selectedProduct.description ||
                              "Producto seleccionado para tu rutina de cuidado personal."}
                          </p>

                          <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="beauty-stock">
                              {selectedProduct.stock >
                              0
                                ? `${selectedProduct.stock} disponibles`
                                : "Sin stock"}
                            </span>

                            <span className="beauty-badge">
                              {selectedProduct.status &&
                              selectedProduct.stock >
                                0
                                ? "Disponible"
                                : "Agotado"}
                            </span>
                          </div>

                          <button
                            className="btn beauty-btn w-100"
                            disabled={
                              !selectedProduct.status ||
                              selectedProduct.stock <=
                                0
                            }
                            onClick={() =>
                              add(
                                selectedProduct
                              )
                            }
                          >
                            Agregar al carrito
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
