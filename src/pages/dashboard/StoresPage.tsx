import { useState, useEffect } from "react";
import { createStore, getMyStore } from "../../services/storeService";
import Swal from "sweetalert2";

export default function StorePage() {
  const [store, setStore] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  // =========================
  // LOAD STORE
  // =========================
  const loadStore = async () => {
    try {
      const data = await getMyStore();
      setStore(data);
    } catch (err) {
      console.log("No store yet");
    }
  };

  useEffect(() => {
    loadStore();
  }, []);

  // =========================
  // CREATE STORE
  // =========================
  const handleCreate = async () => {
    try {
      const res = await createStore(form);

      Swal.fire({
        icon: "success",
        title: "Tienda creada",
      });

      setStore(res);
    } catch (err: any) {
      console.log(err.response?.data);

      Swal.fire({
        icon: "error",
        title: "Error creando tienda",
        text: err.response?.data || "Error",
      });
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "500px" }}>
      <h2>Mi Tienda</h2>

      {store ? (
        <div className="card p-3">
          <h4>{store.name}</h4>
          <p>{store.description}</p>
          <small>ID: {store.id}</small>
        </div>
      ) : (
        <>
          <input
            className="form-control my-2"
            placeholder="Nombre tienda"
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            className="form-control my-2"
            placeholder="Descripción"
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <button
            className="btn btn-primary w-100"
            onClick={handleCreate}
          >
            Crear tienda
          </button>
        </>
      )}
    </div>
  );
}