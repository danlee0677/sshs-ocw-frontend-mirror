export function clientLoader() {
  throw new Response("Page not found", { status: 404 });
}