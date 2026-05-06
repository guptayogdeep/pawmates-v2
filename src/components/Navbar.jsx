import { NavLink } from "react-router-dom";
import { Dog, MessageCircle, Heart, User } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Navbar() {
  const { matches } = useApp();
  const unread = matches.length;

  return (
    <nav className="navbar">
      <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
        <Dog size={24} />
        <span>Discover</span>
      </NavLink>
      <NavLink
        to="/matches"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        <div className="nav-icon-wrapper">
          <Heart size={24} />
          {unread > 0 && <span className="badge">{unread}</span>}
        </div>
        <span>Matches</span>
      </NavLink>
      <NavLink
        to="/messages"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        <MessageCircle size={24} />
        <span>Chat</span>
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        <User size={24} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
