import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
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
    if (!familyId) {
      setLoading(false);
      return;
    }

    const db = getDB();
    // Remove orderBy to avoid composite index requirement
    const q = query(collection(db, 'tasks'), where('familyId', '==', familyId));

    // Add retry logic for permission errors
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 1000; // 1 second

    const setupSubscription = () => {
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
            retryCount = 0; // Reset retry count on success
          } catch (err) {
            console.error('Error processing tasks:', err);
            setError('Failed to process tasks');
            setLoading(false);
          }
        },
        (err) => {
          console.error('Error listening to tasks:', err);
          
          // Check if it's a permission error and we haven't exceeded retry limit
          if (err.code === 'permission-denied' && retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying task subscription (attempt ${retryCount}/${maxRetries}) in ${retryDelay}ms...`);
            
            setTimeout(() => {
              setupSubscription();
            }, retryDelay * retryCount); // Exponential backoff
          } else {
            setError('Failed to load tasks - please check your connection');
            setLoading(false);
          }
        }
      );

      return unsubscribe;
    };

    const unsubscribe = setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
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
