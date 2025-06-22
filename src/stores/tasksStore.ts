import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
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
import { getDB } from '~/firebase';

type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  familyId: string;
};

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addTask: (title: string, familyId: string) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  subscribeToTasks: (familyId: string) => () => void;
  reset: () => void;
}

export const useTasksStore = create<TasksState>()(
  devtools(
    (set, get) => ({
      tasks: [],
      loading: false,
      error: null,

      setTasks: (tasks) => set({ tasks }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      addTask: async (title, familyId) => {
        try {
          const db = getDB();
          await addDoc(collection(db, 'tasks'), {
            title,
            completed: false,
            familyId,
            createdAt: serverTimestamp(),
          });
        } catch (error) {
          console.error('Error adding task:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to add task';
          set({ error: errorMessage });
          throw error;
        }
      },

      toggleTask: async (taskId) => {
        try {
          const db = getDB();
          const task = get().tasks.find(t => t.id === taskId);
          if (task) {
            await updateDoc(doc(db, 'tasks', taskId), {
              completed: !task.completed
            });
          }
        } catch (error) {
          console.error('Error toggling task:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to toggle task';
          set({ error: errorMessage });
          throw error;
        }
      },

      subscribeToTasks: (familyId) => {
        if (!familyId) {
          set({ tasks: [], loading: false });
          return () => {};
        }
        
        set({ loading: true, error: null });
        
        const db = getDB();
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

                // Sort tasks by creation date (newest first)
                newTasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

                set({ 
                  tasks: newTasks, 
                  loading: false, 
                  error: null 
                });
                
                retryCount = 0; // Reset retry count on success
              } catch (err) {
                console.error('Error processing tasks snapshot:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to process tasks';
                set({ 
                  error: errorMessage,
                  loading: false 
                });
              }
            },
            (error) => {
              console.error('Tasks subscription error:', error);
              
              // Check if it's a permission error and we should retry
              if (error.code === 'permission-denied' && retryCount < maxRetries) {
                retryCount++;
                console.log(`Retrying tasks subscription (${retryCount}/${maxRetries})...`);
                
                setTimeout(() => {
                  setupSubscription();
                }, retryDelay * retryCount);
                return;
              }
              
              const errorMessage = error instanceof Error ? error.message : 'Failed to load tasks';
              set({ 
                error: errorMessage,
                loading: false,
                tasks: []
              });
            }
          );

          return unsubscribe;
        };

        return setupSubscription();
      },

      reset: () => {
        set({
          tasks: [],
          loading: false,
          error: null
        });
      },
    }),
    {
      name: 'tasks-store',
    }
  )
);
