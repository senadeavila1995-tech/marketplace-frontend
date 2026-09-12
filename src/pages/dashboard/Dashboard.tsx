import { useEffect, useState } from "react";
import { getUsers } from "../../api/userService";
import { getProducts } from "../../api/productService";
import { getCategories } from "../../api/categoryService";
import { getPayments } from "../../api/paymentService";

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    categories: 0,
    payments: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        const [users, products, categories, payments] =
          await Promise.all([
            getUsers(),
            getProducts(),
            getCategories(),
            getPayments(),
          ]);

        setStats({
          users: users.length,
          products: products.length,
          categories: categories.length,
          payments: payments.length,
        });
      } catch {
        // El dashboard no debe romperse si una métrica falla.
      }
    }

    load();
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold">Dashboard administrativo</h1>
        <p className="text-muted">
          Resumen general del marketplace.
        </p>
      </div>

      <div className="row g-4">
        <div className="col-md-6 col-xl-3">
          <div className="card stat-card">
            <div className="card-body">
              <div className="text-muted">Usuarios</div>
              <div className="display-6 fw-bold">{stats.users}</div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card stat-card">
            <div className="card-body">
              <div className="text-muted">Productos</div>
              <div className="display-6 fw-bold">{stats.products}</div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card stat-card">
            <div className="card-body">
              <div className="text-muted">Categorías</div>
              <div className="display-6 fw-bold">
                {stats.categories}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card stat-card">
            <div className="card-body">
              <div className="text-muted">Pagos</div>
              <div className="display-6 fw-bold">
                {stats.payments}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
