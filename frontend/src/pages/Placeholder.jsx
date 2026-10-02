export default function Placeholder({ title, owner }) {
  return (
    <section className="placeholder">
      <h1>{title}</h1>
      <p className="muted">Not built yet. {owner} replaces this page.</p>
    </section>
  );
}
