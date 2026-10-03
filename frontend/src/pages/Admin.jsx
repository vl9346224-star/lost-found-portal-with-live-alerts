import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { itemService, STATUSES } from "../services/itemService.js";
import "./pages.css";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");

  const load = () => {
    itemService.admin.stats().then(setStats).catch((e) => setErr(e.response?.data?.message || "Admin access only"));
    itemService.admin.reports(status ? { status, limit: 50 } : { limit: 50 }).then((d) => setRows(d.items)).catch(() => {});
  };
  useEffect(load, [status]);

  const act = (p) => p.then(load).catch((e) => alert(e.response?.data?.message || "Action failed"));
  if (err) return <section className="lf-page"><p className="lf-err">{err}</p></section>;

  return (
    <section className="lf-page">
      <h1>Admin dashboard</h1>
      {stats && (
        <div className="lf-stats">
          <div><b>{stats.total}</b>Reports</div>
          <div><b>{stats.byStatus.pending}</b>Pending</div>
          <div><b>{stats.byStatus.verified}</b>Verified</div>
          <div><b>{stats.byStatus.recovered}</b>Recovered</div>
          <div><b>{stats.users}</b>Users</div>
        </div>
      )}
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
      </select>
      <div className="lf-scroll">
        <table className="lf-table">
          <thead><tr><th>Title</th><th>Type</th><th>By</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id}>
                <td><Link to={`/items/${r._id}`}>{r.title}</Link></td>
                <td>{r.type}</td>
                <td>{r.reportedBy?.name || "-"}</td>
                <td>
                  <select value={r.status} onChange={(e) => act(itemService.admin.setStatus(r._id, e.target.value))}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  {r.status === "pending" && <button className="btn" onClick={() => act(itemService.admin.verify(r._id))}>Verify</button>}{" "}
                  {r.status !== "removed" && (
                    <button className="btn btn-ghost" onClick={() => { const why = prompt("Reason for removing?"); if (why !== null) act(itemService.admin.remove(r._id, why)); }}>Remove</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
