import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function PetSwitcher() {
  const { pets, activePetId, setActivePet } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="pet-switcher">
      {pets.map((pet) => (
        <div
          key={pet.id}
          className={`pet-switcher-item ${pet.id === activePetId ? "active" : ""}`}
          onClick={() => setActivePet(pet.id)}
        >
          <img
            src={pet.imageUrls?.[0] || pet.images?.[0] || ""}
            alt={pet.name}
            className="pet-switcher-avatar"
          />
          <span className="pet-switcher-name">{pet.name}</span>
        </div>
      ))}
      <button
        className="pet-switcher-add"
        disabled={pets.length >= 3}
        onClick={() => navigate("/onboarding")}
        title={pets.length >= 3 ? "Maximum 3 pets" : "Add another pet"}
      >
        <Plus size={22} />
      </button>
    </div>
  );
}
