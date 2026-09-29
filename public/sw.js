const SW_VERSION = "marketplace-push-v11";

self.addEventListener("install", (event) => {
  console.log(SW_VERSION, "install");
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  console.log(SW_VERSION, "activate");
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let data;

  try {
    data = event.data.json();
  } catch {
    data = {
      title: "🔥 Producto promocionado",
      body: "Tenemos un nuevo producto promocionado para ti.",
      url: "/shop",
    };
  }

  const title = data.title || "🔥 Producto promocionado";

  const options = {
    body:
      data.body ||
      "Tenemos un nuevo producto promocionado para ti.",

    requireInteraction: true,
    silent: false,

    tag: "marketplace-promotion-" + Date.now(),
    renotify: true,

    actions: [
      {
        action: "open-product",
        title: "Ver producto",
      },
      {
        action: "dismiss",
        title: "Cerrar",
      },
    ],

    data: {
      url: data.url || "/shop",
      productId: data.productId || null,
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  const action = event.action;

  event.notification.close();

  if (action === "dismiss") {
    return;
  }

  const targetUrl =
    event.notification.data?.url ||
    "/shop";

  const url = new URL(
    targetUrl,
    self.location.origin
  ).href;

  event.waitUntil(
    clients.openWindow(url)
  );
});
