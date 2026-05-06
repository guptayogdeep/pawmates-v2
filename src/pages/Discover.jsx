import { X, Heart } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import SwipeCard from "../components/SwipeCard";
import MatchModal from "../components/MatchModal";
import { useApp } from "../context/AppContext";

export default function Discover() {
  const { currentDog, swipeLeft, swipeRight, showMatch, dismissMatch, loading } =
    useApp();

  if (loading) {
    return (
      <div className="discover-page">
        <header className="page-header">
          <h1 className="logo">
            Paw<span>Mates</span>
          </h1>
        </header>
        <div className="loading-spinner-container" style={{ flex: 1 }}>
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (!currentDog) {
    return (
      <div className="discover-page">
        <header className="page-header">
          <h1 className="logo">
            Paw<span>Mates</span>
          </h1>
        </header>
        <div className="empty-state">
          <div className="empty-icon">🐕</div>
          <h2>No more pups nearby!</h2>
          <p>Check back later for new furry friends.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="discover-page">
      <header className="page-header">
        <h1 className="logo">
          Paw<span>Mates</span>
        </h1>
      </header>

      <div className="card-container">
        <AnimatePresence mode="wait">
          <SwipeCard
            key={currentDog.id}
            dog={currentDog}
            onSwipeLeft={swipeLeft}
            onSwipeRight={swipeRight}
          />
        </AnimatePresence>
      </div>

      <div className="action-buttons">
        <button className="action-btn pass" onClick={swipeLeft}>
          <X size={28} />
        </button>
        <button className="action-btn like" onClick={swipeRight}>
          <Heart size={28} />
        </button>
      </div>

      <AnimatePresence>
        {showMatch && (
          <MatchModal match={showMatch} onDismiss={dismissMatch} />
        )}
      </AnimatePresence>
    </div>
  );
}
