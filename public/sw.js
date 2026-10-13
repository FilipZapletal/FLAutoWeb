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
    (async () => {
      // Zvuk upozornění určuje telefon (nastavení Oznámení), vlastní zvuk web push neumí. Je-li administrace
      // právě otevřená, ozve se navíc cinknutí přímo ve stránce.
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      windows.forEach((w) => w.postMessage({ type: "push", tag: data.tag || null }));
      await self.registration.showNotification(data.title || "FL Auto", {
        body: data.body || "",
        icon: "/icons/admin-192.png",
        tag: data.tag || undefined,
        silent: false,
        vibrate: [200, 100, 200],
        data: { url: data.url || "/admin/poptavky" },
      });
    })(),
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
