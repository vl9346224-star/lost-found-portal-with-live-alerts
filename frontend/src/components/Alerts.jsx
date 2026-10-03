import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext.jsx";
import { origin } from "../services/itemService.js";

// Live alerts (Socket.IO) shown as small toasts
export default function Alerts() {
  const { user } = useAuth();
  const [list, setList] = useState([]);

  // Only reconnect when the user logs in/out, not when the profile is edited
  const userId = user?.id;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!userId || !token) return;

    const socket = io(origin || undefined, { auth: { token } });

    // Show a toast for 6 seconds (max 4 at once)
    const push = (text) => {
      const id = Date.now() + Math.random();
      setList((l) => [{ id, text }, ...l].slice(0, 4));
      setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 6000);
    };

    // Personal alerts: possible match, verified, status changed, removed
    socket.on("notification", (n) => push(n.message));

    // New report: skip my own, and skip for admins (they get adminNewReport)
    socket.on("newItem", (item) => {
      if (item.reportedBy === userId || isAdmin) return;
      push(`New ${item.type} report: ${item.title}`);
    });

    socket.on("itemRecovered", (item) => push(`Recovered: ${item.title}`));

    if (isAdmin) {
      socket.on("adminNewReport", (item) => push(`Needs verification: ${item.title}`));
    }

    // Stop listening when the user logs out
    return () => socket.disconnect();
  }, [userId, isAdmin]);

  return (
    <div className="lf-toasts">
      {list.map((a) => (
        <div key={a.id} className="lf-toast">{a.text}</div>
      ))}
    </div>
  );
}