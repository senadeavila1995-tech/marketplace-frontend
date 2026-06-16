import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div
      className="bg-light border-end"
      style={{
        width: "250px",
        minHeight: "100vh",
      }}
    >
      <div className="p-3">
        <h5>Menú</h5>

        <ul className="list-group">
          <Link
            className="list-group-item list-group-item-action"
            to="/"
          >
            Dashboard
          </Link>

          <Link
            className="list-group-item list-group-item-action"
            to="/products"
          >
            Productos
          </Link>

          <Link
            className="list-group-item list-group-item-action"
            to="/categories"
          >
            Categorías
          </Link>

          <Link
            className="list-group-item list-group-item-action"
            to="/stores"
          >
            Tiendas
          </Link>

          <Link
            className="list-group-item list-group-item-action"
            to="/users"
          >
            Usuarios
          </Link>
        </ul>
      </div>
    </div>
  );
}