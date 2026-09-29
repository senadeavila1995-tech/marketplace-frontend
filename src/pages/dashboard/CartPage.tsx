import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
  clearLocalCart,
  getLocalCart,
  removeLocalCartItem,
  updateLocalCartItem,
} from "../../services/localCart";

import { checkout } from "../../api/orderService";

import type { LocalCartItem } from "../../services/localCart";
import type { PaymentMethod } from "../../types/Order";

import { session } from "../../services/session";

export default function CartPage() {
  const navigate = useNavigate();

  const [items, setItems] =
    useState<LocalCartItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH_ON_DELIVERY");

  function load() {
    setLoading(true);

    try {
      setItems(getLocalCart());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateQuantity(
    productId: number,
    quantity: number
  ) {
    if (quantity < 1) {
      return;
    }

    const item = items.find(
      (current) =>
        current.productId === productId
    );

    if (!item) {
      return;
    }

    const safeQuantity = Math.min(
      quantity,
      item.stock
    );

    setItems(
      updateLocalCartItem(
        productId,
        safeQuantity
      )
    );
  }

  function increaseQuantity(
    item: LocalCartItem
  ) {
    updateQuantity(
      item.productId,
      item.quantity + 1
    );
  }

  function decreaseQuantity(
    item: LocalCartItem
  ) {
    if (item.quantity <= 1) {
      return;
    }

    updateQuantity(
      item.productId,
      item.quantity - 1
    );
  }

  function remove(productId: number) {
    setItems(
      removeLocalCartItem(productId)
    );
  }

  function getPaymentLabel(
    method: PaymentMethod
  ) {
    switch (method) {
      case "CASH_ON_DELIVERY":
        return "Contra entrega";

      case "NEQUI":
        return "Nequi";

      case "PAYPAL":
        return "PayPal";

      default:
        return method;
    }
  }

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.total,
        0
      ),
    [items]
  );

  const totalUnits = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ),
    [items]
  );

  const paymentDescription = useMemo(() => {
    switch (paymentMethod) {
      case "CASH_ON_DELIVERY":
        return "El pedido se paga al momento de recibirlo.";

      case "NEQUI":
        return "Método registrado en modo simulado. No se realizará un cobro real.";

      case "PAYPAL":
        return "Método registrado en modo simulado. No se realizará un cobro real.";

      default:
        return "";
    }
  }, [paymentMethod]);

  async function handleCheckout() {
    if (items.length === 0) {
      return;
    }

    if (!session.isAuthenticated()) {
      const result = await Swal.fire({
        icon: "info",
        title: "Inicia sesión para comprar",
        text:
          "Puedes explorar la tienda y preparar tu carrito sin cuenta. Para realizar la compra debes iniciar sesión.",
        showCancelButton: true,
        confirmButtonText: "Iniciar sesión",
        cancelButtonText: "Seguir comprando",
        confirmButtonColor: "#c98791",
      });

      if (result.isConfirmed) {
        navigate(
          "/login?returnTo=/cart"
        );
      }

      return;
    }

    const paymentLabel =
      getPaymentLabel(paymentMethod);

    const result = await Swal.fire({
      icon: "question",
      title: "Confirmar compra",
      html: `
        <div class="text-start">
          <p class="mb-2">
            <strong>${totalUnits}</strong>
            ${totalUnits === 1 ? "unidad" : "unidades"}
            en
            <strong>${items.length}</strong>
            ${items.length === 1 ? "producto" : "productos"}.
          </p>

          <p class="mb-2">
            Método de pago:
            <strong>${paymentLabel}</strong>
          </p>

          <p class="mb-0">
            Total:
            <strong>
              $${total.toLocaleString("es-CO")}
            </strong>
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Confirmar compra",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#c98791",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setProcessing(true);

      const response = await checkout({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod,
      });

      clearLocalCart();
      setItems([]);

      const orderResult =
        await Swal.fire({
          icon: "success",
          title: "Pedido creado",
          html: `
            <p class="mb-2">
              ${response.message}
            </p>

            <p class="mb-2">
              <strong>Pedido #${response.id}</strong>
            </p>

            <p class="mb-2">
              Total:
              <strong>
                $${response.total.toLocaleString("es-CO")}
              </strong>
            </p>

            <p class="mb-0">
              Método:
              <strong>${paymentLabel}</strong>
            </p>
          `,
          showCancelButton: true,
          confirmButtonText: "Ver mis pedidos",
          cancelButtonText: "Seguir comprando",
          confirmButtonColor: "#c98791",
        });

      if (orderResult.isConfirmed) {
        navigate("/my-orders");
      }
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title:
          "No fue posible completar el pedido",
        text:
          error?.response?.data ||
          "Ocurrió un error durante el checkout.",
      });
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="container-fluid beauty-catalog">
      <div className="mb-4">
        <div className="beauty-eyebrow mb-2">
          Compra segura
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-2">
          <div>
            <h1 className="h3 fw-bold mb-1">
              Mi carrito
            </h1>

            <p className="text-muted mb-0">
              Revisa tus productos antes de
              confirmar el pedido.
            </p>
          </div>

          {!loading && items.length > 0 && (
            <div className="small text-muted">
              {totalUnits}{" "}
              {totalUnits === 1
                ? "unidad"
                : "unidades"}{" "}
              · {items.length}{" "}
              {items.length === 1
                ? "producto"
                : "productos"}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
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
            Cargando carrito...
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="beauty-empty">
          <div className="fs-1 mb-2">
            🛒
          </div>

          <h2 className="h5 fw-bold">
            Tu carrito está vacío
          </h2>

          <p className="text-muted mb-3">
            Agrega productos desde nuestra
            tienda para comenzar tu compra.
          </p>

          <button
            type="button"
            className="btn beauty-btn"
            onClick={() =>
              navigate("/shop")
            }
          >
            Explorar productos
          </button>
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card table-card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="p-4 border-bottom">
                  <div className="beauty-eyebrow mb-1">
                    Productos
                  </div>

                  <h2 className="h5 fw-bold mb-0">
                    Artículos seleccionados
                  </h2>
                </div>

                <div className="d-none d-md-block">
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr>
                          <th className="ps-4">
                            Producto
                          </th>
                          <th>Precio</th>
                          <th>Cantidad</th>
                          <th>Total</th>
                          <th className="pe-4"></th>
                        </tr>
                      </thead>

                      <tbody>
                        {items.map(
                          (item) => (
                            <tr
                              key={item.id}
                            >
                              <td className="ps-4">
                                <div className="fw-semibold">
                                  {
                                    item.product
                                  }
                                </div>

                                <div className="small text-muted">
                                  Stock disponible:{" "}
                                  {
                                    item.stock
                                  }
                                </div>
                              </td>

                              <td>
                                $
                                {item.price.toLocaleString(
                                  "es-CO"
                                )}
                              </td>

                              <td>
                                <div
                                  className="d-flex align-items-center gap-2"
                                  style={{
                                    width:
                                      "145px",
                                  }}
                                >
                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm rounded-circle"
                                    style={{
                                      width:
                                        "32px",
                                      height:
                                        "32px",
                                    }}
                                    disabled={
                                      item.quantity <=
                                      1 ||
                                      processing
                                    }
                                    onClick={() =>
                                      decreaseQuantity(
                                        item
                                      )
                                    }
                                    aria-label="Disminuir cantidad"
                                  >
                                    −
                                  </button>

                                  <span
                                    className="text-center fw-semibold"
                                    style={{
                                      minWidth:
                                        "30px",
                                    }}
                                  >
                                    {
                                      item.quantity
                                    }
                                  </span>

                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm rounded-circle"
                                    style={{
                                      width:
                                        "32px",
                                      height:
                                        "32px",
                                    }}
                                    disabled={
                                      item.quantity >=
                                        item.stock ||
                                      processing
                                    }
                                    onClick={() =>
                                      increaseQuantity(
                                        item
                                      )
                                    }
                                    aria-label="Aumentar cantidad"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              <td className="fw-semibold">
                                $
                                {item.total.toLocaleString(
                                  "es-CO"
                                )}
                              </td>

                              <td className="text-end pe-4">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  disabled={
                                    processing
                                  }
                                  onClick={() =>
                                    remove(
                                      item.productId
                                    )
                                  }
                                >
                                  Eliminar
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="d-md-none">
                  {items.map(
                    (item) => (
                      <div
                        key={item.id}
                        className="p-4 border-bottom"
                      >
                        <div className="d-flex justify-content-between gap-3">
                          <div>
                            <div className="fw-semibold mb-1">
                              {
                                item.product
                              }
                            </div>

                            <div className="small text-muted">
                              $
                              {item.price.toLocaleString(
                                "es-CO"
                              )}{" "}
                              por unidad
                            </div>
                          </div>

                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            disabled={
                              processing
                            }
                            onClick={() =>
                              remove(
                                item.productId
                              )
                            }
                          >
                            Eliminar
                          </button>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div className="small text-muted">
                            Stock:{" "}
                            {item.stock}
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm rounded-circle"
                              style={{
                                width:
                                  "34px",
                                height:
                                  "34px",
                              }}
                              disabled={
                                item.quantity <=
                                  1 ||
                                processing
                              }
                              onClick={() =>
                                decreaseQuantity(
                                  item
                                )
                              }
                            >
                              −
                            </button>

                            <span
                              className="fw-semibold text-center"
                              style={{
                                minWidth:
                                  "30px",
                              }}
                            >
                              {
                                item.quantity
                              }
                            </span>

                            <button
                              type="button"
                              className="btn btn-outline-secondary btn-sm rounded-circle"
                              style={{
                                width:
                                  "34px",
                                height:
                                  "34px",
                              }}
                              disabled={
                                item.quantity >=
                                  item.stock ||
                                processing
                              }
                              onClick={() =>
                                increaseQuantity(
                                  item
                                )
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="text-end mt-3">
                          <span className="fw-bold product-price">
                            $
                            {item.total.toLocaleString(
                              "es-CO"
                            )}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card dashboard-card border-0 shadow-sm sticky-lg-top">
              <div className="card-body p-4">
                <div className="beauty-eyebrow mb-2">
                  Checkout
                </div>

                <h2 className="h5 fw-bold mb-4">
                  Resumen de compra
                </h2>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">
                    Productos
                  </span>

                  <span>
                    {items.length}
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">
                    Unidades
                  </span>

                  <span>
                    {totalUnits}
                  </span>
                </div>

                <hr />

                <div className="mb-3">
                  <label
                    htmlFor="paymentMethod"
                    className="form-label fw-semibold"
                  >
                    Método de pago
                  </label>

                  <select
                    id="paymentMethod"
                    className="form-select"
                    value={
                      paymentMethod
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target
                          .value as PaymentMethod
                      )
                    }
                    disabled={
                      processing
                    }
                  >
                    <option value="CASH_ON_DELIVERY">
                      Contra entrega
                    </option>

                    <option value="NEQUI">
                      Nequi
                    </option>

                    <option value="PAYPAL">
                      PayPal
                    </option>
                  </select>
                </div>

                <div
                  className="rounded-3 p-3 small mb-4"
                  style={{
                    background:
                      "#fff7f8",
                    border:
                      "1px solid #eadcdf",
                    color: "#6f5a5f",
                  }}
                >
                  {paymentDescription}
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-semibold">
                    Total
                  </span>

                  <span className="product-price fs-4 fw-bold">
                    $
                    {total.toLocaleString(
                      "es-CO"
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn beauty-btn w-100"
                  disabled={processing}
                  onClick={
                    handleCheckout
                  }
                >
                  {processing
                    ? "Procesando..."
                    : session.isAuthenticated()
                      ? "Confirmar compra"
                      : "Iniciar sesión para comprar"}
                </button>

                <button
                  type="button"
                  className="btn btn-link w-100 mt-2 text-decoration-none"
                  disabled={processing}
                  onClick={() =>
                    navigate("/shop")
                  }
                >
                  Seguir comprando
                </button>

                <small className="text-muted d-block mt-2 text-center">
                  Puedes preparar tu carrito
                  sin cuenta. Para crear el
                  pedido debes iniciar sesión.
                </small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
