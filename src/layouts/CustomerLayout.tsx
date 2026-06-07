import { Outlet, Link } from "react-router-dom";
import { session } from "../services/session";
import LogoutButton from "../components/LogoutButton";

export default function CustomerLayout() {
  const user = session.getUser();

  return (
    <div>

      <nav className="navbar navbar-dark bg-dark px-3">

        <Link to="/shop" className="navbar-brand">
          🛍️ Marketplace
        </Link>

        <div className="d-flex gap-2 align-items-center">

          <Link to="/shop" className="btn btn-outline-light btn-sm">
            Productos
          </Link>

          <Link to="/cart" className="btn btn-outline-light btn-sm">
            🛒 Carrito
          </Link>

          <span className="text-white small">
            {user?.email}
          </span>

          <LogoutButton />

        </div>

      </nav>

      <div className="container mt-3">
        <Outlet />
      </div>

    </div>
  );
}