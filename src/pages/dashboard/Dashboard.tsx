import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { session } from "../../services/session";

export default function Dashboard() {
  const navigate = useNavigate();

  const user = session.getUser();
  const role = session.getRole();

  const logout = () => {
    Swal.fire({
      title: "Cerrar sesión",
      text: "¿Estás seguro?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí",
    }).then((r) => {
      if (r.isConfirmed) {
        session.clear();
        navigate("/login");
      }
    });
  };

  return (
    <div className="container mt-4">

      {/* HEADER CARD */}
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex justify-content-between align-items-center">
          <div>
            <h3 className="mb-0">Marketplace Dashboard</h3>

            <small className="text-muted">
              Usuario: <b>{user?.email}</b> | Rol: <b>{role}</b> | Store:{" "}
              <b>{user?.storeId}</b>
            </small>
          </div>

          <button className="btn btn-danger" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="row g-3">

        <div className="col-md-3">
          <Link to="/products" className="card text-decoration-none shadow-sm">
            <div className="card-body text-center">
              <h4>📦 Productos</h4>
              <p className="text-muted">Gestionar productos</p>
            </div>
          </Link>
        </div>

        <div className="col-md-3">
          <Link to="/categories" className="card text-decoration-none shadow-sm">
            <div className="card-body text-center">
              <h4>🏷️ Categorías</h4>
              <p className="text-muted">Gestionar categorías</p>
            </div>
          </Link>
        </div>

        <div className="col-md-3">
          <Link to="/stores" className="card text-decoration-none shadow-sm">
            <div className="card-body text-center">
              <h4>🏪 Tiendas</h4>
              <p className="text-muted">Gestionar tiendas</p>
            </div>
          </Link>
        </div>

        <div className="col-md-3">
          <Link to="/users" className="card text-decoration-none shadow-sm">
            <div className="card-body text-center">
              <h4>👥 Usuarios</h4>
              <p className="text-muted">Gestionar usuarios</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}