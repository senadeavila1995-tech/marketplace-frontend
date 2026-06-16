import LogoutButton from "./LogoutButton";
import { session } from "../services/session";
import { Link } from "react-router-dom";

export default function Navbar() {
  const role = session.getRole();

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      
      <span className="navbar-brand">
        Marketplace
      </span>

      <div className="d-flex gap-2 align-items-center">

        {role === "CUSTOMER" && (
          <>
            <Link to="/shop" className="btn btn-outline-light btn-sm">
              Productos
            </Link>

            <Link to="/cart" className="btn btn-outline-warning btn-sm">
              🛒 Carrito
            </Link>
          </>
        )}

        <LogoutButton />

      </div>
    </nav>
  );
}