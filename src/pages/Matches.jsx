import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Matches() {
  const { matches, loading } = useApp();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="matches-page">
        <header className="page-header">
          <h1>Your Matches</h1>
        </header>
        <div className="loading-spinner-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="matches-page">
      <header className="page-header">
        <h1>Your Matches</h1>
      </header>

      {matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💔</div>
          <h2>No matches yet</h2>
          <p>Keep swiping to find your pup's perfect playmate!</p>
        </div>
      ) : (
        <div className="matches-grid">
          {matches.map((match) => (
            <div
              key={match.matchId}
              className="match-card"
              onClick={() => navigate(`/chat/${match.matchId}`)}
            >
              <img src={match.pet.images[0]} alt={match.pet.name} />
              <div className="match-card-info">
                <h3>{match.pet.name}</h3>
                <p>{match.pet.breed}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
