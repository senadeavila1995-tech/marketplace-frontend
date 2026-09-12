import { useEffect, useState } from "react";
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

  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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

    setItems(
      updateLocalCartItem(productId, quantity)
    );
  }

  function remove(productId: number) {
    setItems(
      removeLocalCartItem(productId)
    );
  }

  function getPaymentLabel(method: PaymentMethod) {
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
        navigate("/login?returnTo=/cart");
      }

      return;
    }

    const paymentLabel = getPaymentLabel(paymentMethod);

    const result = await Swal.fire({
      icon: "question",
      title: "Confirmar compra",
      html: `
        <p class="mb-2">
          Se creará el pedido y se descontará el stock.
        </p>

        <p class="mb-2">
          Método de pago:
          <strong>${paymentLabel}</strong>
        </p>

        <p class="mb-0">
          Total:
          <strong>$${total.toLocaleString("es-CO")}</strong>
        </p>
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

      await Swal.fire({
        icon: "success",
        title: "Pedido creado",
        html: `
          <p>${response.message}</p>

          <p>
            <strong>Pedido #${response.id}</strong>
          </p>

          <p>
            Total:
            <strong>
              $${response.total.toLocaleString("es-CO")}
            </strong>
          </p>

          <p>
            Método:
            <strong>${paymentLabel}</strong>
          </p>
        `,
        confirmButtonColor: "#c98791",
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible completar el pedido",
        text:
          error?.response?.data ||
          "Ocurrió un error durante el checkout.",
      });
    } finally {
      setProcessing(false);
    }
  }

  const total = items.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return (
    <div className="container-fluid">

      <div className="mb-4">
        <div className="beauty-eyebrow mb-2">
          Compra segura
        </div>

        <h1 className="h3 fw-bold">
          Mi carrito
        </h1>

        <p className="text-muted">
          Puedes preparar tu carrito sin iniciar sesión.
          Para comprar necesitarás una cuenta.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          Cargando carrito...
        </div>
      ) : items.length === 0 ? (
        <div className="beauty-empty">

          <div className="fs-1 mb-2">
            ✦
          </div>

          <h2 className="h5 fw-bold">
            Tu carrito está vacío
          </h2>

          <p className="text-muted mb-3">
            Agrega productos desde nuestra tienda.
          </p>

          <button
            type="button"
            className="btn beauty-btn"
            onClick={() => navigate("/shop")}
          >
            Explorar productos
          </button>

        </div>
      ) : (
        <div className="row g-4">

          <div className="col-lg-8">

            <div className="card table-card">

              <div className="card-body">

                <div className="table-responsive">

                  <table className="table align-middle mb-0">

                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>

                    <tbody>

                      {items.map((item) => (
                        <tr key={item.id}>

                          <td className="fw-semibold">
                            {item.product}
                          </td>

                          <td>
                            ${item.price.toLocaleString("es-CO")}
                          </td>

                          <td>
                            <input
                              type="number"
                              min={1}
                              max={item.stock}
                              className="form-control"
                              style={{ width: 90 }}
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.productId,
                                  Number(e.target.value)
                                )
                              }
                            />
                          </td>

                          <td>
                            ${item.total.toLocaleString("es-CO")}
                          </td>

                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() =>
                                remove(item.productId)
                              }
                            >
                              Eliminar
                            </button>
                          </td>

                        </tr>
                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

          </div>

          <div className="col-lg-4">

            <div className="card dashboard-card">

              <div className="card-body">

                <div className="beauty-eyebrow mb-2">
                  Checkout
                </div>

                <h2 className="h5 fw-bold">
                  Resumen de compra
                </h2>

                <div className="d-flex justify-content-between mb-2">
                  <span>Productos</span>
                  <span>{items.length}</span>
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
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value as PaymentMethod
                      )
                    }
                    disabled={processing}
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

                <div className="small text-muted mb-3">

                  {paymentMethod === "CASH_ON_DELIVERY" && (
                    <>
                      El pedido quedará pendiente y podrá ser
                      despachado contra entrega.
                    </>
                  )}

                  {paymentMethod === "NEQUI" && (
                    <>
                      Pago Nequi simulado. El pedido deberá ser
                      confirmado antes del despacho.
                    </>
                  )}

                  {paymentMethod === "PAYPAL" && (
                    <>
                      Pago PayPal en modo simulado. El pedido deberá
                      ser confirmado antes del despacho.
                    </>
                  )}

                </div>

                <div className="d-flex justify-content-between fs-5 fw-bold">

                  <span>
                    Total
                  </span>

                  <span className="product-price">
                    ${total.toLocaleString("es-CO")}
                  </span>

                </div>

                <button
                  type="button"
                  className="btn beauty-btn w-100 mt-4"
                  disabled={processing}
                  onClick={handleCheckout}
                >
                  {processing
                    ? "Procesando..."
                    : session.isAuthenticated()
                      ? "Confirmar compra"
                      : "Iniciar sesión para comprar"}
                </button>

                <small className="text-muted d-block mt-3">
                  Tu carrito puede prepararse sin cuenta.
                  El pedido requiere autenticación.
                </small>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
