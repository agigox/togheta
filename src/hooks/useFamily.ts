import { useEffect, useState, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { getDB } from '~/firebase';
import { useAuth } from '~/context/AuthContext';
import { Family } from '~/modals/Family';
import { Member } from '~/modals/Member';
import { 
  getFamily, 
  getFamilyMembers, 
  subscribeFamilyMembers,
  createFamily,
  syncUserToFirestore,
  updateUserFamilyId
} from '~/firebase/families';

interface UseFamilyReturn {
  family: Family | null;
  members: Member[];
  loading: boolean;
  error: string | null;
  createNewFamily: (familyName?: string) => Promise<void>;
  refreshFamily: () => Promise<void>;
}

export function useFamily(): UseFamilyReturn {
  const { user } = useAuth();
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const db = getDB();

  // Get user's family ID from Firestore user document
  const getUserFamilyId = useCallback(async (uid: string): Promise<string | null> => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data().familyId || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting user family ID:', error);
      return null;
    }
  }, [db]);

  // Create a new family for the user
  const createNewFamily = useCallback(async (familyName?: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be authenticated to create a family');
    }

    try {
      setLoading(true);
      setError(null);

      // Sync user to Firestore first
      await syncUserToFirestore({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || undefined,
      });

      // Create family and add user as admin
      const familyId = await createFamily(user.uid, familyName);
      
      // Update user's familyId
      await updateUserFamilyId(user.uid, familyId);
      
      // The useEffect will automatically refresh the family data
    } catch (err) {
      console.error('Error creating family:', err);
      setError(err instanceof Error ? err.message : 'Failed to create family');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh family data
  const refreshFamily = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get user's family ID
      const familyId = await getUserFamilyId(user.uid);
      
      if (!familyId) {
        setFamily(null);
        setMembers([]);
        setLoading(false);
        return;
      }

      // Get family data
      const familyData = await getFamily(familyId);
      setFamily(familyData);

      // Get family members
      const membersData = await getFamilyMembers(familyId);
      setMembers(membersData);

    } catch (err) {
      console.error('Error fetching family:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch family');
    } finally {
      setLoading(false);
    }
  }, [user, getUserFamilyId]);

  // Subscribe to family members changes
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const setupSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        // Sync user to Firestore if not exists
        await syncUserToFirestore({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || undefined,
        });

        // Wait a bit for AuthContext to finish family creation if needed
        let attempts = 0;
        let familyId: string | null = null;
        
        while (attempts < 10) { // Max 5 seconds
          familyId = await getUserFamilyId(user.uid);
          if (familyId) break;
          
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        if (!familyId) {
          console.log('No family found after waiting, user may need to create one');
          setFamily(null);
          setMembers([]);
          setLoading(false);
          return;
        }

        // Get family data
        const familyData = await getFamily(familyId);
        setFamily(familyData);

        // Subscribe to members changes
        unsubscribe = subscribeFamilyMembers(familyId, (membersData) => {
          setMembers(membersData);
          setLoading(false);
        });

      } catch (err) {
        console.error('Error setting up family subscription:', err);
        setError(err instanceof Error ? err.message : 'Failed to load family');
        setLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, getUserFamilyId]);

  return { 
    family, 
    members, 
    loading, 
    error,
    createNewFamily,
    refreshFamily
  };
}
