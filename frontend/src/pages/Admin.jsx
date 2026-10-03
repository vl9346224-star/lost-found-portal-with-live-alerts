import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { itemService, STATUSES } from "../services/itemService.js";
import "./pages.css";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("");   // status filter
  const [err, setErr] = useState("");         // page-level error

  // Load the numbers and the list of reports
  const load = () => {
    itemService.admin
      .stats()
      .then(setStats)
      .catch((e) => setErr(e.response?.data?.message || "Admin access only"));

    const params = status ? { status, limit: 50 } : { limit: 50 };
    itemService.admin
      .reports(params)
      .then((d) => setRows(d.items))
      .catch((e) => setErr(e.response?.data?.message || "Could not load reports"));
  };

  useEffect(() => { load(); }, [status]);

  // Run an admin action, then reload. Show an alert if it fails.
  const act = (promise) =>
    promise.then(load).catch((e) => alert(e.response?.data?.message || "Action failed"));

  // Remove a report (asks for a reason, which the reporter will see)
  const removeReport = (id) => {
    const reason = prompt("Reason for removing?");
    if (reason !== null) act(itemService.admin.remove(id, reason));
  };

  if (err) {
    return <section className="lf-page"><p className="lf-err">{err}</p></section>;
  }

  return (
    <section className="lf-page">
      <h1>Admin dashboard</h1>

      {/* Numbers */}
      {stats && (
        <div className="lf-stats">
          <div><b>{stats.total}</b>Reports</div>
          <div><b>{stats.byType.lost}</b>Lost</div>
          <div><b>{stats.byType.found}</b>Found</div>
          <div><b>{stats.byStatus.pending}</b>Pending</div>
          <div><b>{stats.byStatus.verified}</b>Verified</div>
          <div><b>{stats.byStatus.recovered}</b>Recovered</div>
          <div><b>{stats.byStatus.removed}</b>Removed</div>
          <div><b>{stats.users}</b>Users</div>
        </div>
      )}

      {/* Filter by status */}
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">All statuses</option>
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      {/* Reports table */}
      <div className="lf-scroll">
        <table className="lf-table">
          <thead>
            <tr><th>Title</th><th>Type</th><th>By</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id}>
                <td>
                  {/* Removed reports can't be opened, so show plain text */}
                  {r.status === "removed" ? r.title : <Link to={`/items/${r._id}`}>{r.title}</Link>}
                </td>
                <td>{r.type}</td>
                <td>{r.reportedBy?.name || "-"}</td>
                <td>
                  <select
                    value={r.status}
                    onChange={(e) => act(itemService.admin.setStatus(r._id, e.target.value))}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  {r.status === "pending" && (
                    <button className="btn" onClick={() => act(itemService.admin.verify(r._id))}>
                      Verify
                    </button>
                  )}{" "}
                  {r.status !== "removed" && (
                    <button className="btn btn-ghost" onClick={() => removeReport(r._id)}>
                      Remove
                    </button>
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