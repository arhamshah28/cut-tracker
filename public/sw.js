// Kill switch: unregister this service worker and clear all caches
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", async () => {
  // Clear all caches
  const keys = await caches.keys();
  await Promise.all(keys.map((key) => caches.delete(key)));
  // Unregister self
  self.registration.unregister();
  // Take over all clients and reload them
  const clients = await self.clients.matchAll({ type: "window" });
  clients.forEach((client) => client.navigate(client.url));
});
