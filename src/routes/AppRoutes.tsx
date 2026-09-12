import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";

import Dashboard from "../pages/dashboard/Dashboard";
import SellerDashboard from "../pages/dashboard/SellerDashboard";
import ProductsPage from "../pages/dashboard/ProductsPage";
import CategoriesPage from "../pages/dashboard/CategoriesPage";
import StoresPage from "../pages/dashboard/StoresPage";
import UsersPage from "../pages/dashboard/UsersPage";
import PaymentsPage from "../pages/dashboard/PaymentsPage";

import CustomerProductsPage from "../pages/dashboard/CustomerProductsPage";
import CartPage from "../pages/dashboard/CartPage";

import AdminLayout from "../layouts/AdminLayout";
import SellerLayout from "../layouts/SellerLayout";
import CustomerLayout from "../layouts/CustomerLayout";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="stores" element={<StoresPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="payments" element={<PaymentsPage />} />
        </Route>

        <Route
          path="/seller"
          element={
            <ProtectedRoute roles={["SELLER"]}>
              <SellerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="stores" element={<StoresPage />} />
        </Route>

        <Route
          path="/products"
          element={
            <ProtectedRoute roles={["ADMIN", "SELLER"]}>
              <ProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stores"
          element={
            <ProtectedRoute roles={["ADMIN", "SELLER"]}>
              <StoresPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />

        <Route element={<CustomerLayout />}>
          <Route path="/shop" element={<CustomerProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
