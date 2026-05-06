import { useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createPet } from "../lib/firestore";
import { uploadPetImage } from "../lib/storage";

const PERSONALITY_OPTIONS = [
  "Playful", "Friendly", "Energetic", "Chill", "Cuddly", "Vocal",
  "Independent", "Loyal", "Smart", "Adventurous", "Gentle", "Bold",
];

export default function Onboarding() {
  const { user, pets, loading, refreshPets } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    breed: "",
    age: "",
    gender: "Male",
    size: "Medium",
    bio: "",
    personality: [],
    location: "",
    vaccinated: false,
    neutered: false,
  });

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (pets.length >= 3) return <Navigate to="/profile" replace />;

  const isFirstPet = pets.length === 0;

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function togglePersonality(tag) {
    setForm((prev) => ({
      ...prev,
      personality: prev.personality.includes(tag)
        ? prev.personality.filter((t) => t !== tag)
        : prev.personality.length < 5
          ? [...prev.personality, tag]
          : prev.personality,
    }));
  }

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.breed.trim()) {
      setError("Name and breed are required");
      return;
    }

    if (form.personality.length === 0) {
      setError("Select at least one personality trait");
      return;
    }

    setSubmitting(true);
    try {
      const tempId = `temp_${Date.now()}`;
      let imageUrls = [];

      if (photo) {
        const url = await uploadPetImage(tempId, photo);
        imageUrls = [url];
      }

      const petData = {
        name: form.name.trim(),
        breed: form.breed.trim(),
        age: Number(form.age) || 1,
        gender: form.gender,
        size: form.size,
        bio: form.bio.trim(),
        personality: form.personality,
        location: form.location.trim(),
        vaccinated: form.vaccinated,
        neutered: form.neutered,
        imageUrls,
      };

      await createPet(user.uid, petData);
      await refreshPets();
      navigate(isFirstPet ? "/" : "/profile", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="onboarding-page">
      <header className="page-header">
        <h1>{isFirstPet ? "Create Your Pet's Profile" : "Add Another Pet"}</h1>
      </header>

      <form className="onboarding-form" onSubmit={handleSubmit}>
        <div
          className="photo-upload"
          onClick={() => fileRef.current?.click()}
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Preview" className="photo-upload-preview" />
          ) : (
            <div className="photo-upload-placeholder">
              <Camera size={32} />
              <span>Add Photo</span>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            hidden
          />
        </div>

        <div className="form-group">
          <label>Name</label>
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="What's your pet's name?"
            required
          />
        </div>

        <div className="form-group">
          <label>Breed</label>
          <input
            value={form.breed}
            onChange={(e) => handleChange("breed", e.target.value)}
            placeholder="e.g. Golden Retriever"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              min={0}
              max={30}
              value={form.age}
              onChange={(e) => handleChange("age", e.target.value)}
              placeholder="Years"
            />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select
              value={form.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
            >
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>
          <div className="form-group">
            <label>Size</label>
            <select
              value={form.size}
              onChange={(e) => handleChange("size", e.target.value)}
            >
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Tell others about your pet's personality..."
          />
        </div>

        <div className="form-group">
          <label>Personality (pick up to 5)</label>
          <div className="tag-selector">
            {PERSONALITY_OPTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`tag-option ${form.personality.includes(tag) ? "selected" : ""}`}
                onClick={() => togglePersonality(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="e.g. Brooklyn, NY"
          />
        </div>

        <div className="toggle-row">
          <label className="toggle-group">
            <input
              type="checkbox"
              checked={form.vaccinated}
              onChange={(e) => handleChange("vaccinated", e.target.checked)}
            />
            <span>Vaccinated</span>
          </label>
          <label className="toggle-group">
            <input
              type="checkbox"
              checked={form.neutered}
              onChange={(e) => handleChange("neutered", e.target.checked)}
            />
            <span>Neutered / Spayed</span>
          </label>
        </div>

        {error && <p className="auth-error">{error}</p>}

        {!isFirstPet && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/profile")}
          >
            Cancel
          </button>
        )}

        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Creating profile..." : "Create Profile"}
        </button>
      </form>
    </div>
  );
}
