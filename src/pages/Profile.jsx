import { useState, useRef } from "react";
import { Camera, MapPin, Shield, Scissors, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updatePet } from "../lib/firestore";
import { uploadPetImage } from "../lib/storage";
import PetSwitcher from "../components/PetSwitcher";

export default function Profile() {
  const { user, activePet, activePetId, logout, refreshPets } = useAuth();
  const fileRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!activePet) {
    return (
      <div className="profile-page">
        <header className="page-header">
          <h1>My Profile</h1>
        </header>
        <div className="loading-spinner-container">
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  const pet = activePet;
  const images = pet.imageUrls || pet.images || [];

  function startEditing() {
    setForm({
      name: pet.name || "",
      breed: pet.breed || "",
      age: pet.age || 0,
      size: pet.size || "Medium",
      bio: pet.bio || "",
      location: pet.location || "",
    });
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updatePet(user.uid, activePetId, {
        name: form.name.trim(),
        breed: form.breed.trim(),
        age: Number(form.age) || 0,
        size: form.size,
        bio: form.bio.trim(),
        location: form.location.trim(),
      });
      await refreshPets();
      setEditing(false);
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPetImage(activePetId, file);
      await updatePet(user.uid, activePetId, {
        imageUrls: [url, ...images.slice(1)],
      });
      await refreshPets();
    } catch (err) {
      console.error("Failed to upload photo:", err);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="profile-page">
      <header className="page-header">
        <h1>My Profile</h1>
      </header>

      <PetSwitcher />

      <div className="profile-card">
        <div className="profile-image">
          {images[0] ? (
            <img src={images[0]} alt={pet.name} />
          ) : (
            <div className="photo-upload-placeholder" style={{ height: "100%" }}>
              <Camera size={32} />
              <span>No photo</span>
            </div>
          )}
          <button
            className="camera-btn"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <Camera size={18} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            hidden
          />
        </div>

        {editing ? (
          <div className="profile-form">
            <div className="form-group">
              <label>Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Breed</label>
              <input
                value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Size</label>
                <select
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
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
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Profile"}
            </button>
            <button className="btn-secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="profile-details">
            <h2>
              {pet.name}, {pet.age}
            </h2>
            <p className="profile-breed">{pet.breed}</p>
            <p className="profile-location">
              <MapPin size={14} /> {pet.location}
            </p>
            <p className="profile-bio">{pet.bio}</p>
            <div className="personality-tags">
              {pet.personality?.map((p) => (
                <span key={p} className="tag">
                  {p}
                </span>
              ))}
            </div>
            <div className="badges">
              {pet.vaccinated && (
                <span className="badge-item">
                  <Shield size={14} /> Vaccinated
                </span>
              )}
              {pet.neutered && (
                <span className="badge-item">
                  <Scissors size={14} /> Neutered
                </span>
              )}
            </div>
            <button className="btn-primary" onClick={startEditing}>
              Edit Profile
            </button>
          </div>
        )}
      </div>

      <div style={{ padding: "16px" }}>
        <button className="btn-danger" onClick={logout}>
          <LogOut size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
          Log Out
        </button>
      </div>
    </div>
  );
}
