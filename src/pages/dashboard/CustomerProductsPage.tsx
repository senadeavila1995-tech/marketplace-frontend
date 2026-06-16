import { useEffect, useState } from "react";
import { getProducts } from "../../api/productService";
import { addToCart } from "../../api/cartService";
import { session } from "../../services/session";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  store?: string;
  category?: string;
};

export default function CustomerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const user = session.getUser();

  // =========================
  // LOAD PRODUCTS
  // =========================
  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await getProducts();

      console.log("🔥 PRODUCTS BACKEND:", data);

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ ERROR LOADING PRODUCTS:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // =========================
  // ADD TO CART (FIXED)
  // =========================
  const handleAddToCart = async (productId: number) => {
    try {
      console.log("🛒 CLICK DETECTADO:", productId);

      const token = session.getToken();
      console.log("🔐 TOKEN:", token);

      if (!token) {
        alert("Debes iniciar sesión");
        return;
      }

      const response = await addToCart(productId, 1);

      console.log("✅ CART RESPONSE:", response);

      alert("Producto agregado al carrito");

    } catch (error: any) {
      console.error("❌ CART ERROR FULL:", error?.response?.data || error);
      alert("Error al agregar al carrito");
    }
  };

  return (
    <div className="container mt-4">

      <h2>🛍️ Tienda</h2>

      {user && (
        <p className="text-muted">
          Bienvenido, {user.email}
        </p>
      )}

      {loading ? (
        <p>Cargando productos...</p>
      ) : products.length === 0 ? (
        <p>No hay productos disponibles</p>
      ) : (
        <div className="row">

          {products.map((p) => (
            <div key={p.id} className="col-md-4 mb-3">

              <div className="card h-100 shadow-sm">

                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    className="card-img-top"
                    style={{ height: "180px", objectFit: "cover" }}
                  />
                )}

                <div className="card-body">

                  <h5>{p.name}</h5>
                  <p className="text-muted">{p.description}</p>

                  <p>🏪 {p.store}</p>
                  <p>📦 {p.category}</p>

                  <h6 className="text-success">
                    ${p.price}
                  </h6>

                  <button
                    className="btn btn-primary w-100 mt-2"
                    onClick={() => handleAddToCart(p.id)}
                  >
                    🛒 Agregar al carrito
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}