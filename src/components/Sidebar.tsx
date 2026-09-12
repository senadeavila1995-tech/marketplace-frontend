import { NavLink } from "react-router-dom";
import { session } from "../services/session";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `nav-link sidebar-link ${isActive ? "active" : ""}`;

export default function Sidebar() {
  const role = session.getRole();

  return (
    <aside className="sidebar p-3">

      <div className="sidebar-title mb-3">
        ✦ Beauty Market
      </div>

      <div className="small text-muted mb-3">
        Panel de gestión
      </div>

      <nav className="nav flex-column">

        {role === "ADMIN" && (
          <>
            <NavLink to="/admin" className={linkClass}>
              ✨ Dashboard
            </NavLink>

            <NavLink to="/admin/products" className={linkClass}>
              🧴 Productos
            </NavLink>

            <NavLink to="/admin/categories" className={linkClass}>
              🌸 Categorías
            </NavLink>

            <NavLink to="/admin/stores" className={linkClass}>
              🏪 Tiendas
            </NavLink>

            <NavLink to="/admin/users" className={linkClass}>
              👤 Usuarios
            </NavLink>

            <NavLink to="/admin/payments" className={linkClass}>
              💳 Pagos / Escrow
            </NavLink>
          </>
        )}

        {role === "SELLER" && (
          <>
            <NavLink to="/seller" className={linkClass}>
              ✨ Dashboard
            </NavLink>

            <NavLink to="/seller/products" className={linkClass}>
              🧴 Mis productos
            </NavLink>

            <NavLink to="/seller/stores" className={linkClass}>
              🏪 Mi tienda
            </NavLink>
          </>
        )}

      </nav>
    </aside>
  );
}
