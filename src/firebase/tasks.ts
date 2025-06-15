import { Task } from '~/modals/Task';
import { getDB } from '.';
import { collection, addDoc, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore';

// Add a new task
export async function addTask(title: string, familyId: string) {
  const db = getDB();
  await addDoc(collection(db, 'tasks'), {
    title,
    completed: false,
    createdAt: new Date(),
    familyId,
  });
}

// Real-time task list
/*
export function subscribeToTasks(familyId: string, callback: (tasks: any[]) => void) {
  const q = query(
    collection(db, 'tasks'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(task => task.familyId === familyId);
    callback(tasks);
  });
}
*/
// Toggle task complete
export async function toggleTask(taskId: string, current: boolean) {
  const db = getDB();
  const ref = doc(db, 'tasks', taskId);
  await updateDoc(ref, { completed: !current });
}
// Get all tasks for a family
export async function getTasksForFamily(familyId: string) {
  const db = getDB();
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  return new Promise((resolve, reject) => {
    onSnapshot(
      q,
      (snapshot) => {
        const tasks = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as Task)
          .filter((task) => task.familyId === familyId);
        resolve(tasks);
      },
      reject
    );
  });
}
