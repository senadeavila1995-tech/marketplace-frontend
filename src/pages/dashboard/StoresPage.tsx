import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import {
  createStore,
  getMyStores,
  getStores,
} from "../../api/storeService";
import { getSellerOrders } from "../../api/orderService";
import type { Store } from "../../types/Store";
import type { SellerOrder } from "../../types/Order";
import { session } from "../../services/session";

type Period = 7 | 30 | 90;

function money(value: number) {
  return `$${value.toLocaleString("es-CO")}`;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    PAID: "Pagado",
    PARTIALLY_SHIPPED: "Envío parcial",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
  };

  return labels[status] || status;
}

function statusClass(status: string) {
  const classes: Record<string, string> = {
    PENDING: "bg-secondary-subtle text-secondary",
    PAID: "bg-info-subtle text-info-emphasis",
    PARTIALLY_SHIPPED: "bg-warning-subtle text-warning-emphasis",
    SHIPPED: "bg-primary-subtle text-primary",
    DELIVERED: "bg-success-subtle text-success",
  };

  return classes[status] || "bg-secondary-subtle text-secondary";
}

function dateKey(value: string) {
  const date = new Date(value);

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function shortDate(value: string) {
  const date = new Date(`${value}T12:00:00`);

  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });
}

function sellerOrderSales(order: SellerOrder) {
  return order.items.reduce(
    (sum, item) => sum + Number(item.subtotal || 0),
    0
  );
}

function GrowthIndicator({
  value,
  label,
}: {
  value: number | null;
  label: string;
}) {
  if (value === null) {
    return (
      <div className="small text-muted mt-2">
        • Nuevo período · {label}
      </div>
    );
  }

  if (value === 0) {
    return (
      <div className="small text-muted mt-2">
        — 0% · {label}
      </div>
    );
  }

  const positive = value > 0;

  return (
    <div
      className={`small fw-semibold mt-2 ${
        positive ? "text-success" : "text-danger"
      }`}
    >
      {positive ? "↑" : "↓"}{" "}
      {Math.abs(value).toFixed(1)}% · {label}
    </div>
  );
}

function LineChart({
  data,
}: {
  data: { date: string; sales: number }[];
}) {
  if (!data.length) {
    return (
      <div className="text-center text-muted py-5">
        No hay ventas en este período.
      </div>
    );
  }

  const width = 760;
  const height = 280;
  const padding = 42;

  const max = Math.max(...data.map((item) => item.sales), 1);

  const points = data.map((item, index) => {
    const x =
      padding +
      (index / Math.max(data.length - 1, 1)) *
        (width - padding * 2);

    const y =
      height -
      padding -
      (item.sales / max) *
        (height - padding * 2);

    return {
      ...item,
      x,
      y,
    };
  });

  const line = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const area = [
    `${padding},${height - padding}`,
    ...points.map((point) => `${point.x},${point.y}`),
    `${width - padding},${height - padding}`,
  ].join(" ");

  return (
    <div className="w-100" style={{ overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="280"
        role="img"
        aria-label="Evolución de ventas"
      >
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#dee2e6"
        />

        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#dee2e6"
        />

        <polygon
          points={area}
          fill="rgba(13, 110, 253, 0.08)"
        />

        <polyline
          points={line}
          fill="none"
          stroke="#0d6efd"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point) => (
          <g key={point.date}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#0d6efd"
            >
              <title>
                {shortDate(point.date)}:{" "}
                {money(point.sales)}
              </title>
            </circle>
          </g>
        ))}

        {points.map((point, index) => {
          if (
            index !== 0 &&
            index !== points.length - 1 &&
            index % Math.ceil(points.length / 6) !== 0
          ) {
            return null;
          }

          return (
            <text
              key={`label-${point.date}`}
              x={point.x}
              y={height - 15}
              textAnchor="middle"
              fontSize="11"
              fill="#6c757d"
            >
              {shortDate(point.date)}
            </text>
          );
        })}

        <text
          x={padding}
          y={20}
          fontSize="12"
          fill="#6c757d"
        >
          {money(max)}
        </text>
      </svg>
    </div>
  );
}

function UnitsChart({
  data,
}: {
  data: { date: string; units: number }[];
}) {
  if (!data.length) {
    return (
      <div className="text-center text-muted py-5">
        No hay unidades vendidas en este período.
      </div>
    );
  }

  const width = 760;
  const height = 280;
  const padding = 42;

  const max = Math.max(
    ...data.map((item) => item.units),
    1
  );

  const points = data.map((item, index) => {
    const x =
      padding +
      (index / Math.max(data.length - 1, 1)) *
        (width - padding * 2);

    const y =
      height -
      padding -
      (item.units / max) *
        (height - padding * 2);

    return {
      ...item,
      x,
      y,
    };
  });

  const line = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const area = [
    `${padding},${height - padding}`,
    ...points.map((point) => `${point.x},${point.y}`),
    `${width - padding},${height - padding}`,
  ].join(" ");

  return (
    <div className="w-100" style={{ overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="280"
        role="img"
        aria-label="Unidades vendidas"
      >
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#dee2e6"
        />

        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#dee2e6"
        />

        <polygon
          points={area}
          fill="rgba(25, 135, 84, 0.08)"
        />

        <polyline
          points={line}
          fill="none"
          stroke="#198754"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point) => (
          <g key={point.date}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#198754"
            >
              <title>
                {shortDate(point.date)}:{" "}
                {point.units} unidades
              </title>
            </circle>
          </g>
        ))}

        {points.map((point, index) => {
          if (
            index !== 0 &&
            index !== points.length - 1 &&
            index % Math.ceil(points.length / 6) !== 0
          ) {
            return null;
          }

          return (
            <text
              key={`units-label-${point.date}`}
              x={point.x}
              y={height - 15}
              textAnchor="middle"
              fontSize="11"
              fill="#6c757d"
            >
              {shortDate(point.date)}
            </text>
          );
        })}

        <text
          x={padding}
          y={20}
          fontSize="12"
          fill="#6c757d"
        >
          {max} unidades
        </text>
      </svg>
    </div>
  );
}

function BarChart({
  data,
}: {
  data: {
    name: string;
    quantity: number;
    sales: number;
  }[];
}) {
  if (!data.length) {
    return (
      <div className="text-center text-muted py-5">
        No hay productos vendidos todavía.
      </div>
    );
  }

  const max = Math.max(
    ...data.map((item) => item.quantity),
    1
  );

  return (
    <div className="d-flex flex-column gap-4">
      {data.map((item) => (
        <div key={item.name}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong>{item.name}</strong>

            <span className="small text-muted">
              {item.quantity} unidades
            </span>
          </div>

          <div
            className="progress"
            style={{ height: "12px" }}
          >
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${Math.max(
                  8,
                  (item.quantity / max) * 100
                )}%`,
              }}
            />
          </div>

          <div className="small text-muted mt-1">
            {money(item.sales)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function StoresPage() {
  const role = session.getRole();

  const [stores, setStores] = useState<Store[]>([]);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [period, setPeriod] = useState<Period>(30);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] =
    useState(true);

  const loadStores = useCallback(async () => {
    try {
      setLoading(true);

      const data =
        role === "SELLER"
          ? await getMyStores()
          : await getStores();

      setStores(data);
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "Error cargando tiendas",
        text:
          error?.response?.data ||
          "Error del servidor.",
      });
    } finally {
      setLoading(false);
    }
  }, [role]);

  const loadAnalytics = useCallback(async () => {
    if (role !== "SELLER") return;

    try {
      setLoadingAnalytics(true);

      const data = await getSellerOrders();

      setOrders(data);
    } catch (error) {
      console.error(
        "Error cargando analítica:",
        error
      );
    } finally {
      setLoadingAnalytics(false);
    }
  }, [role]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  useEffect(() => {
    if (role !== "SELLER") return;

    loadAnalytics();

    const interval = window.setInterval(
      loadAnalytics,
      30000
    );

    return () => window.clearInterval(interval);
  }, [role, loadAnalytics]);

  async function handleCreate() {
    if (!form.name.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Nombre requerido",
      });

      return;
    }

    try {
      await createStore({
        name: form.name.trim(),
        description:
          form.description.trim() || null,
      });

      setForm({
        name: "",
        description: "",
      });

      await loadStores();

      await Swal.fire({
        icon: "success",
        title: "Tienda creada",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible crear la tienda",
        text:
          error?.response?.data ||
          "Error del servidor.",
      });
    }
  }

  const analytics = useMemo(() => {
    const now = new Date();

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (period - 1));

    const previousEnd = new Date(start);
    previousEnd.setMilliseconds(-1);

    const previousStart = new Date(start);
    previousStart.setDate(
      previousStart.getDate() - period
    );
    previousStart.setHours(0, 0, 0, 0);

    const filteredOrders = orders.filter((order) => {
      const date = new Date(order.createdAt);

      return date >= start && date <= now;
    });

    const previousOrders = orders.filter((order) => {
      const date = new Date(order.createdAt);

      return (
        date >= previousStart &&
        date <= previousEnd
      );
    });

    const totalSales = filteredOrders.reduce(
      (sum, order) =>
        sum + sellerOrderSales(order),
      0
    );

    const previousSales = previousOrders.reduce(
      (sum, order) =>
        sum + sellerOrderSales(order),
      0
    );

    const totalOrders = filteredOrders.length;
    const previousTotalOrders =
      previousOrders.length;

    const totalUnits = filteredOrders.reduce(
      (sum, order) =>
        sum +
        order.items.reduce(
          (itemSum, item) =>
            itemSum + item.quantity,
          0
        ),
      0
    );

    const previousTotalUnits =
      previousOrders.reduce(
        (sum, order) =>
          sum +
          order.items.reduce(
            (itemSum, item) =>
              itemSum + item.quantity,
            0
          ),
        0
      );

    const averageOrder =
      totalOrders > 0
        ? totalSales / totalOrders
        : 0;

    function growth(
      current: number,
      previous: number
    ) {
      if (previous === 0) {
        if (current === 0) return 0;
        return null;
      }

      return (
        ((current - previous) / previous) *
        100
      );
    }

    const salesGrowth = growth(
      totalSales,
      previousSales
    );

    const ordersGrowth = growth(
      totalOrders,
      previousTotalOrders
    );

    const unitsGrowth = growth(
      totalUnits,
      previousTotalUnits
    );

    const dailyMap = new Map<
      string,
      { sales: number; units: number }
    >();

    for (let i = 0; i < period; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      const key = dateKey(
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${String(
          date.getDate()
        ).padStart(2, "0")}`
      );

      dailyMap.set(key, {
        sales: 0,
        units: 0,
      });
    }

    filteredOrders.forEach((order) => {
      const key = dateKey(order.createdAt);

      if (!dailyMap.has(key)) {
        dailyMap.set(key, {
          sales: 0,
          units: 0,
        });
      }

      const day = dailyMap.get(key)!;

      day.sales += sellerOrderSales(order);

      day.units += order.items.reduce(
        (sum, item) =>
          sum + item.quantity,
        0
      );
    });

    const salesByDay = Array.from(
      dailyMap.entries()
    ).map(([date, values]) => ({
      date,
      sales: values.sales,
    }));

    const unitsByDay = Array.from(
      dailyMap.entries()
    ).map(([date, values]) => ({
      date,
      units: values.units,
    }));

    const productMap = new Map<
      number,
      {
        name: string;
        quantity: number;
        sales: number;
      }
    >();

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productMap.get(
          item.productId
        );

        if (existing) {
          existing.quantity += item.quantity;
          existing.sales += Number(
            item.subtotal || 0
          );
        } else {
          productMap.set(item.productId, {
            name: item.productName,
            quantity: item.quantity,
            sales: Number(
              item.subtotal || 0
            ),
          });
        }
      });
    });

    const topProducts = Array.from(
      productMap.values()
    )
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const statusCounts: Record<string, number> = {
      PENDING: 0,
      PAID: 0,
      PARTIALLY_SHIPPED: 0,
      SHIPPED: 0,
      DELIVERED: 0,
    };

    filteredOrders.forEach((order) => {
      if (
        statusCounts[order.status] !==
        undefined
      ) {
        statusCounts[order.status]++;
      }
    });

    return {
      filteredOrders,
      totalSales,
      previousSales,
      totalOrders,
      previousTotalOrders,
      totalUnits,
      previousTotalUnits,
      averageOrder,
      salesGrowth,
      ordersGrowth,
      unitsGrowth,
      salesByDay,
      unitsByDay,
      topProducts,
      statusCounts,
    };
  }, [orders, period]);

  if (role !== "SELLER") {
    return (
      <div>
        <div className="mb-4">
          <h1 className="h3 fw-bold">Tiendas</h1>

          <p className="text-muted">
            Consulta las tiendas registradas.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            Cargando...
          </div>
        ) : (
          <div className="row g-4">
            {stores.map((store) => (
              <div
                className="col-md-6 col-xl-4"
                key={store.id}
              >
                <div className="card dashboard-card h-100">
                  <div className="card-body">
                    <h2 className="h5">
                      {store.name}
                    </h2>

                    <p className="text-muted">
                      {store.description ||
                        "Sin descripción"}
                    </p>

                    <div className="small text-muted">
                      ID: {store.id}
                    </div>

                    {store.owner && (
                      <div className="small text-muted">
                        Propietario: {store.owner}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {!stores.length && (
              <div className="col-12">
                <div className="alert alert-light border">
                  No hay tiendas registradas.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">
            Mi tienda
          </h1>

          <p className="text-muted mb-0">
            Analiza el crecimiento y comportamiento
            de tus ventas.
          </p>
        </div>

        <div
          className="btn-group"
          role="group"
          aria-label="Período de análisis"
        >
          {[7, 30, 90].map((value) => (
            <button
              key={value}
              type="button"
              className={`btn ${
                period === value
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() =>
                setPeriod(value as Period)
              }
            >
              {value} días
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          Cargando información de la tienda...
        </div>
      ) : (
        <>
          {stores.length === 0 && (
            <div className="card dashboard-card mb-4">
              <div className="card-body">
                <h2 className="h5 fw-bold">
                  Crear mi tienda
                </h2>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">
                      Nombre
                    </label>

                    <input
                      className="form-control"
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">
                      Descripción
                    </label>

                    <input
                      className="form-control"
                      value={form.description}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          description:
                            e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <button
                  className="btn btn-primary mt-3"
                  onClick={handleCreate}
                >
                  Crear tienda
                </button>
              </div>
            </div>
          )}

          {stores.length > 0 && (
            <div className="card dashboard-card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="small text-muted">
                      TIENDA
                    </div>

                    <h2 className="h4 fw-bold mb-1">
                      {stores[0].name}
                    </h2>

                    <p className="text-muted mb-0">
                      {stores[0].description ||
                        "Sin descripción"}
                    </p>
                  </div>

                  <span className="badge bg-success-subtle text-success px-3 py-2">
                    ● Activa
                  </span>
                </div>
              </div>
            </div>
          )}

          {loadingAnalytics ? (
            <div className="text-center py-5">
              Cargando analítica...
            </div>
          ) : (
            <>
              <div className="row g-3 mb-4">
                <div className="col-sm-6 col-xl-3">
                  <div className="card dashboard-card h-100">
                    <div className="card-body">
                      <div className="small text-muted">
                        Ventas
                      </div>

                      <div className="h3 fw-bold mt-2 mb-0">
                        {money(analytics.totalSales)}
                      </div>

                      <GrowthIndicator
                        value={analytics.salesGrowth}
                        label="vs. período anterior"
                      />

                      <div className="small text-muted mt-2">
                        Últimos {period} días
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-xl-3">
                  <div className="card dashboard-card h-100">
                    <div className="card-body">
                      <div className="small text-muted">
                        Pedidos
                      </div>

                      <div className="h3 fw-bold mt-2 mb-0">
                        {analytics.totalOrders}
                      </div>

                      <GrowthIndicator
                        value={analytics.ordersGrowth}
                        label="vs. período anterior"
                      />

                      <div className="small text-muted mt-2">
                        Pedidos recibidos
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-xl-3">
                  <div className="card dashboard-card h-100">
                    <div className="card-body">
                      <div className="small text-muted">
                        Unidades vendidas
                      </div>

                      <div className="h3 fw-bold mt-2 mb-0">
                        {analytics.totalUnits}
                      </div>

                      <GrowthIndicator
                        value={analytics.unitsGrowth}
                        label="vs. período anterior"
                      />

                      <div className="small text-muted mt-2">
                        Productos vendidos
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-xl-3">
                  <div className="card dashboard-card h-100">
                    <div className="card-body">
                      <div className="small text-muted">
                        Ticket promedio
                      </div>

                      <div className="h3 fw-bold mt-2 mb-0">
                        {money(analytics.averageOrder)}
                      </div>

                      <div className="small text-muted mt-2">
                        Venta promedio por pedido
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-12">
                  <div className="card dashboard-card">
                    <div className="card-body">
                      <div className="mb-3">
                        <h2 className="h5 fw-bold mb-1">
                          Evolución de ventas
                        </h2>

                        <p className="small text-muted mb-0">
                          Comportamiento de las ventas
                          durante los últimos {period} días.
                        </p>
                      </div>

                      <LineChart
                        data={analytics.salesByDay}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-xl-7">
                  <div className="card dashboard-card h-100">
                    <div className="card-body">
                      <div className="mb-4">
                        <h2 className="h5 fw-bold mb-1">
                          Productos más vendidos
                        </h2>

                        <p className="small text-muted mb-0">
                          Ranking por unidades vendidas.
                        </p>
                      </div>

                      <BarChart
                        data={analytics.topProducts}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-xl-5">
                  <div className="card dashboard-card h-100">
                    <div className="card-body">
                      <div className="mb-4">
                        <h2 className="h5 fw-bold mb-1">
                          Unidades vendidas
                        </h2>

                        <p className="small text-muted mb-0">
                          Cantidad de productos vendidos
                          durante los últimos {period} días.
                        </p>
                      </div>

                      <UnitsChart
                        data={analytics.unitsByDay}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-xl-5">
                  <div className="card dashboard-card h-100">
                    <div className="card-body">
                      <h2 className="h5 fw-bold mb-1">
                        Estado de pedidos
                      </h2>

                      <p className="small text-muted mb-4">
                        Situación de los pedidos del período.
                      </p>

                      <div className="d-flex flex-column gap-3">
                        {Object.entries(
                          analytics.statusCounts
                        ).map(([status, count]) => (
                          <div
                            key={status}
                            className="d-flex justify-content-between align-items-center"
                          >
                            <span
                              className={`badge ${statusClass(
                                status
                              )} px-3 py-2`}
                            >
                              {statusLabel(status)}
                            </span>

                            <strong>{count}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <div className="card dashboard-card">
                    <div className="card-body">
                      <div className="mb-3">
                        <h2 className="h5 fw-bold mb-1">
                          Últimos pedidos
                        </h2>

                        <p className="small text-muted mb-0">
                          Actividad reciente de tu tienda.
                        </p>
                      </div>

                      {analytics.filteredOrders.length ===
                      0 ? (
                        <div className="text-center text-muted py-4">
                          No hay pedidos en este período.
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table align-middle mb-0">
                            <thead>
                              <tr>
                                <th>Pedido</th>
                                <th>Fecha</th>
                                <th>Unidades</th>
                                <th>Venta</th>
                                <th>Estado</th>
                              </tr>
                            </thead>

                            <tbody>
                              {analytics.filteredOrders
                                .slice(0, 10)
                                .map((order) => (
                                  <tr key={order.id}>
                                    <td>
                                      <strong>
                                        #{order.id}
                                      </strong>
                                    </td>

                                    <td>
                                      {new Date(
                                        order.createdAt
                                      ).toLocaleDateString(
                                        "es-CO"
                                      )}
                                    </td>

                                    <td>
                                      {order.items.reduce(
                                        (sum, item) =>
                                          sum +
                                          item.quantity,
                                        0
                                      )}
                                    </td>

                                    <td>
                                      <strong>
                                        {money(
                                          sellerOrderSales(
                                            order
                                          )
                                        )}
                                      </strong>
                                    </td>

                                    <td>
                                      <span
                                        className={`badge ${statusClass(
                                          order.status
                                        )}`}
                                      >
                                        {statusLabel(
                                          order.status
                                        )}
                                      </span>
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
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
