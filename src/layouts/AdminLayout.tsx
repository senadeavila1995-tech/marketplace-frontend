import { Outlet, Link } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

export default function AdminLayout() {
  return (
    <div>

      <nav className="navbar navbar-dark bg-dark px-3">

        <span className="navbar-brand">⚙️ Admin Panel</span>

        <div className="d-flex gap-2">

          <Link to="/" className="btn btn-outline-light btn-sm">
            Dashboard
          </Link>

          <Link to="/products" className="btn btn-outline-light btn-sm">
            Productos
          </Link>

          <Link to="/categories" className="btn btn-outline-light btn-sm">
            Categorías
          </Link>

          <Link to="/users" className="btn btn-outline-light btn-sm">
            Usuarios
          </Link>

          <LogoutButton />

        </div>

      </nav>

      <div className="container mt-3">
        <Outlet />
      </div>

    </div>
  );
}