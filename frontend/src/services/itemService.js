import api from "./api.js";

export const CATEGORIES = ["id_card", "phone", "wallet", "books", "calculator", "bag", "other"];
export const STATUSES = ["pending", "verified", "recovered", "removed"];
// Backend origin (for images and sockets). Empty string = same origin (Vite proxy).
export const origin = (import.meta.env.VITE_API_URL || "/api").replace(/\/api\/?$/, "");
export const imgUrl = (p) => (p ? origin + p : "");
const d = (p) => p.then((r) => r.data);

export const itemService = {
  report: (type, fd) => d(api.post(`/items/${type}`, fd)),
  get: (id) => d(api.get(`/items/${id}`)),
  search: (params) => d(api.get("/search", { params })),
  mine: () => d(api.get("/items/my")),
  recover: (id) => d(api.patch(`/items/${id}/recovered`)),
  remove: (id) => d(api.delete(`/items/${id}`)),
  admin: {
    stats: () => d(api.get("/admin/stats")),
    reports: (params) => d(api.get("/admin/reports", { params })),
    verify: (id) => d(api.patch(`/admin/reports/${id}/verify`)),
    setStatus: (id, status) => d(api.patch(`/admin/reports/${id}/status`, { status })),
    remove: (id, reason) => d(api.delete(`/admin/reports/${id}`, { data: { reason } })),
  },
};
