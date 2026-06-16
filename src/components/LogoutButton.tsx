import { session } from "../services/session";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    session.clear();
    navigate("/login");
  };

  return (
    <button
      className="btn btn-danger btn-sm"
      onClick={handleLogout}
    >
      Cerrar sesión
    </button>
  );
}