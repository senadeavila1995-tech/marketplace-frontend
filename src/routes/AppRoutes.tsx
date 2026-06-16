import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "../pages/dashboard/Dashboard";
import ProductsPage from "../pages/dashboard/ProductsPage";
import CategoriesPage from "../pages/dashboard/CategoriesPage";
import StoresPage from "../pages/dashboard/StoresPage";
import UsersPage from "../pages/dashboard/UsersPage";

import CustomerProductsPage from "../pages/dashboard/CustomerProductsPage";
import CartPage from "../pages/dashboard/CartPage";

import CustomerLayout from "../layouts/CustomerLayout";

import Login from "../pages/Login";
import Register from "../pages/Register";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ADMIN */}
        <Route
          path="/"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN Y SELLER */}
        <Route
          path="/products"
          element={
            <ProtectedRoute roles={["ADMIN", "SELLER"]}>
              <ProductsPage />
            </ProtectedRoute>
          }
        />

        {/* SOLO ADMIN */}
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
            <ProtectedRoute roles={["ADMIN"]}>
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

        {/* CUSTOMER */}
        <Route
          element={
            <ProtectedRoute roles={["CUSTOMER"]}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/shop" element={<CustomerProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}