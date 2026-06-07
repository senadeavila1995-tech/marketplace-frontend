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

        {/* =========================
            PUBLIC
        ========================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* =========================
            ADMIN ROUTES
        ========================= */}
        <Route
          path="/"
          element={
            <ProtectedRoute role="ADMIN">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute role="ADMIN">
              <ProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute role="ADMIN">
              <CategoriesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stores"
          element={
            <ProtectedRoute role="ADMIN">
              <StoresPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute role="ADMIN">
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* =========================
            CUSTOMER ROUTES (CON LAYOUT)
        ========================= */}
        <Route
          element={
            <ProtectedRoute role="CUSTOMER">
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/shop" element={<CustomerProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}