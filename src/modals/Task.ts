export interface Task {
  id: string;
  title: string;
  completed: boolean; // Optional, default is false
  createdAt: Date; // Optional, default is current date
  familyId: string; // Optional, default is null
}
