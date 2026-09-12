import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  createStore,
  getMyStores,
  getStores,
} from "../../api/storeService";
import type { Store } from "../../types/Store";
import { session } from "../../services/session";

export default function StoresPage() {
  const role = session.getRole();

  const [stores, setStores] = useState<Store[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);

      const data =
        role === "SELLER"
          ? await getMyStores()
          : await getStores();

      setStores(data);
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "Error cargando tiendas",
        text: error?.response?.data || "Error del servidor.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [role]);

  async function handleCreate() {
    if (!form.name.trim()) {
      await Swal.fire({
        icon: "warning",
        title: "Nombre requerido",
      });
      return;
    }

    try {
      await createStore({
        name: form.name.trim(),
        description: form.description.trim() || null,
      });

      setForm({
        name: "",
        description: "",
      });

      await load();

      await Swal.fire({
        icon: "success",
        title: "Tienda creada",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error: any) {
      await Swal.fire({
        icon: "error",
        title: "No fue posible crear la tienda",
        text: error?.response?.data || "Error del servidor.",
      });
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold">
          {role === "SELLER" ? "Mi tienda" : "Tiendas"}
        </h1>
        <p className="text-muted">
          {role === "SELLER"
            ? "Administra la información de tu tienda."
            : "Consulta las tiendas registradas."}
        </p>
      </div>

      {role === "SELLER" && stores.length === 0 && (
        <div className="card dashboard-card mb-4">
          <div className="card-body">
            <h2 className="h5">Crear mi tienda</h2>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">
                  Descripción
                </label>
                <input
                  className="form-control"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <button
              className="btn btn-primary mt-3"
              onClick={handleCreate}
            >
              Crear tienda
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          Cargando...
        </div>
      ) : (
        <div className="row g-4">
          {stores.map((store) => (
            <div className="col-md-6 col-xl-4" key={store.id}>
              <div className="card dashboard-card h-100">
                <div className="card-body">
                  <h2 className="h5">{store.name}</h2>
                  <p className="text-muted">
                    {store.description || "Sin descripción"}
                  </p>

                  <div className="small text-muted">
                    ID: {store.id}
                  </div>

                  {store.owner && (
                    <div className="small text-muted">
                      Propietario: {store.owner}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {stores.length === 0 && (
            <div className="col-12">
              <div className="alert alert-light border">
                No hay tiendas registradas.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
