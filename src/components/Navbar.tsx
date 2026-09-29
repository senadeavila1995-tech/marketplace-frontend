import { Link } from "react-router-dom";
import { session } from "../services/session";
import { logout } from "../services/logout";

export default function Navbar() {
  const user = session.getUser();

  const home =
    user?.role === "CUSTOMER"
      ? "/shop"
      : user?.role === "SELLER"
        ? "/seller"
        : "/admin";

  return (
    <nav className="navbar navbar-expand-lg beauty-navbar px-3 py-2">
      <div className="container-fluid">

        <Link className="navbar-brand beauty-brand fw-bold" to={home}>
          <span className="beauty-brand-mark">✦</span>
          <span className="beauty-brand-text">Beauty Market</span>
        </Link>

        <div className="d-flex align-items-center gap-2 gap-md-3">

          {user && (
            <span className="beauty-user small d-none d-md-inline">
              Hola, <strong>{user.name}</strong>
              {" · "}
              <span className="beauty-role">
                {user.role}
              </span>
            </span>
          )}

          {user?.role === "CUSTOMER" && (
            <>
              <Link
                to="/my-orders"
                className="btn btn-sm btn-outline-primary px-3 navbar-desktop-action"
              >
                📦 Mis pedidos
              </Link>

              <Link
                to="/cart"
                className="btn btn-sm beauty-cart px-3 navbar-desktop-action"
              >
                🛍️ Carrito
              </Link>
            </>
          )}

          <button
            type="button"
            className="btn btn-sm beauty-logout"
            onClick={logout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <span className="navbar-logout-text">Salir</span>
            <span className="navbar-logout-icon">↪</span>
          </button>

        </div>
      </div>
    </nav>
  );
}
