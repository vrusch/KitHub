import { useState, useEffect } from "react";
import { auth } from "../config/firebase";
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken,
} from "firebase/auth";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [manualDataUid, setManualDataUid] = useState(null);

  const activeUid = manualDataUid || user?.uid;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) setLoading(false);
    });

    const initAuth = async () => {
      try {
        await auth.authStateReady();
        if (!auth.currentUser) {
          if (
            typeof __initial_auth_token !== "undefined" &&
            __initial_auth_token
          )
            await signInWithCustomToken(auth, __initial_auth_token);
          else await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth Error:", e);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
    return () => unsubAuth();
  }, []);

  return { user, loading, isOnline, activeUid, setManualDataUid };
};