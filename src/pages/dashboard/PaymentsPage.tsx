import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  confirmPayment,
  getPayments,
  releasePayment,
} from "../../api/paymentService";
import type { Payment } from "../../types/Payment";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      setPayments(await getPayments());
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "Error cargando pagos",
        text: error?.response?.data || "Error del servidor.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleConfirm(payment: Payment) {
    try {
      await confirmPayment(payment.id);
      await load();

      await Swal.fire({
        icon: "success",
        title: "Pago confirmado",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible confirmar",
        text: error?.response?.data || "Error del servidor.",
      });
    }
  }

  async function handleRelease(payment: Payment) {
    try {
      await releasePayment(payment.id);
      await load();

      await Swal.fire({
        icon: "success",
        title: "Escrow liberado",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible liberar",
        text: error?.response?.data || "Error del servidor.",
      });
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold">Pagos y Escrow</h1>
        <p className="text-muted">
          Confirma pagos y libera el escrow según el flujo del backend.
        </p>
      </div>

      <div className="card table-card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              Cargando pagos...
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-5 text-muted">
              No hay pagos registrados.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Orden</th>
                    <th>Método</th>
                    <th>Estado</th>
                    <th>Escrow</th>
                    <th>Confirmado</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.id}</td>
                      <td>#{payment.orderId}</td>
                      <td>{payment.method}</td>

                      <td>
                        <span className="badge text-bg-light border">
                          {payment.status}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            payment.escrowStatus === "RELEASED"
                              ? "text-bg-success"
                              : payment.escrowStatus === "READY"
                                ? "text-bg-primary"
                                : "text-bg-warning"
                          }`}
                        >
                          {payment.escrowStatus}
                        </span>
                      </td>

                      <td>
                        {payment.adminConfirmed
                          ? "Sí"
                          : "No"}
                      </td>

                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          {!payment.adminConfirmed &&
                            payment.escrowStatus !== "RELEASED" && (
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() =>
                                  handleConfirm(payment)
                                }
                              >
                                Confirmar
                              </button>
                            )}

                          {payment.adminConfirmed &&
                            payment.escrowStatus !== "RELEASED" && (
                              <button
                                className="btn btn-outline-success btn-sm"
                                onClick={() =>
                                  handleRelease(payment)
                                }
                              >
                                Liberar escrow
                              </button>
                            )}
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
