// Mock Firebase Auth
const jest = global.jest || require('jest-mock');
module.exports = {
  onAuthStateChanged: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  User: {},
};
