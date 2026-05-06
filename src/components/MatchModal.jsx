import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MatchModal({ match, onDismiss }) {
  const navigate = useNavigate();
  const { activePet } = useAuth();

  const dog = match.pet;

  return (
    <motion.div
      className="match-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="match-modal"
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 15 }}
      >
        <h1 className="match-title">It's a Match!</h1>
        <p className="match-subtitle">
          You and {dog.name} liked each other!
        </p>

        <div className="match-avatars">
          <div className="match-avatar">
            <img
              src={activePet?.images?.[0] || ""}
              alt={activePet?.name || "Your pet"}
            />
          </div>
          <div className="match-heart">🐾</div>
          <div className="match-avatar">
            <img src={dog.images[0]} alt={dog.name} />
          </div>
        </div>

        <div className="match-actions">
          <button
            className="btn-primary"
            onClick={() => {
              onDismiss();
              navigate(`/chat/${match.matchId}`);
            }}
          >
            Send a Woof!
          </button>
          <button className="btn-secondary" onClick={onDismiss}>
            Keep Sniffing
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
