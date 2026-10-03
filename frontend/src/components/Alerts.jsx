import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext.jsx";
import { origin } from "../services/itemService.js";

// Live alerts (Socket.IO) shown as toasts
export default function Alerts() {
  const { user } = useAuth();
  const [list, setList] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!user || !token) return;
    const s = io(origin || undefined, { auth: { token } });
    const push = (text) => {
      const id = Date.now() + Math.random();
      setList((l) => [{ id, text }, ...l].slice(0, 4));
      setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 6000);
    };
    s.on("notification", (n) => push(n.message));
    s.on("newItem", (i) => push(`New ${i.type} report: ${i.title}`));
    s.on("itemRecovered", (i) => push(`Recovered: ${i.title}`));
    if (user.role === "admin") s.on("adminNewReport", (i) => push(`Needs verification: ${i.title}`));
    return () => s.disconnect();
  }, [user]);

  return <div className="lf-toasts">{list.map((a) => <div key={a.id} className="lf-toast">{a.text}</div>)}</div>;
}
