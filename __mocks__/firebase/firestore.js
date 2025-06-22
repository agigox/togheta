// Mock Firebase Firestore
const jest = global.jest || require('jest-mock');

const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
};

module.exports = {
  getFirestore: jest.fn(() => mockFirestore),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  onSnapshot: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  Timestamp: {
    now: jest.fn(),
  },
};
