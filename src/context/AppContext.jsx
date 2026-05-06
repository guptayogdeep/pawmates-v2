import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import {
  fetchDiscoveryPets,
  fetchSwipedPetIds,
  recordSwipe,
  checkForMatch,
  createMatch,
  fetchUserMatches,
  fetchPetById,
} from "../lib/firestore";

const AppContext = createContext();

export function AppProvider({ children }) {
  const { user, activePetId } = useAuth();

  const [discoveryPets, setDiscoveryPets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [showMatch, setShowMatch] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const uid = user?.uid;
  const hasAuth = Boolean(uid && activePetId);
  const loading = hasAuth && !dataLoaded;

  const currentDog = discoveryPets[currentIndex] || null;
  const userRef = useRef(user);
  const activePetRef = useRef(activePetId);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    activePetRef.current = activePetId;
  }, [activePetId]);

  useEffect(() => {
    if (!hasAuth) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting state when auth is lost
      setDiscoveryPets([]);
      setMatches([]);
      setDataLoaded(false);
      return;
    }

    let cancelled = false;
    setDataLoaded(false);

    async function load() {
      try {
        const [allPets, swipedIds, rawMatches] = await Promise.all([
          fetchDiscoveryPets(uid),
          fetchSwipedPetIds(activePetId),
          fetchUserMatches(uid),
        ]);

        if (cancelled) return;

        setDiscoveryPets(allPets.filter((p) => !swipedIds.has(p.id)));
        setCurrentIndex(0);

        const enrichedMatches = await Promise.all(
          rawMatches.map(async (m) => {
            const otherPetId = m.petIds.find((id) => id !== activePetId) || m.petIds[0];
            const pet = await fetchPetById(otherPetId);
            return { ...m, pet };
          })
        );

        if (!cancelled) {
          setMatches(enrichedMatches.filter((m) => m.pet));
          setDataLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load app data:", err);
        if (!cancelled) setDataLoaded(true);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [uid, activePetId, refreshKey, hasAuth]);

  const refreshData = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const swipeRight = useCallback(async () => {
    if (!currentDog || !userRef.current || !activePetRef.current) return;

    const toPetId = currentDog.id;
    const toUserId = currentDog.ownerId;
    const currentUid = userRef.current.uid;
    const petId = activePetRef.current;

    setCurrentIndex((prev) => prev + 1);

    try {
      await recordSwipe(petId, toPetId, "like", currentUid, toUserId);

      const isMatch = await checkForMatch(petId, toPetId);
      if (isMatch) {
        const matchRef = await createMatch(petId, toPetId, currentUid, toUserId);
        const newMatch = {
          matchId: matchRef.id,
          petIds: [petId, toPetId],
          userIds: [currentUid, toUserId],
          pet: currentDog,
        };
        setMatches((prev) => [...prev, newMatch]);
        setShowMatch(newMatch);
      }
    } catch (err) {
      console.error("Swipe right failed:", err);
    }
  }, [currentDog]);

  const swipeLeft = useCallback(async () => {
    if (!currentDog || !userRef.current || !activePetRef.current) return;

    setCurrentIndex((prev) => prev + 1);

    try {
      await recordSwipe(
        activePetRef.current,
        currentDog.id,
        "pass",
        userRef.current.uid,
        currentDog.ownerId
      );
    } catch (err) {
      console.error("Swipe left failed:", err);
    }
  }, [currentDog]);

  const dismissMatch = useCallback(() => {
    setShowMatch(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        discoveryPets,
        currentDog,
        currentIndex,
        matches,
        showMatch,
        loading,
        swipeRight,
        swipeLeft,
        dismissMatch,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);
