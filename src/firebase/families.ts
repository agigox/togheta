import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  updateDoc,
  deleteDoc,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import { getDB } from '~/firebase';
import { Family } from '~/modals/Family';
import { Member } from '~/modals/Member';
import { User } from '~/modals/User';

const db = getDB();

/**
 * Generate a random 6-character invite code
 */
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Create a new family and set the creator as admin
 */
export async function createFamily(creatorUid: string, familyName?: string): Promise<string> {
  try {
    // Create family document
    const familyRef = doc(collection(db, 'families'));
    const familyId = familyRef.id;

    
    const familyData: Omit<Family, 'id'> = {
      name: familyName || `${creatorUid.substring(0, 8)}'s Family`,
      createdBy: creatorUid,
      createdAt: Timestamp.now(),
      inviteCode: generateInviteCode(),
    };
    
    await setDoc(familyRef, familyData);
    
    // Add creator as admin member
    await addMemberToFamily(familyId, creatorUid, 'admin');
    
    return familyId;
  } catch (error) {
    console.error('Error creating family:', error);
    throw error;
  }
}

/**
 * Add a member to a family
 */
export async function addMemberToFamily(
  familyId: string, 
  uid: string, 
  role: 'admin' | 'member' = 'member'
): Promise<void> {
  try {
    const memberRef = doc(db, 'families', familyId, 'members', uid);
    const memberData: Member = {
      uid,
      role,
      joinedAt: Timestamp.now(),
    };
    
    await setDoc(memberRef, memberData);
  } catch (error) {
    console.error('Error adding member to family:', error);
    throw error;
  }
}

/**
 * Update user's familyId in users collection
 */
export async function updateUserFamilyId(uid: string, familyId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { familyId });
  } catch (error) {
    console.error('Error updating user familyId:', error);
    throw error;
  }
}

/**
 * Sync user to Firestore users collection
 */
export async function syncUserToFirestore(user: {
  uid: string;
  email: string;
  displayName?: string;
}, familyId?: string): Promise<void> {
  try {
    console.log('Syncing user to Firestore:', user.email);
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    // Get existing data if document exists
    const existingData = userDoc.exists() ? userDoc.data() : null;
    
    const userData: User = {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email,
      // Preserve existing familyId if no new one is provided
      familyId: familyId !== undefined ? familyId : (existingData?.familyId || null),
      role: existingData?.role || 'member',
      joinedAt: existingData?.joinedAt || Timestamp.now(),
    };
    
    await setDoc(userRef, userData, { merge: true });
    console.log('User synced successfully. FamilyId:', userData.familyId);
  } catch (error) {
    console.error('Error syncing user to Firestore:', error);
    throw error;
  }
}

/**
 * Get family data
 */
export async function getFamily(familyId: string): Promise<Family | null> {
  try {
    const familyRef = doc(db, 'families', familyId);
    const familySnap = await getDoc(familyRef);
    
    if (familySnap.exists()) {
      return { id: familySnap.id, ...familySnap.data() } as Family;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting family:', error);
    throw error;
  }
}

/**
 * Get family members from subcollection
 */
export async function getFamilyMembers(familyId: string): Promise<Member[]> {
  try {
    const membersRef = collection(db, 'families', familyId, 'members');
    const membersSnap = await getDocs(membersRef);
    
    const members: Member[] = [];
    
    // Get member details from users collection
    for (const memberDoc of membersSnap.docs) {
      const memberData = memberDoc.data() as Member;
      
      // Enrich with user data
      const userRef = doc(db, 'users', memberData.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        members.push({
          ...memberData,
          displayName: userData.displayName,
          email: userData.email,
        });
      } else {
        members.push(memberData);
      }
    }
    
    return members;
  } catch (error) {
    console.error('Error getting family members:', error);
    throw error;
  }
}

/**
 * Subscribe to family members changes
 */
export function subscribeFamilyMembers(
  familyId: string, 
  callback: (members: Member[]) => void
): () => void {
  const membersRef = collection(db, 'families', familyId, 'members');
  
  return onSnapshot(membersRef, async (snapshot) => {
    try {
      const members: Member[] = [];
      
      for (const memberDoc of snapshot.docs) {
        const memberData = memberDoc.data() as Member;
        
        // Enrich with user data
        try {
          const userRef = doc(db, 'users', memberData.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            members.push({
              ...memberData,
              displayName: userData.displayName,
              email: userData.email,
            });
          } else {
            members.push(memberData);
          }
        } catch (userError) {
          console.error('Error fetching user data for member:', memberData.uid, userError);
          // Add member without enriched data
          members.push(memberData);
        }
      }
      
      callback(members);
    } catch (error) {
      console.error('Error processing family members snapshot:', error);
      callback([]); // Return empty array on error
    }
  }, (error) => {
    console.error('Error subscribing to family members:', error);
    callback([]); // Return empty array on error
  });
}

/**
 * Remove member from family
 */
export async function removeMemberFromFamily(familyId: string, uid: string): Promise<void> {
  try {
    const memberRef = doc(db, 'families', familyId, 'members', uid);
    await deleteDoc(memberRef);
    
    // Update user's familyId to null
    await updateUserFamilyId(uid, '');
  } catch (error) {
    console.error('Error removing member from family:', error);
    throw error;
  }
}

/**
 * Update family details
 */
export async function updateFamily(familyId: string, updates: Partial<Family>): Promise<void> {
  try {
    const familyRef = doc(db, 'families', familyId);
    await updateDoc(familyRef, updates);
  } catch (error) {
    console.error('Error updating family:', error);
    throw error;
  }
}
