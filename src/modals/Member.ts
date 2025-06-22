import { Timestamp } from "firebase/firestore";

export interface Member {
  uid: string;
  role: 'admin' | 'member';
  joinedAt: Timestamp;
  displayName?: string;
  email?: string;
}
