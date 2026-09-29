import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import {
  createPromotion,
  deletePromotion,
  getPromotions,
  updatePromotion,
} from "../../api/promotionService";

import { getProducts } from "../../api/productService";

import type {
  CreatePromotionRequest,
  Promotion,
} from "../../types/Promotion";

import type { Product } from "../../types/Product";

const emptyForm: CreatePromotionRequest = {
  productId: 0,
  title: "",
  description: "",
  startsAt: "",
  endsAt: "",
  isActive: true,
  isFeatured: false,
};

function toDateTimeLocal(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (number: number) => String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}

function formatDate(value: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [form, setForm] =
    useState<CreatePromotionRequest>(emptyForm);

  const [editing, setEditing] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);

      const [promotionList, productList] = await Promise.all([
        getPromotions(),
        getProducts(),
      ]);

      setPromotions(promotionList);
      setProducts(productList);
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible cargar promociones",
        text:
          error?.response?.data ||
          "Error de comunicación con el servidor.",
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

    setForm({
      ...emptyForm,
      startsAt: new Date().toISOString().slice(0, 16),
    });
  }

  function startEdit(promotion: Promotion) {
    setEditing(promotion);

    setForm({
      productId: promotion.productId,
      title: promotion.title,
      description: promotion.description ?? "",
      startsAt: toDateTimeLocal(promotion.startsAt),
      endsAt: toDateTimeLocal(promotion.endsAt),
      isActive: promotion.isActive,
      isFeatured: promotion.isFeatured,
    });
  }

  function updateForm(
    changes: Partial<CreatePromotionRequest>
  ) {
    setForm((current) => ({
      ...current,
      ...changes,
    }));
  }

  async function savePromotion(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (
      form.productId <= 0 ||
      !form.title.trim() ||
      !form.startsAt ||
      !form.endsAt
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text:
          "Selecciona un producto, escribe un título y completa las fechas.",
      });

      return;
    }

    if (new Date(form.startsAt) >= new Date(form.endsAt)) {
      await Swal.fire({
        icon: "warning",
        title: "Fechas inválidas",
        text:
          "La fecha de inicio debe ser anterior a la fecha de finalización.",
      });

      return;
    }

    const payload: CreatePromotionRequest = {
      productId: form.productId,
      title: form.title.trim(),
      description:
        form.description?.trim() || null,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
      isActive: form.isActive,
      isFeatured: form.isFeatured,
    };

    try {
      if (editing) {
        await updatePromotion(editing.id, payload);

        await Swal.fire({
          icon: "success",
          title: "Promoción actualizada",
          timer: 1200,
          showConfirmButton: false,
        });
      } else {
        await createPromotion(payload);

        await Swal.fire({
          icon: "success",
          title: "Promoción creada",
          timer: 1200,
          showConfirmButton: false,
        });
      }

      startCreate();
      await load();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible guardar la promoción",
        text:
          error?.response?.data ||
          "Error de servidor.",
      });
    }
  }

  async function handleDelete(
    promotion: Promotion
  ) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Eliminar promoción",
      text: `¿Deseas eliminar "${promotion.title}"?`,
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deletePromotion(promotion.id);
      await load();

      await Swal.fire({
        icon: "success",
        title: "Promoción eliminada",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible eliminar",
        text:
          error?.response?.data ||
          "Error de servidor.",
      });
    }
  }

  async function toggleActive(
    promotion: Promotion
  ) {
    const result = await Swal.fire({
      icon: "question",
      title: promotion.isActive
        ? "Desactivar promoción"
        : "Activar promoción",
      text: promotion.isActive
        ? "La promoción dejará de estar disponible para los clientes."
        : "La promoción podrá mostrarse a los clientes cuando esté dentro de sus fechas.",
      showCancelButton: true,
      confirmButtonText: promotion.isActive
        ? "Desactivar"
        : "Activar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await updatePromotion(promotion.id, {
        productId: promotion.productId,
        title: promotion.title,
        description: promotion.description ?? null,
        startsAt: promotion.startsAt,
        endsAt: promotion.endsAt,
        isActive: !promotion.isActive,
        isFeatured: promotion.isFeatured,
      });

      await load();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible cambiar el estado",
        text:
          error?.response?.data ||
          "Error de servidor.",
      });
    }
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="h3 fw-bold">
            Promociones
          </h1>

          <p className="text-muted mb-0">
            Destaca productos para darles mayor visibilidad en el marketplace.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={startCreate}
          data-bs-toggle="collapse"
          data-bs-target="#promotionForm"
        >
          Nueva promoción
        </button>
      </div>

      <div
        className="collapse show mb-4"
        id="promotionForm"
      >
        <div className="card dashboard-card">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <h2 className="h5 mb-0">
                {editing
                  ? "Editar promoción"
                  : "Nueva promoción"}
              </h2>

              {editing && (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={startCreate}
                >
                  Cancelar edición
                </button>
              )}
            </div>

            <form onSubmit={savePromotion}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Producto
                  </label>

                  <select
                    className="form-select"
                    value={form.productId}
                    onChange={(event) =>
                      updateForm({
                        productId: Number(
                          event.target.value
                        ),
                      })
                    }
                  >
                    <option value={0}>
                      Selecciona un producto
                    </option>

                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name} —{" "}
                        {formatMoney(product.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">
                    Título de la promoción
                  </label>

                  <input
                    className="form-control"
                    value={form.title}
                    onChange={(event) =>
                      updateForm({
                        title: event.target.value,
                      })
                    }
                    placeholder="Ej. Producto destacado de temporada"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">
                    Descripción
                  </label>

                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.description ?? ""}
                    onChange={(event) =>
                      updateForm({
                        description:
                          event.target.value,
                      })
                    }
                    placeholder="Describe brevemente por qué quieres destacar este producto..."
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Precio actual
                  </label>

                  <div className="form-control bg-light">
                    {(() => {
                      const product =
                        products.find(
                          (item) =>
                            item.id ===
                            form.productId
                        );

                      return product
                        ? formatMoney(product.price)
                        : "Ninguno";
                    })()}
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Inicio
                  </label>

                  <input
                    type="datetime-local"
                    className="form-control"
                    value={form.startsAt}
                    onChange={(event) =>
                      updateForm({
                        startsAt:
                          event.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    Finalización
                  </label>

                  <input
                    type="datetime-local"
                    className="form-control"
                    value={form.endsAt}
                    onChange={(event) =>
                      updateForm({
                        endsAt:
                          event.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-md-6">
                  <div className="form-check form-switch mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) =>
                        updateForm({
                          isActive:
                            event.target.checked,
                        })
                      }
                      id="promotionActive"
                    />

                    <label
                      className="form-check-label"
                      htmlFor="promotionActive"
                    >
                      Promoción activa
                    </label>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-check form-switch mt-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(event) =>
                        updateForm({
                          isFeatured:
                            event.target.checked,
                        })
                      }
                      id="promotionFeatured"
                    />

                    <label
                      className="form-check-label"
                      htmlFor="promotionFeatured"
                    >
                      Destacar promoción
                    </label>
                  </div>
                </div>

                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editing
                      ? "Guardar cambios"
                      : "Crear promoción"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="card dashboard-card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 mb-0">
              Promociones registradas
            </h2>

            <span className="badge text-bg-light">
              {promotions.length}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-5 text-muted">
              Cargando promociones...
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <div className="fs-1 mb-2">📢</div>
              <p className="mb-0">
                Todavía no hay promociones registradas.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Promoción</th>
                    <th>Precio</th>
                    <th>Vigencia</th>
                    <th>Estado</th>
                    <th className="text-end">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {promotions.map((promotion) => (
                    <tr key={promotion.id}>
                      <td>
                        <div className="fw-semibold">
                          {promotion.productName}
                        </div>

                        <small className="text-muted">
                          {formatMoney(
                            promotion.productPrice
                          )}
                        </small>
                      </td>

                      <td>
                        <div className="fw-semibold">
                          {promotion.title}
                        </div>

                        {promotion.description && (
                          <small className="text-muted d-block">
                            {promotion.description}
                          </small>
                        )}

                        {promotion.isFeatured && (
                          <span className="badge text-bg-warning mt-1">
                            ⭐ Destacada
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="fw-semibold">
                          {formatMoney(
                            promotion.productPrice
                          )}
                        </div>
                      </td>

                      <td>
                        <small>
                          {formatDate(
                            promotion.startsAt
                          )}
                          <br />
                          {formatDate(
                            promotion.endsAt
                          )}
                        </small>
                      </td>

                      <td>
                        {promotion.isActive ? (
                          <span className="badge text-bg-success">
                            Activa
                          </span>
                        ) : (
                          <span className="badge text-bg-secondary">
                            Inactiva
                          </span>
                        )}
                      </td>

                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() =>
                              startEdit(promotion)
                            }
                            data-bs-toggle="collapse"
                            data-bs-target="#promotionForm"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className={`btn ${
                              promotion.isActive
                                ? "btn-outline-warning"
                                : "btn-outline-success"
                            }`}
                            onClick={() =>
                              toggleActive(
                                promotion
                              )
                            }
                          >
                            {promotion.isActive
                              ? "Desactivar"
                              : "Activar"}
                          </button>

                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() =>
                              handleDelete(
                                promotion
                              )
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
