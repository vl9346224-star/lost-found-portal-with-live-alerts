export default function Field({ label, error, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} aria-invalid={!!error} />
      {error && <small className="err">{error}</small>}
    </label>
  );
}
