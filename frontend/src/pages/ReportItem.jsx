import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { itemService, CATEGORIES } from "../services/itemService.js";
import "./pages.css";

export default function ReportItem({ type }) {
  const nav = useNavigate();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const item = await itemService.report(type, new FormData(e.target));
      nav(`/items/${item._id}`);
    } catch (ex) {
      setErr(ex.response?.data?.message || "Could not submit the report");
      setBusy(false);
    }
  };

  return (
    <section className="lf-page">
      <h1>Report {type} item</h1>
      <form className="lf-form" onSubmit={submit}>
        <label>Title<input name="title" required /></label>
        <label>Description<textarea name="description" required /></label>
        <label>Category
          <select name="category">{CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}</select>
        </label>
        <label>Location<input name="location" required /></label>
        <label>Date<input name="date" type="date" required /></label>
        <label>Contact info<input name="contactInfo" required /></label>
        <label>Photo (optional)<input name="image" type="file" accept="image/*" /></label>
        {err && <p className="lf-err">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? "Submitting..." : "Submit report"}</button>
      </form>
    </section>
  );
}
