// Service worker administrace FL Auto: zobrazuje upozornění na nové poptávky (Web Push).
// Registruje se jen pro /admin, na veřejný web nijak nezasahuje.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title || "FL Auto", {
      body: data.body || "",
      icon: "/icons/admin-192.png",
      badge: "/icons/admin-192.png",
      tag: data.tag || undefined,
      data: { url: data.url || "/admin/poptavky" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/admin/poptavky", self.location.origin).href;
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const open = windows.find((w) => new URL(w.url).pathname.startsWith("/admin"));
      if (open) {
        await open.focus();
        if ("navigate" in open) await open.navigate(url).catch(() => {});
      } else {
        await self.clients.openWindow(url);
      }
    })(),
  );
});
