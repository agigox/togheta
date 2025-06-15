// __tests__/firebase/tasks.test.ts
import { addTask, getTasksForFamily, toggleTask } from '../../src/firebase/tasks';
import { getDB } from '../../src/firebase';
import { Task } from '../../src/modals/Task';

// Mock Firestore methods
const mockAddDoc = jest.fn();
const mockUpdateDoc = jest.fn();

jest.mock('../../src/firebase', () => ({
  getDB: jest.fn(),
}));
const mockOnSnapshot = jest.fn();
jest.mock('firebase/firestore', () => ({
  addDoc: (...args: any[]) => mockAddDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  collection: jest.fn(() => ({ id: 'fake-collection-ref' })), // ✅ return a dummy value
  doc: jest.fn(() => ({ id: 'fake-doc-ref' })), // ✅ return a dummy value
  query: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
}));

describe('Firebase Task Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock return value of getDB() to simulate Firestore DB
    (getDB as jest.Mock).mockReturnValue({
      __mock: true,
    });
  });

  it('adds a new task to Firestore with correct fields', async () => {
    const title = 'Take out trash';
    const familyId = 'family123';

    await addTask(title, familyId);

    expect(mockAddDoc).toHaveBeenCalledWith(
      { id: 'fake-collection-ref' },
      {
        title,
        completed: false,
        createdAt: expect.any(Date),
        familyId,
      }
    );
  });

  it("toggles a task's completed state", async () => {
    const taskId = 'task123';
    const current = false;

    await toggleTask(taskId, current);

    expect(mockUpdateDoc).toHaveBeenCalledWith(
      { id: 'fake-doc-ref' },
      {
        completed: true,
      }
    );
  });
  it('retrieves tasks for a specific family', async () => {
  // Setup mock data
  const mockTasks = [
    { id: 'task1', title: 'Task 1', completed: false, familyId: 'family123', createdAt: new Date() },
    { id: 'task2', title: 'Task 2', completed: true, familyId: 'family123', createdAt: new Date() },
    { id: 'task3', title: 'Task 3', completed: false, familyId: 'differentFamily', createdAt: new Date() }
  ];
  
  // Simulate the onSnapshot callback
  mockOnSnapshot.mockImplementation((query, callback) => {
    callback({
      docs: mockTasks.map(task => ({
        id: task.id,
        data: () => ({ ...task })
      }))
    });
    return () => {}; // Unsubscribe function
  });
  
  // Call the function under test
  const result = await getTasksForFamily('family123') as Task[];
  
  // Assert results
  expect(result).toHaveLength(2); // Only 2 tasks with familyId='family123'
  expect(result[0].id).toBe('task1');
  expect(result[1].id).toBe('task2');
  
});

});
