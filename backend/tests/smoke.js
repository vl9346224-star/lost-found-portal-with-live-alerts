// Runs through the whole API against a RUNNING server.
// Usage:  npm run test:smoke
// Optional admin checks: set ADMIN_EMAIL and ADMIN_PASSWORD (create one with `npm run create-admin`)
// PowerShell:  $env:ADMIN_EMAIL="admin@college.edu"; $env:ADMIN_PASSWORD="Admin@123"; npm run test:smoke
const BASE = process.env.BASE_URL || "http://localhost:5000";
let pass = 0, fail = 0;

async function call(method, path, { token, body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = "Bearer " + token;
  let payload;
  if (body) { headers["Content-Type"] = "application/json"; payload = JSON.stringify(body); }
  if (form) { payload = form; }
  const res = await fetch(BASE + path, { method, headers, body: payload });
  let data = null;
  try { data = await res.json(); } catch (e) {}
  return { status: res.status, data };
}

function check(name, ok, extra = "") {
  if (ok) { pass++; console.log("  PASS", name); }
  else { fail++; console.log("  FAIL", name, extra); }
}

function itemForm(over = {}) {
  const f = new FormData();
  const v = { title: "Blue wallet", description: "Lost near the library", category: "wallet",
    location: "Library", date: "2026-10-01", contactInfo: "9999999999", ...over };
  Object.entries(v).forEach(([k, val]) => f.append(k, val));
  return f;
}

(async () => {
  const email = `test${Date.now()}@example.com`;
  const password = "secret123";

  console.log("AUTH");
  let r = await call("POST", "/api/auth/register", { body: { name: "Test Student", email, password } });
  check("register -> 201", r.status === 201, JSON.stringify(r.data));
  r = await call("POST", "/api/auth/register", { body: { name: "Dup", email, password } });
  check("duplicate email -> 409", r.status === 409);
  r = await call("POST", "/api/auth/login", { body: { email, password: "wrong" } });
  check("wrong password -> 401", r.status === 401);
  r = await call("POST", "/api/auth/login", { body: { email, password } });
  check("login -> 200 + token", r.status === 200 && !!r.data.token);
  const token = r.data.token;
  r = await call("GET", "/api/auth/me", { token });
  check("me -> 200", r.status === 200 && r.data.email === email);
  r = await call("GET", "/api/items/lost");
  check("no token -> 401", r.status === 401);

  console.log("ITEMS");
  r = await call("POST", "/api/items/lost", { token, form: itemForm() });
  check("report lost -> 201", r.status === 201, JSON.stringify(r.data));
  const lostId = r.data && r.data._id;
  r = await call("POST", "/api/items/found", { token, form: itemForm({ title: "Black phone", category: "phone", location: "Canteen" }) });
  check("report found -> 201", r.status === 201);
  const foundId = r.data && r.data._id;
  r = await call("POST", "/api/items/lost", { token, form: itemForm({ category: "spaceship" }) });
  check("bad category -> 400", r.status === 400);
  r = await call("POST", "/api/items/lost", { token, form: (() => { const f = new FormData(); f.append("title", "x"); return f; })() });
  check("missing fields -> 400", r.status === 400);
  r = await call("GET", "/api/items/lost", { token });
  check("list lost -> 200", r.status === 200 && Array.isArray(r.data));
  r = await call("GET", "/api/items/my", { token });
  check("my reports -> 2 items", r.status === 200 && r.data.length === 2);
  r = await call("GET", "/api/items/" + lostId, { token });
  check("item details -> 200", r.status === 200 && r.data._id === lostId);
  r = await call("GET", "/api/items/notanid", { token });
  check("bad id -> 400", r.status === 400);
  const fe = new FormData(); fe.append("title", "Brown wallet");
  r = await call("PUT", "/api/items/" + lostId, { token, form: fe });
  check("edit own -> 200", r.status === 200 && r.data.title === "Brown wallet");

  console.log("SEARCH");
  r = await call("GET", "/api/search?q=wallet", { token });
  check("search q=wallet finds item", r.status === 200 && r.data.items.some((i) => i._id === lostId));
  r = await call("GET", "/api/search?category=phone&type=found", { token });
  check("filter category+type", r.status === 200 && r.data.items.every((i) => i.category === "phone"));
  r = await call("GET", "/api/search?category=nope", { token });
  check("search bad category -> 400", r.status === 400);
  r = await call("GET", "/api/search?limit=1&page=1", { token });
  check("pagination limit=1", r.status === 200 && r.data.items.length <= 1 && r.data.pages >= 1);
  r = await call("GET", "/api/search/meta", { token });
  check("meta -> categories", r.status === 200 && r.data.categories.includes("wallet"));

  console.log("RECOVERY");
  r = await call("PATCH", `/api/items/${lostId}/recovered`, { token });
  check("mark recovered -> 200", r.status === 200 && r.data.status === "recovered");
  r = await call("PATCH", `/api/items/${lostId}/recovered`, { token });
  check("recover again -> 400", r.status === 400);
  r = await call("GET", "/api/search/recovered", { token });
  check("recovered list has item", r.status === 200 && r.data.items.some((i) => i._id === lostId));

  console.log("NOTIFICATIONS");
  r = await call("GET", "/api/notifications", { token });
  check("notifications -> 200", r.status === 200 && Array.isArray(r.data.notifications));

  console.log("ADMIN");
  r = await call("GET", "/api/admin/stats", { token });
  check("student on admin route -> 403", r.status === 403);
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    r = await call("POST", "/api/auth/login", { body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD } });
    check("admin login -> 200", r.status === 200);
    const at = r.data && r.data.token;
    r = await call("GET", "/api/admin/stats", { token: at });
    check("admin stats -> 200", r.status === 200 && typeof r.data.total === "number");
    r = await call("GET", "/api/admin/reports?status=pending", { token: at });
    check("admin all reports -> 200", r.status === 200 && Array.isArray(r.data.items));
    r = await call("PATCH", `/api/admin/reports/${foundId}/verify`, { token: at });
    check("admin verify -> 200", r.status === 200 && r.data.status === "verified");
    r = await call("PATCH", `/api/admin/reports/${foundId}/status`, { token: at, body: { status: "bogus" } });
    check("admin bad status -> 400", r.status === 400);
    r = await call("GET", "/api/notifications", { token });
    check("owner got 'verified' notification", r.data.notifications.some((n) => n.type === "verified"));
    r = await call("DELETE", `/api/admin/reports/${foundId}`, { token: at, body: { reason: "test" } });
    check("admin remove -> 200", r.status === 200);
    r = await call("GET", "/api/items/" + foundId, { token });
    check("removed item hidden -> 404", r.status === 404);
  } else {
    console.log("  (skipped: set ADMIN_EMAIL and ADMIN_PASSWORD to test admin APIs)");
  }

  console.log("CLEANUP");
  r = await call("DELETE", "/api/items/" + lostId, { token });
  check("delete own -> 200", r.status === 200);

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error("Test run crashed:", e.message, "- is the server running?"); process.exit(1); });
