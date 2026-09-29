import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { getMyOrders, receiveOrder } from "../../api/orderService";
import type { SellerOrder } from "../../types/Order";

function getStatusLabel(status: SellerOrder["status"]) {
  switch (status) {
    case "PENDING":
      return "Pendiente";
    case "PAID":
      return "Pagado";
    case "PARTIALLY_SHIPPED":
      return "Envío parcial";
    case "SHIPPED":
      return "Enviado";
    case "DELIVERED":
      return "Recibido";
    default:
      return status;
  }
}

function getStatusClass(status: SellerOrder["status"]) {
  switch (status) {
    case "DELIVERED":
      return "bg-success";
    case "SHIPPED":
      return "bg-primary";
    case "PARTIALLY_SHIPPED":
      return "bg-info text-dark";
    case "PAID":
      return "bg-primary";
    case "PENDING":
      return "bg-warning text-dark";
    default:
      return "bg-secondary";
  }
}

function getPaymentMethodLabel(paymentMethod?: SellerOrder["paymentMethod"]) {
  switch (paymentMethod) {
    case "CASH_ON_DELIVERY":
      return "Contraentrega";
    case "NEQUI":
      return "Nequi";
    case "PAYPAL":
      return "PayPal";
    default:
      return "No especificado";
  }
}

function getPaymentDescription(paymentMethod?: SellerOrder["paymentMethod"]) {
  switch (paymentMethod) {
    case "CASH_ON_DELIVERY":
      return "El pago se realiza al recibir el pedido.";
    case "NEQUI":
      return "Método digital registrado para la compra.";
    case "PAYPAL":
      return "Método digital registrado para la compra.";
    default:
      return "No se especificó un método de pago.";
  }
}

function getProgressPercent(status: SellerOrder["status"]) {
  switch (status) {
    case "PENDING":
      return 25;
    case "PAID":
      return 40;
    case "PARTIALLY_SHIPPED":
      return 65;
    case "SHIPPED":
      return 85;
    case "DELIVERED":
      return 100;
    default:
      return 0;
  }
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [receivingOrderId, setReceivingOrderId] = useState<number | null>(null);

  const loadOrders = useCallback(async (showError = true) => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error cargando mis pedidos:", error);

      if (showError) {
        Swal.fire(
          "Error",
          "No fue posible cargar tus pedidos.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    const interval = window.setInterval(() => {
      loadOrders(false);
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadOrders]);

  const totalOrders = orders.length;

  const totalUnits = useMemo(
    () =>
      orders.reduce(
        (total, order) =>
          total +
          order.items.reduce(
            (itemTotal, item) => itemTotal + item.quantity,
            0
          ),
        0
      ),
    [orders]
  );

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "PENDING" ||
      order.status === "PAID"
  ).length;

  const shippedOrders = orders.filter(
    (order) =>
      order.status === "PARTIALLY_SHIPPED" ||
      order.status === "SHIPPED"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED"
  ).length;

  async function handleReceiveOrder(order: SellerOrder) {
    const result = await Swal.fire({
      icon: "question",
      title: "¿Recibiste tu pedido?",
      html: `
        <p class="mb-2">
          Confirma solamente si todos los productos fueron recibidos.
        </p>
        <strong>Pedido #${order.id}</strong>
      `,
      showCancelButton: true,
      confirmButtonText: "Sí, lo recibí",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#198754",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setReceivingOrderId(order.id);

      await receiveOrder(order.id);

      await loadOrders(false);

      await Swal.fire({
        icon: "success",
        title: "Pedido recibido",
        text: "La compra fue marcada como recibida correctamente.",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible marcarlo como recibido",
        text:
          error?.response?.data ||
          "Error del servidor.",
      });
    } finally {
      setReceivingOrderId(null);
    }
  }

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center py-5">
          <div className="spinner-border" role="status" />
          <p className="mt-3">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="mb-1">Mis pedidos</h2>
          <p className="text-muted mb-0">
            Consulta el estado de tus compras y entregas.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => loadOrders()}
        >
          ↻ Actualizar
        </button>
      </div>

      {orders.length > 0 && (
        <div className="row g-3 mb-4">

          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="small text-muted">
                  Pedidos
                </div>
                <div className="fs-3 fw-bold">
                  {totalOrders}
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="small text-muted">
                  Unidades
                </div>
                <div className="fs-3 fw-bold">
                  {totalUnits}
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="small text-muted">
                  En proceso
                </div>
                <div className="fs-3 fw-bold">
                  {pendingOrders}
                </div>
              </div>
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="small text-muted">
                  Recibidos
                </div>
                <div className="fs-3 fw-bold">
                  {deliveredOrders}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {orders.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="fs-1 mb-3">🛒</div>
            <h4>No tienes pedidos todavía</h4>
            <p className="text-muted mb-0">
              Cuando realices una compra, aparecerá aquí.
            </p>
          </div>
        </div>
      ) : (
        <div className="row g-4">

          {orders.map((order) => {
            const orderUnits = order.items.reduce(
              (total, item) => total + item.quantity,
              0
            );

            const progress = getProgressPercent(order.status);

            const isReceiving =
              receivingOrderId === order.id;

            return (
              <div className="col-12" key={order.id}>

                <div className="card shadow-sm border-0">

                  <div className="card-header bg-white">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">

                      <div>
                        <strong>Pedido #{order.id}</strong>

                        <div className="small text-muted">
                          {new Date(order.createdAt).toLocaleString("es-CO")}
                        </div>
                      </div>

                      <span
                        className={`badge ${getStatusClass(order.status)}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>

                    </div>
                  </div>

                  <div className="card-body">

                    <div className="row g-3 mb-4">

                      <div className="col-12 col-md-4">
                        <div className="border rounded p-3 h-100">
                          <div className="small text-muted">
                            Productos
                          </div>

                          <strong>
                            {order.items.length}{" "}
                            {order.items.length === 1
                              ? "producto"
                              : "productos"}
                          </strong>

                          <div className="small text-muted mt-1">
                            {orderUnits}{" "}
                            {orderUnits === 1
                              ? "unidad"
                              : "unidades"}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-4">
                        <div className="border rounded p-3 h-100">
                          <div className="small text-muted">
                            Método de pago
                          </div>

                          <strong>
                            {getPaymentMethodLabel(
                              order.paymentMethod
                            )}
                          </strong>

                          <div className="small text-muted mt-1">
                            {getPaymentDescription(
                              order.paymentMethod
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-12 col-md-4">
                        <div className="border rounded p-3 h-100">
                          <div className="small text-muted">
                            Total
                          </div>

                          <strong className="fs-5">
                            ${order.total.toLocaleString("es-CO")}
                          </strong>

                          <div className="small text-muted mt-1">
                            Valor total del pedido
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="mb-4">

                      <div className="d-flex justify-content-between small mb-2">
                        <span>Estado del pedido</span>
                        <strong>
                          {getStatusLabel(order.status)}
                        </strong>
                      </div>

                      <div
                        className="progress"
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        style={{ height: "10px" }}
                      >
                        <div
                          className={`progress-bar ${
                            order.status === "DELIVERED"
                              ? "bg-success"
                              : "bg-primary"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="d-flex justify-content-between small text-muted mt-2">
                        <span>Pedido</span>
                        <span>Despacho</span>
                        <span>Envío</span>
                        <span>Recibido</span>
                      </div>

                    </div>

                    <div className="mb-3">

                      {order.items.map((item) => (
                        <div
                          key={item.productId}
                          className="d-flex justify-content-between align-items-center border-bottom py-3 gap-3"
                        >
                          <div className="flex-grow-1">
                            <strong>{item.productName}</strong>

                            <div className="small text-muted">
                              {item.quantity} × $
                              {item.price.toLocaleString("es-CO")}
                            </div>
                          </div>

                          <strong className="text-nowrap">
                            ${item.subtotal.toLocaleString("es-CO")}
                          </strong>
                        </div>
                      ))}

                    </div>

                    {order.status === "PENDING" && (
                      <div className="alert alert-warning mt-3 mb-0">
                        <strong>Pedido pendiente</strong>
                        <br />
                        El pedido fue registrado y está pendiente
                        de procesamiento y despacho.
                      </div>
                    )}

                    {order.status === "PAID" && (
                      <div className="alert alert-primary mt-3 mb-0">
                        <strong>Pago registrado</strong>
                        <br />
                        El pedido fue pagado y está pendiente
                        de despacho.
                      </div>
                    )}

                    {order.status === "PARTIALLY_SHIPPED" && (
                      <div className="alert alert-info mt-3 mb-0">
                        <strong>🚚 Envío parcial</strong>
                        <br />
                        {order.shippedItems ?? 0} de{" "}
                        {order.totalItems ?? orderUnits} unidades
                        ya fueron enviadas.
                        <br />
                        Los productos restantes siguen pendientes
                        de envío.
                      </div>
                    )}

                    {order.status === "SHIPPED" && (
                      <div className="alert alert-success mt-3 mb-0">
                        <strong>✓ Pedido enviado</strong>
                        <br />
                        Todos los productos del pedido han sido enviados.
                        <br />
                        Cuando recibas la totalidad del pedido,
                        puedes marcarlo como recibido.
                      </div>
                    )}

                    {order.status === "DELIVERED" && (
                      <div className="alert alert-success mt-3 mb-0">
                        <strong>✓ Pedido recibido</strong>
                        <br />
                        Confirmaste que todos los productos fueron recibidos.
                      </div>
                    )}

                    {order.status === "SHIPPED" && (
                      <div className="mt-3">
                        <button
                          type="button"
                          className="btn btn-success"
                          disabled={isReceiving}
                          onClick={() => handleReceiveOrder(order)}
                        >
                          {isReceiving ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              />
                              Procesando...
                            </>
                          ) : (
                            "✓ Marcar como recibido"
                          )}
                        </button>
                      </div>
                    )}

                    {order.status === "PARTIALLY_SHIPPED" && (
                      <div className="mt-3">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          disabled
                        >
                          Esperando despacho completo
                        </button>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            );
          })}

        </div>
      )}

      {shippedOrders > 0 && (
        <div className="text-center text-muted small mt-4">
          Tienes {shippedOrders}{" "}
          {shippedOrders === 1
            ? "pedido en proceso de envío."
            : "pedidos en proceso de envío."}
        </div>
      )}

    </div>
  );
}
