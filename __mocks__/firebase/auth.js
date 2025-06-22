// Mock Firebase Auth
const jest = global.jest || require('jest-mock');

const mockAuth = {
  currentUser: null,
  uid: 'test-user-id',
  email: 'test@example.com',
};

module.exports = {
  getAuth: jest.fn(() => mockAuth),
  onAuthStateChanged: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  User: {},
};
