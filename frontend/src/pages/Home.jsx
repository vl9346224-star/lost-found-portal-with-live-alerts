import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const actions = [
  { to: "/report-lost", title: "I lost something", text: "Describe it and where you last saw it.", cls: "lost" },
  { to: "/report-found", title: "I found something", text: "Help the owner get it back.", cls: "found" },
  { to: "/search", title: "Search items", text: "Filter by category, place and date.", cls: "search" },
];

export default function Home() {
  const { user } = useAuth();
  return (
    <>
      <section className="hero">
        <h1>Hi {user.name.split(" ")[0]}.</h1>
        <p>What are you doing today?</p>
      </section>
      <section className="tiles">
        {actions.map((a) => (
          <Link key={a.to} to={a.to} className={`tile ${a.cls}`}>
            <h3>{a.title}</h3>
            <p>{a.text}</p>
          </Link>
        ))}
      </section>
      <section className="recent">
        <h2>Recent reports</h2>
        {/* Member 3 / 5: replace with real list from GET /api/search?limit=5 */}
        <p className="empty">No reports yet. When someone reports an item, it shows up here.</p>
      </section>
    </>
  );
}
