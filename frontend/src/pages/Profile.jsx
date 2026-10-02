import { useState } from "react";
import Field from "../components/Field.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, phone: user.phone || "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (ev) => {
    ev.preventDefault();
    setErr(""); setMsg("");
    if (form.name.trim().length < 2) return setErr("Enter your full name.");
    if (form.phone && !/^\d{10}$/.test(form.phone)) return setErr("Phone must be 10 digits.");
    setBusy(true);
    try {
      await updateProfile(form);
      setMsg("Changes saved.");
      setEditing(false);
    } catch (e) {
      setErr(e.response?.data?.message || "Couldn't save. Try again.");
    } finally { setBusy(false); }
  };

  return (
    <section className="profile">
      <div className="profile-head">
        <div className="avatar big">{user.name[0].toUpperCase()}</div>
        <div>
          <h1>{user.name}</h1>
          <p className="muted">{user.role === "admin" ? "Admin" : "Student"}</p>
        </div>
      </div>

      {!editing ? (
        <>
          <dl className="details">
            <div><dt>Email</dt><dd>{user.email}</dd></div>
            <div><dt>Roll number</dt><dd>{user.rollNumber || "—"}</dd></div>
            <div><dt>Phone</dt><dd>{user.phone || "Not added"}</dd></div>
          </dl>
          {msg && <p className="banner-ok" role="status">{msg}</p>}
          <button className="btn btn-primary" onClick={() => { setMsg(""); setEditing(true); }}>Edit profile</button>
        </>
      ) : (
        <form onSubmit={save} noValidate className="profile-form">
          <Field label="Full name" value={form.name} onChange={set("name")} />
          <Field label="Phone" inputMode="numeric" value={form.phone} onChange={set("phone")} />
          {err && <p className="banner-err" role="alert">{err}</p>}
          <div className="row-btns">
            <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      )}
    </section>
  );
}
