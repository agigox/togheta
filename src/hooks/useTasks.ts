import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { getDB } from '../firebase/index';

type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  familyId: string;
};

export function useTasks(familyId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!familyId) return;

    const db = getDB();
    // Remove orderBy to avoid composite index requirement
    const q = query(collection(db, 'tasks'), where('familyId', '==', familyId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const newTasks: Task[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Task, 'id'>),
            createdAt: docSnap.data().createdAt?.toDate?.() ?? new Date(),
          }));

          // Sort on client side - newest first
          const sortedTasks = newTasks.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });

          setTasks(sortedTasks);
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error('Error processing tasks:', err);
          setError('Failed to process tasks');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error listening to tasks:', err);
        setError('Failed to load tasks');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [familyId]);

  const addTask = async (title: string) => {
    if (!title.trim()) return;

    const db = getDB();
    await addDoc(collection(db, 'tasks'), {
      title: title.trim(),
      completed: false,
      familyId,
      createdAt: serverTimestamp(),
    });
  };

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    const db = getDB();
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      completed: !currentStatus,
    });
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    toggleTask,
  };
}
