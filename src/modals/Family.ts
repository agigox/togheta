import { Timestamp } from "firebase/firestore";

export interface Family {
  id: string;
  name?: string;
  createdBy: string; // uid of creator
  createdAt: Timestamp;
  inviteCode: string; // for joining via code
}
