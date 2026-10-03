import { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard.jsx";
import { itemService, CATEGORIES } from "../services/itemService.js";
import "./pages.css";

export default function Search() {
  // Filter values the user picks
  const [filters, setFilters] = useState({ q: "", type: "", category: "", status: "" });
  const [page, setPage] = useState(1);

  // Results from the backend
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [error, setError] = useState("");

  // Load items whenever a filter or the page changes
  useEffect(() => {
    let stale = false; // true if a newer search has started

    // Wait 300ms so we don't send a request on every keystroke
    const timer = setTimeout(() => {
      const params = { page, limit: 9 };
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value; // only send filters that are filled in
      });

      itemService
        .search(params)
        .then((result) => {
          if (stale) return;
          setData(result);
          setError("");
        })
        .catch((e) => {
          if (stale) return;
          setError(e.response?.data?.message || "Could not load items");
        });
    }, 300);

    // Cleanup: cancel the old search
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [filters, page]);

  // Update one filter and go back to page 1
  const updateFilter = (key) => (e) => {
    setPage(1);
    setFilters({ ...filters, [key]: e.target.value });
  };

  return (
    <section className="lf-page">
      <h1>Search items</h1>

      {/* Filters */}
      <div className="lf-filters">
        <input
          placeholder="Search title, description, location"
          value={filters.q}
          onChange={updateFilter("q")}
        />

        <select value={filters.type} onChange={updateFilter("type")}>
          <option value="">All types</option>
          <option value="lost">lost</option>
          <option value="found">found</option>
        </select>

        <select value={filters.category} onChange={updateFilter("category")}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.replace("_", " ")}
            </option>
          ))}
        </select>

        <select value={filters.status} onChange={updateFilter("status")}>
          <option value="">Any status</option>
          <option value="pending">pending</option>
          <option value="verified">verified</option>
          <option value="recovered">recovered</option>
        </select>
      </div>

      {/* Error message, if any */}
      {error && <p className="lf-err">{error}</p>}

      <p className="muted">{data.total} result(s)</p>

      {/* Results */}
      <div className="lf-grid">
        {data.items.map((item) => (
          <ItemCard key={item._id} item={item} />
        ))}
      </div>

      {/* Page buttons */}
      <div className="lf-actions">
        <button
          className="btn btn-ghost"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        <span className="muted">
          Page {page} of {data.pages || 1}
        </span>

        <button
          className="btn btn-ghost"
          disabled={page >= data.pages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}