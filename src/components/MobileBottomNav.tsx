import { NavLink } from "react-router-dom";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `mobile-bottom-nav-link ${isActive ? "active" : ""}`;

export default function MobileBottomNav() {
  return (
    <nav className="mobile-bottom-nav" aria-label="Navegación móvil">
      <NavLink to="/shop" className={navClass}>
        <span className="mobile-bottom-nav-icon">⌂</span>
        <span>Inicio</span>
      </NavLink>

      <NavLink to="/shop" className={navClass}>
        <span className="mobile-bottom-nav-icon">✦</span>
        <span>Shop</span>
      </NavLink>

      <NavLink to="/cart" className={navClass}>
        <span className="mobile-bottom-nav-icon">🛒</span>
        <span>Carrito</span>
      </NavLink>

      <NavLink to="/my-orders" className={navClass}>
        <span className="mobile-bottom-nav-icon">📦</span>
        <span>Pedidos</span>
      </NavLink>

      <button
        type="button"
        className="mobile-bottom-nav-link mobile-bottom-nav-account"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <span className="mobile-bottom-nav-icon">●</span>
        <span>Cuenta</span>
      </button>
    </nav>
  );
}
