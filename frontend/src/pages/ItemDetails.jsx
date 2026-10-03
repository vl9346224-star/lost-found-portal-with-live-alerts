import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { itemService, imgUrl } from "../services/itemService.js";
import "./pages.css";

export default function ItemDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    itemService.get(id).then(setItem).catch((e) => setErr(e.response?.data?.message || "Item not found"));
  }, [id]);

  if (err) return <section className="lf-page"><p className="lf-err">{err}</p></section>;
  if (!item) return <section className="lf-page"><p className="muted">Loading...</p></section>;

  const ownerId = item.reportedBy?._id || item.reportedBy;
  const canManage = user && (ownerId === user.id || user.role === "admin");
  const recover = async () => { const r = await itemService.recover(id); setItem({ ...item, ...r, reportedBy: item.reportedBy }); };
  const del = async () => { if (confirm("Delete this report?")) { await itemService.remove(id); nav("/my-reports"); } };

  return (
    <section className="lf-page">
      <h1>{item.title}</h1>
      <span className={`lf-badge ${item.status}`}>{item.status}</span>
      {item.imageUrl && <img className="lf-photo" src={imgUrl(item.imageUrl)} alt={item.title} />}
      <p>{item.description}</p>
      <ul className="lf-meta">
        <li><b>Type:</b> {item.type}</li>
        <li><b>Category:</b> {item.category.replace("_", " ")}</li>
        <li><b>Location:</b> {item.location}</li>
        <li><b>Date:</b> {new Date(item.date).toLocaleDateString()}</li>
        <li><b>Contact:</b> {item.contactInfo}</li>
        {item.reportedBy?.name && <li><b>Reported by:</b> {item.reportedBy.name}</li>}
      </ul>
      {canManage && (
        <div className="lf-actions">
          {item.status !== "recovered" && <button className="btn" onClick={recover}>Mark as recovered</button>}
          <button className="btn btn-ghost" onClick={del}>Delete</button>
        </div>
      )}
    </section>
  );
}
