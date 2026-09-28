import { useCallback, useEffect, useState } from "react";
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
    default:
      return status;
  }
}

function getStatusClass(status: SellerOrder["status"]) {
  switch (status) {
    case "SHIPPED":
      return "bg-success";
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

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);

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

    // Actualiza el estado automáticamente cada 5 segundos.
    const interval = window.setInterval(() => {
      loadOrders(false);
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadOrders]);

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

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Mis pedidos</h2>
          <p className="text-muted mb-0">
            Consulta el estado de tus compras.
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

      {orders.length === 0 ? (
        <div className="alert alert-info">
          Todavía no tienes pedidos.
        </div>
      ) : (
        <div className="row g-4">

          {orders.map((order) => (
            <div className="col-12" key={order.id}>

              <div className="card shadow-sm border-0">

                <div className="card-header bg-white d-flex justify-content-between align-items-center">
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

                <div className="card-body">

                  {order.items.map((item) => (
                    <div
                      key={item.productId}
                      className="d-flex justify-content-between border-bottom py-2"
                    >
                      <div>
                        <strong>{item.productName}</strong>
                        <div className="small text-muted">
                          Cantidad: {item.quantity}
                        </div>
                      </div>

                      <span>
                        ${item.subtotal.toLocaleString("es-CO")}
                      </span>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between mt-3">
                    <strong>Total</strong>
                    <strong>
                      ${order.total.toLocaleString("es-CO")}
                    </strong>
                  </div>

                  <div className="mt-3">
                    <span className="text-muted">
                      Método de pago:{" "}
                    </span>

                    <strong>
                      {order.paymentMethod === "CASH_ON_DELIVERY"
                        ? "Contraentrega"
                        : order.paymentMethod === "NEQUI"
                          ? "Nequi"
                          : order.paymentMethod === "PAYPAL"
                            ? "PayPal"
                            : "No especificado"}
                    </strong>
                  </div>

                  {order.status === "SHIPPED" && (
                    <div className="alert alert-success mt-3 mb-0">
                      <strong>✓ Pedido enviado</strong>
                      <br />
                      Todos los productos del pedido han sido enviados.
                    </div>
                  )}

                  {order.status === "SHIPPED" && (
                    <div className="mt-3">
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={async () => {
                          const result = await Swal.fire({
                            icon: "question",
                            title: "¿Recibiste tu pedido?",
                            text: "Confirma solamente si todos los productos fueron recibidos.",
                            showCancelButton: true,
                            confirmButtonText: "Sí, lo recibí",
                            cancelButtonText: "Cancelar",
                          });

                          if (!result.isConfirmed) {
                            return;
                          }

                          try {
                            await receiveOrder(order.id);

                            setOrders((current) =>
                              current.filter((item) => item.id !== order.id)
                            );

                            await Swal.fire({
                              icon: "success",
                              title: "Pedido recibido",
                              text: "La compra fue marcada como recibida correctamente.",
                              timer: 1500,
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
                          }
                        }}
                      >
                        ✓ Marcar como recibido
                      </button>
                    </div>
                  )}

                  {order.status === "PARTIALLY_SHIPPED" && (
                    <div className="alert alert-info mt-3 mb-0">
                      <strong>🚚 Envío parcial</strong>
                      <br />
                      {order.shippedItems ?? 0} de {order.totalItems ?? 0} productos
                      ya fueron enviados.
                      <br />
                      Los demás productos siguen pendientes de envío.
                    </div>
                  )}

                  {order.status === "PENDING" && (
                    <div className="alert alert-warning mt-3 mb-0">
                      El pedido está pendiente de envío.
                    </div>
                  )}

                </div>
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}
