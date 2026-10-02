import api from "./api.js";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

// ---- Mock backend (browser only) so UI works before Member 4 is done ----
const readUsers = () => JSON.parse(localStorage.getItem("mock_users") || "[]");
const writeUsers = (u) => localStorage.setItem("mock_users", JSON.stringify(u));
const strip = ({ password, ...rest }) => rest;

const mock = {
  async register(data) {
    await delay();
    const users = readUsers();
    if (users.some((u) => u.email === data.email)) {
      throw { response: { data: { message: "This email is already registered." } } };
    }
    const user = { id: crypto.randomUUID(), role: "student", ...data };
    writeUsers([...users, user]);
    return { token: "mock-" + user.id, user: strip(user) };
  },
  async login({ email, password }) {
    await delay();
    const user = readUsers().find((u) => u.email === email && u.password === password);
    if (!user) throw { response: { data: { message: "Email or password is wrong." } } };
    return { token: "mock-" + user.id, user: strip(user) };
  },
  async me() {
    await delay(100);
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) throw { response: { status: 401 } };
    return user;
  },
  async updateProfile(data) {
    await delay();
    const current = JSON.parse(localStorage.getItem("user"));
    const updated = { ...current, ...data };
    writeUsers(readUsers().map((u) => (u.id === updated.id ? { ...u, ...data } : u)));
    return updated;
  },
};

// ---- Real backend (Member 4 contract) ----
const real = {
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data.user ?? r.data),
  updateProfile: (data) => api.put("/auth/me", data).then((r) => r.data.user ?? r.data),
};

export const authService = USE_MOCK ? mock : real;
