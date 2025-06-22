import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { getDB } from '~/firebase';
import { useAuth } from '~/context/AuthContext';

export function useUserFamily() {
  const { user, isAuthenticated } = useAuth();
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('👤 useUserFamily effect triggered:', { 
      hasUser: !!user, 
      userUid: user?.uid,
      isAuthenticated 
    });
    
    if (!user || !isAuthenticated) {
      console.log('👤 No user or not authenticated, setting familyId to null');
      setFamilyId(null);
      setLoading(false);
      return;
    }

    console.log('👤 Setting up Firestore listener for user:', user.uid);
    setLoading(true);
    setError(null);

    const db = getDB();
    const userRef = doc(db, 'users', user.uid);
    
    // Set up real-time listener for user document changes
    const unsubscribe = onSnapshot(
      userRef,
      (userSnap) => {
        console.log('👤 User document snapshot:', {
          exists: userSnap.exists(),
          data: userSnap.exists() ? userSnap.data() : null
        });
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const userFamilyId = userData.familyId || null;
          console.log('👤 Setting familyId from Firestore:', userFamilyId);
          setFamilyId(userFamilyId);
        } else {
          // User document doesn't exist, they need onboarding
          console.log('👤 User document does not exist, setting familyId to null');
          setFamilyId(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to user family changes:', err);
        setError(err instanceof Error ? err.message : 'Failed to check family status');
        setFamilyId(null);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isAuthenticated]);

  return {
    familyId,
    hasFamilyId: familyId !== null,
    loading,
    error
  };
}
