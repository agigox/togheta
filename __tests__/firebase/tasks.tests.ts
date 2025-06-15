// __tests__/firebase/tasks.test.ts
import { addTask, toggleTask } from '../../src/firebase/tasks';
import { getDB } from '../../src/firebase';

// Mock Firestore methods
const mockAddDoc = jest.fn();
const mockUpdateDoc = jest.fn();

jest.mock('../../src/firebase', () => ({
  getDB: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  addDoc: (...args: any[]) => mockAddDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  collection: jest.fn(() => ({ id: 'fake-collection-ref' })), // ✅ return a dummy value
  doc: jest.fn(() => ({ id: 'fake-doc-ref' })), // ✅ return a dummy value
  query: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
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
});
