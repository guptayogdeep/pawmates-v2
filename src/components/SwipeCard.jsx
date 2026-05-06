import { useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { MapPin, Shield, Scissors, ChevronDown, ChevronUp } from "lucide-react";

export default function SwipeCard({ dog, onSwipeLeft, onSwipeRight }) {
  const [imgIndex, setImgIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  function handleDragEnd(_, info) {
    if (info.offset.x > 100) {
      animate(x, 500, { duration: 0.3 });
      setTimeout(onSwipeRight, 300);
    } else if (info.offset.x < -100) {
      animate(x, -500, { duration: 0.3 });
      setTimeout(onSwipeLeft, 300);
    } else {
      animate(x, 0, { duration: 0.3 });
    }
  }

  function cycleImage(e) {
    e.stopPropagation();
    setImgIndex((i) => (i + 1) % dog.images.length);
  }

  return (
    <motion.div
      className="swipe-card"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
    >
      <motion.div className="swipe-stamp like" style={{ opacity: likeOpacity }}>
        WOOF! 🐾
      </motion.div>
      <motion.div className="swipe-stamp nope" style={{ opacity: nopeOpacity }}>
        NOPE 🐾
      </motion.div>

      <div className="card-image" onClick={cycleImage}>
        <img src={dog.images[imgIndex]} alt={dog.name} draggable={false} />
        <div className="image-dots">
          {dog.images.map((_, i) => (
            <div key={i} className={`dot ${i === imgIndex ? "active" : ""}`} />
          ))}
        </div>
      </div>

      <div className={`card-info ${expanded ? "expanded" : ""}`}>
        <div className="card-header" onClick={() => setExpanded(!expanded)}>
          <div className="name-row">
            <h2>
              {dog.name}, {dog.age}
            </h2>
            <span className="breed">{dog.breed}</span>
          </div>
          <div className="meta-row">
            <span className="distance">
              <MapPin size={14} /> {dog.location}
            </span>
            <span className="size-tag">{dog.size}</span>
            {expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </div>
        </div>

        {expanded && (
          <div className="card-details">
            <p className="bio">{dog.bio}</p>
            <div className="personality-tags">
              {dog.personality.map((p) => (
                <span key={p} className="tag">
                  {p}
                </span>
              ))}
            </div>
            <div className="badges">
              {dog.vaccinated && (
                <span className="badge-item">
                  <Shield size={14} /> Vaccinated
                </span>
              )}
              {dog.neutered && (
                <span className="badge-item">
                  <Scissors size={14} /> Neutered
                </span>
              )}
            </div>
            <p className="owner-info">{dog.location}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
