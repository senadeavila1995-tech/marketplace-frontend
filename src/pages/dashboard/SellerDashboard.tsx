import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  getSellerOrders,
  shipOrder,
} from "../../api/orderService";
import { getProducts } from "../../api/productService";
import { getMyStores } from "../../api/storeService";
import { session } from "../../services/session";
import type {
  PaymentMethod,
  SellerOrder,
} from "../../types/Order";

export default function SellerDashboard() {
  const [products, setProducts] = useState(0);
  const [stores, setStores] = useState(0);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [shippingId, setShippingId] = useState<number | null>(null);

  const user = session.getUser();

  async function loadOrders() {
    try {
      setLoadingOrders(true);

      const orderList = await getSellerOrders();

      setOrders(orderList);
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No se pudieron cargar las ventas",
        text:
          error?.response?.data ||
          "No fue posible consultar los pedidos del vendedor.",
      });
    } finally {
      setLoadingOrders(false);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [productList, storeList] = await Promise.all([
          getProducts(),
          getMyStores(),
        ]);

        setProducts(productList.length);
        setStores(storeList.length);
      } catch {
        // Estado parcial permitido.
      }
    }

    load();
    loadOrders();
  }, []);

  const pendingOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === "PENDING" ||
          order.status === "PAID"
      ),
    [orders]
  );

  function getPaymentLabel(
    method?: PaymentMethod
  ) {
    switch (method) {
      case "CASH_ON_DELIVERY":
        return "Contra entrega";

      case "NEQUI":
        return "Nequi";

      case "PAYPAL":
        return "PayPal";

      default:
        return "No especificado";
    }
  }

  function getStatusLabel(order: SellerOrder) {
    if (
      order.paymentMethod === "CASH_ON_DELIVERY" &&
      order.status === "PENDING"
    ) {
      return "CONTRA ENTREGA";
    }

    if (order.status === "PENDING") {
      return "PAGO PENDIENTE";
    }

    if (order.status === "PAID") {
      return "PAGO CONFIRMADO";
    }

    return order.status;
  }

  async function handleShip(order: SellerOrder) {
    const paymentLabel = getPaymentLabel(
      order.paymentMethod
    );

    const result = await Swal.fire({
      icon: "question",
      title: "¿Marcar pedido como enviado?",
      html: `
        <p class="mb-1">
          Pedido <strong>#${order.id}</strong>
        </p>

        <p class="mb-1">
          Método de pago:
          <strong>${paymentLabel}</strong>
        </p>

        <p class="mb-0">
          Total:
          <strong>
            $${order.total.toLocaleString("es-CO")}
          </strong>
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, marcar enviado",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#c98791",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setShippingId(order.id);

      await shipOrder(order.id);

      await Swal.fire({
        icon: "success",
        title: "Pedido enviado",
        text: `El pedido #${order.id} fue marcado como enviado correctamente.`,
        timer: 1600,
        showConfirmButton: false,
      });

      await loadOrders();
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo actualizar el pedido",
        text:
          error?.response?.data ||
          "Ocurrió un error al marcar el pedido como enviado.",
      });
    } finally {
      setShippingId(null);
    }
  }

  return (
    <div>
      <div className="card hero-card mb-4">
        <div className="card-body p-4">
          <div className="beauty-eyebrow mb-2">
            Panel del vendedor
          </div>

          <h1 className="h3 fw-bold">
            Bienvenido, {user?.name}
          </h1>

          <p className="mb-0">
            Administra tu catálogo, tu tienda y prepara tus
            ventas para envío.
          </p>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card stat-card h-100">
            <div className="card-body">
              <div className="text-muted">
                Productos publicados
              </div>

              <div className="display-5 fw-bold">
                {products}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card stat-card h-100">
            <div className="card-body">
              <div className="text-muted">
                Mis tiendas
              </div>

              <div className="display-5 fw-bold">
                {stores}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card stat-card h-100">
            <div className="card-body">
              <div className="text-muted">
                Ventas pendientes de envío
              </div>

              <div className="display-5 fw-bold">
                {pendingOrders.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section>
        <div className="d-flex justify-content-between align-items-end mb-3">
          <div>
            <div className="beauty-eyebrow mb-1">
              Gestión de pedidos
            </div>

            <h2 className="h4 fw-bold mb-1">
              Ventas pendientes de envío
            </h2>

            <p className="text-muted mb-0">
              Revisa el estado del pago y prepara los pedidos
              para despacho.
            </p>
          </div>

          <button
            type="button"
            className="btn beauty-btn"
            onClick={loadOrders}
            disabled={loadingOrders}
          >
            {loadingOrders
              ? "Actualizando..."
              : "Actualizar"}
          </button>
        </div>

        {loadingOrders ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <div
                className="spinner-border"
                role="status"
                style={{ color: "#c98791" }}
              >
                <span className="visually-hidden">
                  Cargando...
                </span>
              </div>

              <div className="mt-3 text-muted">
                Consultando ventas...
              </div>
            </div>
          </div>
        ) : pendingOrders.length === 0 ? (
          <div className="beauty-empty">
            <div className="fs-1 mb-2">
              ✦
            </div>

            <h3 className="h5 fw-bold">
              No tienes ventas pendientes de envío
            </h3>

            <p className="mb-0">
              Cuando un cliente realice una compra, el pedido
              aparecerá aquí para preparación y despacho.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {pendingOrders.map((order) => (
              <div
                className="col-12 col-xl-6"
                key={order.id}
              >
                <div className="card product-card h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <div className="beauty-eyebrow">
                          Venta
                        </div>

                        <h3 className="h5 fw-bold mb-1">
                          Pedido #{order.id}
                        </h3>

                        <small className="text-muted">
                          {new Date(
                            order.createdAt
                          ).toLocaleString("es-CO")}
                        </small>
                      </div>

                      <span className="beauty-badge">
                        {getStatusLabel(order)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded bg-light">
                        <span className="text-muted">
                          Método de pago
                        </span>

                        <strong>
                          {getPaymentLabel(
                            order.paymentMethod
                          )}
                        </strong>
                      </div>

                      {order.items.map((item) => (
                        <div
                          key={item.productId}
                          className="d-flex justify-content-between align-items-center py-2 border-bottom"
                        >
                          <div>
                            <div className="fw-semibold">
                              {item.productName}
                            </div>

                            <small className="text-muted">
                              Cantidad: {item.quantity}
                            </small>
                          </div>

                          <div className="fw-semibold">
                            $
                            {item.subtotal.toLocaleString(
                              "es-CO"
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-muted">
                        Total
                      </span>

                      <span className="product-price fs-4">
                        $
                        {order.total.toLocaleString(
                          "es-CO"
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn beauty-btn w-100"
                      onClick={() =>
                        handleShip(order)
                      }
                      disabled={
                        shippingId === order.id
                      }
                    >
                      {shippingId === order.id
                        ? "Actualizando..."
                        : "Marcar como enviado"}
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
