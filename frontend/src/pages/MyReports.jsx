import { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard.jsx";
import { itemService } from "../services/itemService.js";
import "./pages.css";

export default function MyReports() {
  const [items, setItems] = useState([]);
  const load = () => itemService.mine().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  return (
    <section className="lf-page">
      <h1>My reports</h1>
      {items.length === 0 && <p className="muted">You have no reports yet.</p>}
      <div className="lf-grid">
        {items.map((i) => (
          <ItemCard key={i._id} item={i}>
            <div className="lf-actions">
              {i.status !== "recovered" && <button className="btn" onClick={() => itemService.recover(i._id).then(load)}>Recovered</button>}
              <button className="btn btn-ghost" onClick={() => confirm("Delete?") && itemService.remove(i._id).then(load)}>Delete</button>
            </div>
          </ItemCard>
        ))}
      </div>
    </section>
  );
}
