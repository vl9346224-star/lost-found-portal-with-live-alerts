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
  const [err, setErr] = useState("");       // error loading the page
  const [actionErr, setActionErr] = useState(""); // error from a button

  // Load the item
  useEffect(() => {
    itemService
      .get(id)
      .then(setItem)
      .catch((e) => setErr(e.response?.data?.message || "Item not found"));
  }, [id]);

  if (err) return <section className="lf-page"><p className="lf-err">{err}</p></section>;
  if (!item) return <section className="lf-page"><p className="muted">Loading...</p></section>;

  // Who is allowed to do what
  const ownerId = item.reportedBy?._id || item.reportedBy;
  const isOwner = !!user && ownerId === user.id;
  const isAdmin = user?.role === "admin";

  // Owner or admin can mark as recovered
  const recover = async () => {
    setActionErr("");
    try {
      const updated = await itemService.recover(id);
      // keep the reporter's name (the response only has the id)
      setItem({ ...item, ...updated, reportedBy: item.reportedBy });
    } catch (e) {
      setActionErr(e.response?.data?.message || "Could not update the report");
    }
  };

  // Only the owner deletes here (admins use the Admin page to remove with a reason)
  const del = async () => {
    if (!confirm("Delete this report?")) return;
    setActionErr("");
    try {
      await itemService.remove(id);
      nav("/my-reports");
    } catch (e) {
      setActionErr(e.response?.data?.message || "Could not delete the report");
    }
  };

  return (
    <section className="lf-page">
      <h1>{item.title}</h1>
      <span className={`lf-badge ${item.status}`}>{item.status}</span>

      {item.imageUrl && (
        <img className="lf-photo" src={imgUrl(item.imageUrl)} alt={item.title} />
      )}

      <p>{item.description}</p>

      <ul className="lf-meta">
        <li><b>Type:</b> {item.type}</li>
        <li><b>Category:</b> {item.category.replace("_", " ")}</li>
        <li><b>Location:</b> {item.location}</li>
        <li><b>Date:</b> {new Date(item.date).toLocaleDateString()}</li>
        <li><b>Contact:</b> {item.contactInfo}</li>
        {item.reportedBy?.name && <li><b>Reported by:</b> {item.reportedBy.name}</li>}
      </ul>

      {actionErr && <p className="lf-err">{actionErr}</p>}

      {(isOwner || isAdmin) && (
        <div className="lf-actions">
          {item.status !== "recovered" && (
            <button className="btn" onClick={recover}>Mark as recovered</button>
          )}
          {isOwner && (
            <button className="btn btn-ghost" onClick={del}>Delete</button>
          )}
        </div>
      )}
    </section>
  );
}