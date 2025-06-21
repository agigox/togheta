import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  displayName: string;
  email: string;
  familyId: string | null;
  role: 'admin' | 'member';
  joinedAt: Timestamp;
}
