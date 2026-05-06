import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";

export default function AuthNavbar() {
  const { user, pets } = useAuth();

  if (!user || pets.length === 0) return null;

  return <Navbar />;
}
