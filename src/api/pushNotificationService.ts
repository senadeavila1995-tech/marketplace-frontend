import API from "./api";

interface PushSubscriptionResponse {
  publicKey: string;
}

interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const bytes = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    bytes[i] = rawData.charCodeAt(i);
  }

  return bytes.buffer;
}

export async function subscribeToPromotionNotifications(): Promise<void> {
  if (!("serviceWorker" in navigator)) {
    throw new Error(
      "Este navegador no soporta Service Workers."
    );
  }

  if (!("PushManager" in window)) {
    throw new Error(
      "Este navegador no soporta notificaciones Push."
    );
  }

  if (!("Notification" in window)) {
    throw new Error(
      "Este navegador no soporta notificaciones."
    );
  }

  await navigator.serviceWorker.register("/sw.js");

  const registration =
    await navigator.serviceWorker.ready;

  const response = await API.get<PushSubscriptionResponse>(
    "/PushSubscriptions/public-key"
  );

  const publicKey = response.data.publicKey;

  if (!publicKey) {
    throw new Error(
      "El backend no devolvió la clave pública VAPID."
    );
  }

  let subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey:
        urlBase64ToArrayBuffer(publicKey),
    });
  }

  const json = subscription.toJSON();

  if (
    !json.endpoint ||
    !json.keys?.p256dh ||
    !json.keys?.auth
  ) {
    throw new Error(
      "El navegador no devolvió una suscripción Push válida."
    );
  }

  const data: PushSubscriptionData = {
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
  };

  try {
    await API.post(
      "/PushSubscriptions",
      data
    );
  } catch (error: any) {
    const status = error?.response?.status;
    const detail =
      typeof error?.response?.data === "string"
        ? error.response.data
        : error?.response?.data
          ? JSON.stringify(error.response.data)
          : error?.message || "Error desconocido";

    throw new Error(
      `No se pudo registrar la suscripción Push${
        status ? ` (HTTP ${status})` : ""
      }: ${detail}`
    );
  }
}

export async function unsubscribeFromPromotionNotifications(): Promise<void> {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  const registration =
    await navigator.serviceWorker.getRegistration("/sw.js");

  if (!registration) {
    return;
  }

  const subscription =
    await registration.pushManager.getSubscription();

  if (!subscription) {
    return;
  }

  const json = subscription.toJSON();

  if (json.endpoint) {
    await API.delete(
      "/PushSubscriptions",
      {
        data: {
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh ?? "",
          auth: json.keys?.auth ?? "",
        },
      }
    );
  }

  await subscription.unsubscribe();
}

export interface PendingPromotionNotificationsResponse {
  pendingFound: number;
  notificationsSent: number;
}

export async function checkPendingPromotionNotifications(): Promise<PendingPromotionNotificationsResponse> {
  const response =
    await API.get<PendingPromotionNotificationsResponse>(
      "/Promotions/pending-notifications"
    );

  return response.data;
}

export async function sendPromotionHeartbeat(): Promise<void> {
  await API.post("/PushSubscriptions/heartbeat");
}
