import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import MobileBottomNav from "../components/MobileBottomNav";

export default function CustomerLayout() {
  return (
    <div className="customer-app-shell">
      <Navbar />

      <main className="page-shell p-4 customer-app-content">
        <Outlet />
      </main>

      <MobileBottomNav />
    </div>
  );
}
