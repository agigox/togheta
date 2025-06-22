import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { doc, onSnapshot } from 'firebase/firestore';
import { getDB } from '~/firebase';
import { Family } from '~/modals/Family';
import { Member } from '~/modals/Member';
import { 
  createFamily, 
  getFamily, 
  getFamilyMembers,
  joinFamilyWithCode,
} from '~/firebase/families';

interface FamilyState {
  // User family relationship
  familyId: string | null;
  hasFamilyId: boolean;
  
  // Family data
  family: Family | null;
  members: Member[];
  
  // Loading states
  loading: boolean;
  familyLoading: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  setFamilyId: (familyId: string | null) => void;
  setFamily: (family: Family | null) => void;
  setMembers: (members: Member[]) => void;
  setLoading: (loading: boolean) => void;
  setFamilyLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Family operations
  createNewFamily: (familyName?: string, userId?: string) => Promise<void>;
  joinFamily: (inviteCode: string, userId?: string) => Promise<void>;
  loadFamily: (familyId: string) => Promise<void>;
  subscribeToUserFamily: (userId: string) => () => void;
  reset: () => void;
}

export const useFamilyStore = create<FamilyState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      familyId: null,
      hasFamilyId: false,
      family: null,
      members: [],
      loading: false, // Start as false, only set to true when actively checking
      familyLoading: false,
      error: null,

      // Basic setters
      setFamilyId: (familyId) => {
        console.log('👤 Setting familyId in store:', familyId);
        set({ 
          familyId, 
          hasFamilyId: familyId !== null,
          loading: false 
        });
      },
      
      setFamily: (family) => set({ family }),
      setMembers: (members) => set({ members }),
      setLoading: (loading) => set({ loading }),
      setFamilyLoading: (familyLoading) => set({ familyLoading }),
      setError: (error) => set({ error }),

      // Subscribe to user's familyId changes
      subscribeToUserFamily: (userId) => {
        console.log('👤 Setting up Firestore listener for user in store:', userId);
        set({ loading: true, error: null });

        const db = getDB();
        const userRef = doc(db, 'users', userId);
        
        const unsubscribe = onSnapshot(
          userRef,
          (userSnap) => {
            console.log('👤 User document snapshot in store:', {
              exists: userSnap.exists(),
              data: userSnap.exists() ? userSnap.data() : null
            });
            
            if (userSnap.exists()) {
              const userData = userSnap.data();
              const userFamilyId = userData.familyId || null;
              console.log('👤 Setting familyId from Firestore in store:', userFamilyId);
              set({ 
                familyId: userFamilyId, 
                hasFamilyId: userFamilyId !== null,
                loading: false 
              });
            } else {
              // User document doesn't exist, they need onboarding
              console.log('👤 User document does not exist in store, setting familyId to null');
              set({ 
                familyId: null, 
                hasFamilyId: false,
                loading: false 
              });
            }
          },
          (err) => {
            console.error('Error listening to user family changes in store:', err);
            set({
              error: err instanceof Error ? err.message : 'Failed to check family status',
              familyId: null,
              hasFamilyId: false,
              loading: false
            });
          }
        );

        return unsubscribe;
      },

      // Create a new family
      createNewFamily: async (familyName = 'My Family', userId) => {
        if (!userId) {
          throw new Error('User ID is required to create a family');
        }
        
        set({ familyLoading: true, error: null });
        try {
          console.log('🏠 Creating new family in store:', familyName);
          const newFamilyId = await createFamily(userId, familyName);
          
          set({ 
            familyId: newFamilyId,
            hasFamilyId: true,
            familyLoading: false 
          });
          
          console.log('✅ Family created successfully in store:', newFamilyId);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create family';
          console.error('❌ Failed to create family in store:', errorMessage);
          set({ 
            error: errorMessage,
            familyLoading: false 
          });
          throw error;
        }
      },

      // Join a family with invite code
      joinFamily: async (inviteCode, userId) => {
        if (!userId) {
          throw new Error('User ID is required to join a family');
        }
        
        set({ familyLoading: true, error: null });
        try {
          console.log('🔗 Joining family with code in store:', inviteCode);
          const joinedFamilyId = await joinFamilyWithCode(userId, inviteCode);
          
          set({ 
            familyId: joinedFamilyId,
            hasFamilyId: true,
            familyLoading: false 
          });
          
          console.log('✅ Joined family successfully in store:', joinedFamilyId);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to join family';
          console.error('❌ Failed to join family in store:', errorMessage);
          set({ 
            error: errorMessage,
            familyLoading: false 
          });
          throw error;
        }
      },

      // Load family data
      loadFamily: async (familyId) => {
        set({ familyLoading: true, error: null });
        try {
          const [family, members] = await Promise.all([
            getFamily(familyId),
            getFamilyMembers(familyId)
          ]);
          
          set({ 
            family, 
            members, 
            familyLoading: false 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load family';
          set({ 
            error: errorMessage,
            familyLoading: false 
          });
        }
      },

      // Reset all state
      reset: () => {
        console.log('🔄 Resetting family store state');
        set({
          familyId: null,
          hasFamilyId: false,
          family: null,
          members: [],
          loading: false, // Set to false when resetting
          familyLoading: false,
          error: null
        });
        console.log('✅ Family store state reset complete');
      },
    })),
    {
      name: 'family-store',
    }
  )
);
