import { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard.jsx";
import { itemService, CATEGORIES } from "../services/itemService.js";
import "./pages.css";

export default function Search() {
  const [f, setF] = useState({ q: "", type: "", category: "", status: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });

  useEffect(() => {
    const p = { page, limit: 9 };
    Object.entries(f).forEach(([k, v]) => v && (p[k] = v));
    itemService.search(p).then(setData).catch(() => {});
  }, [f, page]);

  const set = (k) => (e) => { setPage(1); setF({ ...f, [k]: e.target.value }); };

  return (
    <section className="lf-page">
      <h1>Search items</h1>
      <div className="lf-filters">
        <input placeholder="Search title, description, location" value={f.q} onChange={set("q")} />
        <select value={f.type} onChange={set("type")}><option value="">All types</option><option>lost</option><option>found</option></select>
        <select value={f.category} onChange={set("category")}>
          <option value="">All categories</option>{CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
        </select>
        <select value={f.status} onChange={set("status")}>
          <option value="">Any status</option><option>pending</option><option>verified</option><option>recovered</option>
        </select>
      </div>
      <p className="muted">{data.total} result(s)</p>
      <div className="lf-grid">{data.items.map((i) => <ItemCard key={i._id} item={i} />)}</div>
      <div className="lf-actions">
        <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span className="muted">Page {page} of {data.pages || 1}</span>
        <button className="btn btn-ghost" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </section>
  );
}
