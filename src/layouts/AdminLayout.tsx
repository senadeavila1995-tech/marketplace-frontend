import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function AdminLayout() {
  return (
    <>
      <Navbar />

      <div className="d-flex page-shell">
        <Sidebar />

        <main className="flex-grow-1 p-4">
          <Outlet />
        </main>
      </div>
    </>
  );
}
