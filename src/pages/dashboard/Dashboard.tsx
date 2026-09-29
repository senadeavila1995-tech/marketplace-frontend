import { useCallback, useEffect, useMemo, useState } from "react";
import { getUsers } from "../../api/userService";
import { getProducts } from "../../api/productService";
import { getCategories } from "../../api/categoryService";
import { getPayments } from "../../api/paymentService";
import { getPromotions } from "../../api/promotionService";
import type { Payment } from "../../types/Payment";
import type { User } from "../../types/User";
import type { Promotion } from "../../types/Promotion";

function getPaymentStatusLabel(status: Payment["status"]) {
  switch (status) {
    case "COMPLETED":
      return "Completado";
    case "PENDING":
      return "Pendiente";
    default:
      return status;
  }
}

function getPaymentStatusClass(status: Payment["status"]) {
  switch (status) {
    case "COMPLETED":
      return "bg-success-subtle text-success";
    case "PENDING":
      return "bg-warning-subtle text-warning-emphasis";
    default:
      return "bg-secondary-subtle text-secondary";
  }
}

function getEscrowLabel(status: Payment["escrowStatus"]) {
  switch (status) {
    case "HELD":
      return "Retenido";
    case "READY":
      return "Listo para liberar";
    case "RELEASED":
      return "Liberado";
    default:
      return status;
  }
}

function getEscrowClass(status: Payment["escrowStatus"]) {
  switch (status) {
    case "RELEASED":
      return "bg-success-subtle text-success";
    case "READY":
      return "bg-info-subtle text-info-emphasis";
    case "HELD":
      return "bg-warning-subtle text-warning-emphasis";
    default:
      return "bg-secondary-subtle text-secondary";
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState(0);
  const [categories, setCategories] = useState(0);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const [
        userList,
        productList,
        categoryList,
        paymentList,
        promotionList,
      ] = await Promise.all([
        getUsers(),
        getProducts(),
        getCategories(),
        getPayments(),
        getPromotions(),
      ]);

      setUsers(userList);
      setProducts(productList.length);
      setCategories(categoryList.length);
      setPayments(paymentList);
      setPromotions(promotionList);
    } catch {
      // El dashboard puede conservar el último estado
      // si una métrica no está disponible temporalmente.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();

    const interval = window.setInterval(
      loadDashboard,
      30000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [loadDashboard]);

  const customerCount = useMemo(
    () =>
      users.filter(
        (user) => user.role === "CUSTOMER"
      ).length,
    [users]
  );

  const sellerCount = useMemo(
    () =>
      users.filter(
        (user) => user.role === "SELLER"
      ).length,
    [users]
  );

  const adminCount = useMemo(
    () =>
      users.filter(
        (user) => user.role === "ADMIN"
      ).length,
    [users]
  );

  const pendingPayments = useMemo(
    () =>
      payments.filter(
        (payment) => payment.status === "PENDING"
      ).length,
    [payments]
  );

  const completedPayments = useMemo(
    () =>
      payments.filter(
        (payment) => payment.status === "COMPLETED"
      ).length,
    [payments]
  );

  const heldPayments = useMemo(
    () =>
      payments.filter(
        (payment) => payment.escrowStatus === "HELD"
      ).length,
    [payments]
  );

  const releasedPayments = useMemo(
    () =>
      payments.filter(
        (payment) => payment.escrowStatus === "RELEASED"
      ).length,
    [payments]
  );

  const activePromotions = useMemo(() => {
    const now = new Date();

    return promotions.filter((promotion) => {
      const startsAt = new Date(promotion.startsAt);
      const endsAt = new Date(promotion.endsAt);

      return (
        promotion.isActive &&
        startsAt <= now &&
        endsAt >= now
      );
    });
  }, [promotions]);

  const recentPayments = useMemo(
    () =>
      [...payments]
        .sort(
          (a, b) =>
            new Date(b.paidAt).getTime() -
            new Date(a.paidAt).getTime()
        )
        .slice(0, 8),
    [payments]
  );

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">
            Dashboard administrativo
          </h1>

          <p className="text-muted mb-0">
            Resumen general de usuarios, productos,
            promociones y pagos del marketplace.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={loadDashboard}
          disabled={loading}
        >
          {loading ? "Actualizando..." : "↻ Actualizar"}
        </button>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card stat-card h-100">
            <div className="card-body">
              <div className="text-muted">
                Usuarios
              </div>

              <div className="display-6 fw-bold">
                {users.length}
              </div>

              <small className="text-muted">
                {customerCount} clientes · {sellerCount}{" "}
                vendedores
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card stat-card h-100">
            <div className="card-body">
              <div className="text-muted">
                Productos
              </div>

              <div className="display-6 fw-bold">
                {products}
              </div>

              <small className="text-muted">
                {categories} categorías
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card stat-card h-100">
            <div className="card-body">
              <div className="text-muted">
                Pagos
              </div>

              <div className="display-6 fw-bold">
                {payments.length}
              </div>

              <small className="text-muted">
                {completedPayments} completados ·{" "}
                {pendingPayments} pendientes
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card stat-card h-100">
            <div className="card-body">
              <div className="text-muted">
                Promociones activas
              </div>

              <div className="display-6 fw-bold">
                {activePromotions.length}
              </div>

              <small className="text-muted">
                Productos destacados actualmente
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-5">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-4">
                Usuarios por rol
              </h5>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Clientes</span>
                  <strong>{customerCount}</strong>
                </div>

                <div className="progress">
                  <div
                    className="progress-bar"
                    style={{
                      width:
                        users.length > 0
                          ? `${(customerCount / users.length) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Vendedores</span>
                  <strong>{sellerCount}</strong>
                </div>

                <div className="progress">
                  <div
                    className="progress-bar bg-info"
                    style={{
                      width:
                        users.length > 0
                          ? `${(sellerCount / users.length) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Administradores</span>
                  <strong>{adminCount}</strong>
                </div>

                <div className="progress">
                  <div
                    className="progress-bar bg-dark"
                    style={{
                      width:
                        users.length > 0
                          ? `${(adminCount / users.length) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-4">
                Estado de pagos
              </h5>

              <div className="row g-3">
                <div className="col-sm-6">
                  <div className="border rounded p-3 h-100">
                    <div className="text-muted small">
                      Completados
                    </div>

                    <div className="fs-3 fw-bold text-success">
                      {completedPayments}
                    </div>

                    <small className="text-muted">
                      Pagos registrados como completados
                    </small>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="border rounded p-3 h-100">
                    <div className="text-muted small">
                      Pendientes
                    </div>

                    <div className="fs-3 fw-bold text-warning">
                      {pendingPayments}
                    </div>

                    <small className="text-muted">
                      Pagos pendientes de confirmación
                    </small>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="border rounded p-3 h-100">
                    <div className="text-muted small">
                      Fondos retenidos
                    </div>

                    <div className="fs-3 fw-bold">
                      {heldPayments}
                    </div>

                    <small className="text-muted">
                      Escrow en estado retenido
                    </small>
                  </div>
                </div>

                <div className="col-sm-6">
                  <div className="border rounded p-3 h-100">
                    <div className="text-muted small">
                      Fondos liberados
                    </div>

                    <div className="fs-3 fw-bold text-success">
                      {releasedPayments}
                    </div>

                    <small className="text-muted">
                      Escrow liberado
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">
                  Pagos recientes
                </h5>

                <span className="badge text-bg-light">
                  {payments.length} registrados
                </span>
              </div>

              {recentPayments.length === 0 ? (
                <div className="text-center text-muted py-4">
                  No hay pagos registrados.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Método</th>
                        <th>Estado</th>
                        <th>Escrow</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentPayments.map((payment) => (
                        <tr key={payment.id}>
                          <td>
                            <strong>
                              #{payment.orderId}
                            </strong>
                          </td>

                          <td>
                            {payment.method || "—"}
                          </td>

                          <td>
                            <span
                              className={`badge ${getPaymentStatusClass(
                                payment.status
                              )}`}
                            >
                              {getPaymentStatusLabel(
                                payment.status
                              )}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`badge ${getEscrowClass(
                                payment.escrowStatus
                              )}`}
                            >
                              {getEscrowLabel(
                                payment.escrowStatus
                              )}
                            </span>
                          </td>

                          <td className="text-nowrap">
                            {formatDate(payment.paidAt)}
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

        <div className="col-lg-5">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                Promociones activas
              </h5>

              {activePromotions.length === 0 ? (
                <p className="text-muted mb-0">
                  No hay promociones activas actualmente.
                </p>
              ) : (
                <div className="list-group list-group-flush">
                  {activePromotions
                    .slice(0, 5)
                    .map((promotion) => (
                      <div
                        key={promotion.id}
                        className="list-group-item px-0"
                      >
                        <div className="d-flex justify-content-between gap-3">
                          <div>
                            <div className="fw-semibold">
                              🔥 {promotion.productName}
                            </div>

                            <small className="text-muted">
                              {promotion.title}
                            </small>
                          </div>

                          {promotion.isFeatured && (
                            <span className="badge text-bg-dark align-self-start">
                              Destacado
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                Accesos rápidos
              </h5>

              <div className="d-grid gap-2">
                <a
                  href="/admin/products"
                  className="btn btn-outline-primary"
                >
                  Gestionar productos
                </a>

                <a
                  href="/admin/promotions"
                  className="btn btn-outline-warning"
                >
                  Gestionar promociones
                </a>

                <a
                  href="/admin/payments"
                  className="btn btn-outline-success"
                >
                  Revisar pagos
                </a>

                <a
                  href="/admin/users"
                  className="btn btn-outline-secondary"
                >
                  Gestionar usuarios
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-muted small mt-4">
        El dashboard se actualiza automáticamente cada 30
        segundos.
      </div>
    </div>
  );
}
