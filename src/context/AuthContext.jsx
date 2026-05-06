import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const [activePetId, setActivePetIdState] = useState(null);

  const refreshPets = useCallback(async (uid) => {
    const snap = await getDocs(collection(db, `users/${uid}/pets`));
    const petList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setPets(petList);
    return petList;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setActivePetIdState(userDoc.data().activePetId || null);
        }
        await refreshPets(firebaseUser.uid);
      } else {
        setPets([]);
        setActivePetIdState(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [refreshPets]);

  const signup = useCallback(async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      createdAt: serverTimestamp(),
    });
    return cred.user;
  }, []);

  const login = useCallback(async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }, []);

  const logout = useCallback(() => signOut(auth), []);

  const setActivePet = useCallback(
    async (petId) => {
      setActivePetIdState(petId);
      if (user) {
        await updateDoc(doc(db, "users", user.uid), { activePetId: petId });
      }
    },
    [user]
  );

  const activePet = pets.find((p) => p.id === activePetId) || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        pets,
        activePetId,
        activePet,
        signup,
        login,
        logout,
        setActivePet,
        refreshPets: () => user && refreshPets(user.uid),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
