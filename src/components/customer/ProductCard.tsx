import type { Product } from "../../types/Product";

interface Props {
  product: Product;
  onAddToCart: (id: number) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: Props) {
  return (
    <div className="card h-100 shadow-sm">

      <img
        src={
          product.imageUrl ||
          "https://via.placeholder.com/300x200"
        }
        className="card-img-top"
        alt={product.name}
        style={{
          height: "220px",
          objectFit: "cover",
        }}
      />

      <div className="card-body d-flex flex-column">

        <h5>{product.name}</h5>

        <p className="text-muted">
          {product.description}
        </p>

        <p>
          <strong>${product.price}</strong>
        </p>

        <small>
          Categoría: {product.category}
        </small>

        <small>
          Tienda: {product.store}
        </small>

        <button
          className="btn btn-primary mt-auto"
          onClick={() => onAddToCart(product.id)}
        >
          Agregar al carrito
        </button>

      </div>
    </div>
  );
}