import { useEffect, useState } from "react";
import {
  getCart,
  removeCartItem,
  updateCartItem,
} from "../../api/cartService";
import API from "../../api/api";

type CartItem = {
  id: number;
  productId: number;
  product: string;
  quantity: number;
  price: number;
  total: number;
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // LOAD CART
  // =========================
  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await getCart();

      console.log("CART DATA:", data);

      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading cart:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // =========================
  // DELETE ITEM
  // =========================
  const handleDelete = async (id: number) => {
    try {
      await removeCartItem(id);
      await loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // UPDATE QTY
  // =========================
  const handleUpdate = async (id: number, qty: number) => {
    try {
      await updateCartItem(id, qty);
      await loadCart();
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // CHECKOUT (🔥 COMPRA)
  // =========================
  const handleCheckout = async () => {
    try {
      if (items.length === 0) {
        alert("Carrito vacío");
        return;
      }

      const payload = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      console.log("CHECKOUT PAYLOAD:", payload);

      const res = await API.post("/orders/checkout", payload);

      console.log("ORDER CREATED:", res.data);

      alert("Pedido creado correctamente #" + res.data.orderId);

      await loadCart();
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);
      alert("Error al realizar el pedido");
    }
  };

  // =========================
  // TOTAL
  // =========================
  const total = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="container mt-4">

      <h2>🛒 Mi Carrito</h2>

      {loading ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <p>No hay productos en el carrito</p>
      ) : (
        <table className="table">

          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id}>

                <td>{item.product}</td>

                <td>
                  <input
                    type="number"
                    value={item.quantity}
                    min={1}
                    onChange={(e) =>
                      handleUpdate(item.id, Number(e.target.value))
                    }
                  />
                </td>

                <td>${item.price}</td>

                <td>${item.total}</td>

                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    Eliminar
                  </button>
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      )}

      {/* ========================= */}
      {/* TOTAL + CHECKOUT */}
      {/* ========================= */}
      <div className="text-end mt-3">

        <h4>Total: ${total}</h4>

        <button
          className="btn btn-success mt-2"
          onClick={handleCheckout}
          disabled={items.length === 0}
        >
          🛒 Hacer pedido
        </button>

      </div>

    </div>
  );
}