import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";

function normalizePet(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    images: data.imageUrls || [],
  };
}

// ---- Pets ----

export async function createPet(userId, petData) {
  const batch = writeBatch(db);
  const petRef = doc(collection(db, "pets"));
  const petId = petRef.id;

  const petDoc = {
    ...petData,
    createdAt: serverTimestamp(),
  };

  const publicDoc = {
    ...petDoc,
    ownerId: userId,
  };

  batch.set(doc(db, `users/${userId}/pets/${petId}`), petDoc);
  batch.set(petRef, publicDoc);
  batch.update(doc(db, "users", userId), { activePetId: petId });

  await batch.commit();
  return petId;
}

export async function fetchUserPets(userId) {
  const snap = await getDocs(collection(db, `users/${userId}/pets`));
  return snap.docs.map(normalizePet);
}

export async function fetchPetById(petId) {
  const snap = await getDoc(doc(db, "pets", petId));
  if (!snap.exists()) return null;
  return normalizePet(snap);
}

export async function updatePet(userId, petId, data) {
  const batch = writeBatch(db);
  batch.update(doc(db, `users/${userId}/pets/${petId}`), data);
  batch.update(doc(db, "pets", petId), data);
  await batch.commit();
}

// ---- Discovery ----

export async function fetchDiscoveryPets(excludeOwnerId) {
  const snap = await getDocs(collection(db, "pets"));
  return snap.docs
    .map(normalizePet)
    .filter((pet) => pet.ownerId !== excludeOwnerId);
}

export async function fetchSwipedPetIds(fromPetId) {
  const q = query(
    collection(db, "swipes"),
    where("fromPetId", "==", fromPetId)
  );
  const snap = await getDocs(q);
  return new Set(snap.docs.map((d) => d.data().toPetId));
}

export async function recordSwipe(fromPetId, toPetId, direction, fromUserId, toUserId) {
  return addDoc(collection(db, "swipes"), {
    fromPetId,
    toPetId,
    direction,
    fromUserId,
    toUserId,
    createdAt: serverTimestamp(),
  });
}

export async function checkForMatch(fromPetId, toPetId) {
  const q = query(
    collection(db, "swipes"),
    where("fromPetId", "==", toPetId),
    where("toPetId", "==", fromPetId),
    where("direction", "==", "like")
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function createMatch(petId1, petId2, userId1, userId2) {
  return addDoc(collection(db, "matches"), {
    petIds: [petId1, petId2],
    userIds: [userId1, userId2],
    createdAt: serverTimestamp(),
  });
}

// ---- Matches ----

export async function fetchUserMatches(userId) {
  const q = query(
    collection(db, "matches"),
    where("userIds", "array-contains", userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ matchId: d.id, ...d.data() }));
}

// ---- Messages ----

export async function sendMessageToMatch(matchId, fromPetId, text) {
  return addDoc(collection(db, `matches/${matchId}/messages`), {
    from: fromPetId,
    text,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToMessages(matchId, callback) {
  const q = query(
    collection(db, `matches/${matchId}/messages`),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      time: d.data().createdAt?.toDate() || new Date(),
    }));
    callback(msgs);
  });
}
