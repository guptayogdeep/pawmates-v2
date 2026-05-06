import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Messages() {
  const { matches, loading } = useApp();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(false);

  const hasMatches = !loading && matches.length > 0;

  useEffect(() => {
    if (!hasMatches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing stale data when no matches
      setConversations([]);
      return;
    }

    let cancelled = false;
    setLoadingConvos(true);

    async function load() {
      const convos = [];

      for (const match of matches) {
        try {
          const q = query(
            collection(db, `matches/${match.matchId}/messages`),
            orderBy("createdAt", "desc"),
            limit(1)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const lastMsg = snap.docs[0].data();
            convos.push({
              ...match,
              lastMessage: lastMsg.text,
              lastTime: lastMsg.createdAt?.toDate() || new Date(),
            });
          }
        } catch {
          // skip conversations that fail to load
        }
      }

      if (cancelled) return;

      convos.sort((a, b) => b.lastTime - a.lastTime);
      setConversations(convos);
      setLoadingConvos(false);
    }

    load();
    return () => { cancelled = true; };
  }, [matches, hasMatches]);

  if (loading || loadingConvos) {
    return (
      <div className="messages-page">
        <header className="page-header">
          <h1>Messages</h1>
        </header>
        <div className="loading-spinner-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <header className="page-header">
        <h1>Messages</h1>
      </header>

      {conversations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h2>No conversations yet</h2>
          <p>Match with a pup to start chatting!</p>
        </div>
      ) : (
        <div className="conversation-list">
          {conversations.map((convo) => (
            <div
              key={convo.matchId}
              className="conversation-item"
              onClick={() => navigate(`/chat/${convo.matchId}`)}
            >
              <img src={convo.pet.images[0]} alt={convo.pet.name} />
              <div className="convo-info">
                <h3>{convo.pet.name}</h3>
                <p className="last-message">{convo.lastMessage}</p>
              </div>
              <span className="convo-time">
                {convo.lastTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
