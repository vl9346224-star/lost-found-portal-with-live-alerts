import { Link } from "react-router-dom";
import { imgUrl } from "../services/itemService.js";

export default function ItemCard({ item, children }) {
  return (
    <div className="lf-card">
      {item.imageUrl && <img src={imgUrl(item.imageUrl)} alt={item.title} loading="lazy" />}
      <div>
        <Link to={`/items/${item._id}`}><b>{item.title}</b></Link>
        <p className="muted">{item.type} · {item.category.replace("_", " ")} · {item.location}</p>
        <span className={`lf-badge ${item.status}`}>{item.status}</span>
        {children}
      </div>
    </div>
  );
}
