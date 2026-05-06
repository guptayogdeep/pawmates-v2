import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { subscribeToMessages, sendMessageToMatch } from "../lib/firestore";

export default function Chat() {
  const { id: matchId } = useParams();
  const navigate = useNavigate();
  const { matches } = useApp();
  const { activePetId } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const bottomRef = useRef(null);

  const match = matches.find((m) => m.matchId === matchId);
  const dog = match?.pet;

  useEffect(() => {
    if (!matchId) return;

    const unsubscribe = subscribeToMessages(matchId, (msgs) => {
      setMessages(msgs);
      setLoadingMsgs(false);
    });

    return unsubscribe;
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!dog) {
    return (
      <div className="empty-state">
        <h2>Conversation not found</h2>
        <button className="btn-primary" onClick={() => navigate("/messages")}>
          Back to messages
        </button>
      </div>
    );
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const msg = text.trim();
    setText("");
    await sendMessageToMatch(matchId, activePetId, msg);
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <button className="back-btn" onClick={() => navigate("/messages")}>
          <ArrowLeft size={22} />
        </button>
        <img src={dog.images[0]} alt={dog.name} className="chat-avatar" />
        <div>
          <h2>{dog.name}</h2>
          <span className="chat-breed">{dog.breed}</span>
        </div>
      </header>

      <div className="chat-messages">
        {loadingMsgs ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner" />
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble ${msg.from === activePetId ? "sent" : "received"}`}
            >
              <p>{msg.text}</p>
              <span className="bubble-time">
                {msg.time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a woof..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" disabled={!text.trim()}>
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
