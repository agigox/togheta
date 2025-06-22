# End-to-End Test Scenarios for Family Management App

## 🧪 **Complete Testing Guide**

This document provides comprehensive test scenarios to validate the entire onboarding and family management system from end to end after the **Zustand migration**.

---

## 📱 **Prerequisites for Testing**

1. **Firebase Console Access**: Ensure you can view Firestore collections
2. **Device/Simulator**: iOS Simulator, Android Emulator, or physical device
3. **Multiple Test Accounts**: Prepare 3-4 different email addresses for testing
4. **Console Logs**: Keep developer console open to monitor logs
5. **Zustand Stores**: App now uses Zustand for state management instead of Context/hooks

### **⚠️ Development vs Production Behavior**

In **development mode** (Expo Dev Client, Metro bundler):
- You may see duplicate initialization logs due to hot reloading
- Multiple "Loading persisted auth state..." messages are normal
- React components may re-mount during development

In **production builds**:
- Initialization should happen only once
- Console logs will be cleaner and more predictable
- No hot reloading artifacts

**Expected logs shown in this document are for production-like behavior**. During development, you may see additional logs.

---

## 🎯 **Test Scenario 1: New User Signup → Create Family**

### **Objective**: Test complete new user flow with family creation

### **Steps**:
1. **Open the app** (should show loading screen, then redirect to `/auth`)
   - **Expected Console Logs** (first time):
     ```
     🚀 Initializing Zustand stores...
     Loading persisted auth state...
     ✅ Stores initialized
     No persisted auth state found
     🔥 Firebase auth state changed: not authenticated
     🔄 Resetting family state - user not authenticated
     🔄 Resetting family store state
     ✅ Family store state reset complete
     🔄 Routing logic check: { authLoading: false, familyLoading: false, hasFamilyId: false, hasUser: false, isAuthenticated: false }
     ➡️ Redirecting to /auth - user not authenticated
     ```
   - **Note**: In development, you may see additional logs due to hot reloading:
     ```
     🔄 Stores already initialized, skipping...
     🔄 Auth already initialized, skipping...
     ```

2. **Sign up with new email** (e.g., `testuser1@example.com`)
   - Enter email and password
   - Click "Sign Up"
   - **Expected Console Logs**:
     ```
     🔥 Firebase auth state changed: authenticated (testuser1@example.com)
     👤 Setting up family subscription for user: [uid]
     👤 Setting up Firestore listener for user in store: [uid]
     User signed up successfully: [uid]
     Syncing user to Firestore: testuser1@example.com
     User synced successfully. FamilyId: null
     ✅ User document created, ready for onboarding
     🔄 User should be redirected to onboarding by app/index.tsx routing logic
     ```

3. **Verify Onboarding Redirect**
   - App should automatically redirect to `/onboarding`
   - **Expected Console Logs**:
     ```
     👤 User document snapshot in store: { exists: true, data: { familyId: null, ... } }
     👤 Setting familyId from Firestore in store: null
     🔄 Routing logic check: { authLoading: false, familyLoading: false, isAuthenticated: true, hasFamilyId: false }
     ➡️ Redirecting to /onboarding - user has no family
     ```

4. **On Onboarding Screen**
   - Should see welcome message and two options
   - Should see "Start New Family" and "Join with Invite Code" buttons
   - Should see logout button in top corner

5. **Click "Start New Family"**
   - **Expected Console Logs**:
     ```
     🏠 Creating new family for user: testuser1@example.com
     Syncing user to Firestore: testuser1@example.com
     User synced successfully. FamilyId: null
     🏠 Creating new family in store: testuser1's Family
     ✅ Family created successfully in store: [familyId]
     ```
   - Should show success alert: "Welcome to your new family!"
   - Click "Continue" in alert

6. **Verify Tasks Screen**
   - Should redirect to `/tasks` **immediately** (no more waiting for family loading)
   - **Expected Console Logs**:
     ```
     📋 Tasks route protection check: { authLoading: false, hasFamilyId: true, isAuthenticated: true }
     📋 Subscribing to tasks for family: [familyId]
     ```
   - Should show family name in header
   - Should show empty task list or welcome message
   - Should be able to add tasks

### **Firebase Verification**:
- **Check `/users/[uid]`**: Should have `familyId` populated
- **Check `/families/[familyId]`**: Should exist with `createdBy: [uid]`
- **Check `/families/[familyId]/members/[uid]`**: Should exist with `role: admin`

---

## 🎯 **Test Scenario 2: New User Signup → Join Family**

### **Objective**: Test new user joining existing family via invite code

### **Prerequisites**: Complete Scenario 1 first to have a family with invite code

### **Steps**:
1. **Get Invite Code from Previous Test**
   - In Firebase Console, go to the family document created in Scenario 1
   - Note the `inviteCode` (6-character string)

2. **Sign up with second email** (e.g., `testuser2@example.com`)
   - Follow steps 1-4 from Scenario 1
   - Should reach onboarding screen

3. **Click "Join with Invite Code"**
   - Should show input field for invite code
   - Should show "Cancel" and "Join Family" buttons

4. **Test Invalid Invite Code**
   - Enter invalid code (e.g., "INVALID")
   - Click "Join Family"
   - Should show error alert: "Invalid invite code"

5. **Test Valid Invite Code**
   - Enter the correct invite code from step 1
   - Click "Join Family"
   - **Expected Console Logs**:
     ```
     🔗 Joining family with code in store: [code]
     ✅ Joined family successfully in store: [familyId]
     ```
   - Should show success alert: "Welcome to the family!"
   - Click "Continue"

6. **Verify Tasks Screen**
   - Should redirect to `/tasks` **immediately**
   - **Expected Console Logs**:
     ```
     📋 Tasks route protection check: { authLoading: false, hasFamilyId: true, isAuthenticated: true }
     📋 Subscribing to tasks for family: [familyId]
     ```
   - Should show same family name as first user
   - Should see shared tasks (if any were created)

### **Firebase Verification**:
- **Check `/users/[uid2]`**: Should have same `familyId` as first user
- **Check `/families/[familyId]/members/[uid2]`**: Should exist with `role: member`

---

## 🎯 **Test Scenario 3: Existing User Login**

### **Objective**: Test returning user login flow with Zustand state restoration

### **Steps**:
1. **Logout from current session** (use logout button)
   - Should redirect to `/auth`
   - **Expected Console Logs**:
     ```
     🔄 Resetting family store state
     ✅ Family store state reset complete
     🔄 Resetting all stores...
     ✅ All stores reset
     ```

2. **Login with existing account** (from Scenario 1 or 2)
   - Enter email and password
   - Click "Login"
   - **Expected Console Logs**:
     ```
     🔥 Firebase auth state changed: authenticated ([email])
     👤 Setting up family subscription for user: [uid]
     👤 User document snapshot in store: { exists: true, data: { familyId: "[familyId]", ... } }
     👤 Setting familyId from Firestore in store: [familyId]
     🔄 Routing logic check: { authLoading: false, hasFamilyId: true, isAuthenticated: true }
     ➡️ Redirecting to /tasks - user has family
     ```

3. **Verify Direct Redirect to Tasks**
   - Should NOT go to onboarding
   - Should go directly to `/tasks`
   - Should see family tasks and members

---

## 🎯 **Test Scenario 4: App State Persistence with Zustand**

### **Objective**: Test Zustand store persistence and app restart behavior

### **Steps**:
1. **Login and navigate to tasks**
2. **Close and reopen the app**
   - **Expected Console Logs**:
     ```
     🚀 Initializing Zustand stores...
     Loading persisted auth state...
     Found valid persisted auth state - restoring user
     Restoring user from secure storage: [email]
     ✅ Stores initialized
     🔥 Firebase auth state changed: authenticated ([email])
     👤 Setting up family subscription for user: [uid]
     ```
   - Should remember login state
   - Should redirect directly to `/tasks`
   - Should not require re-authentication

3. **Test with airplane mode**
   - Turn on airplane mode
   - Reopen app
   - Should still show cached auth data
   - Should handle offline gracefully

---

## 🎯 **Test Scenario 5: Loading State Fixes**

### **Objective**: Test that loading states don't get stuck

### **Steps**:
1. **Fresh app start**
   - Should not get stuck on loading screen
   - Should properly transition through auth states

2. **Family creation**
   - After creating family, should immediately go to tasks
   - Should NOT wait for family data to load
   - Family data can load in background

3. **Monitor loading states**
   - **Expected**: `familyLoading` should not block task page access
   - **Expected**: Only `authLoading` should block navigation
   - **Expected**: No infinite loading loops
---

## 🎯 **Test Scenario 6: Task Management Between Family Members**

### **Objective**: Test real-time task synchronization with Zustand stores

### **Prerequisites**: Complete Scenarios 1 & 2 (have 2 users in same family)

### **Steps**:
1. **User 1 adds a task**
   - Login as first user
   - Add task: "Buy groceries"
   - **Expected Console Logs**:
     ```
     📋 Subscribing to tasks for family: [familyId]
     Adding task to family [familyId]: Buy groceries
     ✅ Task added successfully: [taskId]
     ```
   - Task should appear in list

2. **User 2 sees the task**
   - Login as second user (different device/browser)
   - Should see the same task in real-time
   - **Expected Console Logs**:
     ```
     📋 Tasks snapshot updated: 1 tasks
     ```

3. **User 2 completes the task**
   - Mark "Buy groceries" as complete
   - Should update in real-time with Zustand store

4. **User 1 sees the update**
   - Task should show as completed for User 1
   - Should update automatically via Firestore subscription

---

## 🎯 **Test Scenario 7: Error Handling with Zustand**

### **Objective**: Test error scenarios and Zustand error states

### **Steps**:

#### **7A: Network Issues**
1. **Disconnect internet during signup**
   - Should show appropriate error message in Zustand store
   - Should not create partial data
   - Error should be stored in auth store state

#### **7B: Family Creation Errors**
1. **Test family creation with network issues**
   - Should set error in family store
   - Should reset `familyLoading` to false
   - Should show user-friendly error message

#### **7C: Parameter Order Bug Prevention**
1. **Test family creation with proper parameters**
   - Should pass `userId` first, then `familyName`
   - Should NOT see "No document to update" errors
   - Should create family successfully

#### **7D: Loading State Issues**
1. **Monitor for stuck loading states**
   - Family creation should not cause infinite loading
   - Tasks page should load immediately after family creation
   - `familyLoading` should not block essential navigation

---

## 🎯 **Test Scenario 8: Zustand Store State Management**

### **Objective**: Test Zustand store behavior and state consistency

### **Steps**:

#### **8A: Store Initialization**
1. **App startup should initialize all stores**
   - Auth store should set up Firebase listener
   - Family store should be in initial state
   - Tasks store should be in initial state

#### **8B: Store Reset on Logout**
1. **Logout should reset all stores**
   - Family store should be reset
   - Tasks store should be reset  
   - Auth store should clear user data

#### **8C: Store Subscriptions**
1. **Family subscription should work correctly**
   - Should set up when user is authenticated
   - Should clean up when user logs out
   - Should not cause memory leaks

#### **8D: Cross-Store Dependencies**
1. **Stores should work together properly**
   - Auth changes should trigger family subscription setup
   - Family ID changes should trigger task subscription
   - Loading states should be managed independently

---

## 📋 **Expected Results Summary**

| Scenario | Expected Route | Zustand Store State | Notes |
|----------|---------------|-------------------|--------|
| New Signup | `/auth` → `/onboarding` | Auth: authenticated, Family: no familyId | Zustand manages loading states |
| Create Family | `/onboarding` → `/tasks` | Family: has familyId, loading: false | **Immediate redirect** - no waiting |
| Join Family | `/onboarding` → `/tasks` | Family: joined existing family | Parameter order fixed |
| Existing Login | `/auth` → `/tasks` | Auth: restored from SecureStore | Zustand persistence working |
| No Family Login | `/auth` → `/onboarding` | Family: reset state | Proper state management |

---

## 🔍 **Debugging Checklist for Zustand Migration**

If any scenario fails, check:

### **Zustand Store Logs**
- [ ] Store initialization logged: `🚀 Initializing Zustand stores...`
- [ ] Store reset operations logged: `🔄 Resetting family store state`
- [ ] Family operations logged with store context
- [ ] Auth state changes reflected in stores

### **Loading State Management**
- [ ] `authLoading` managed correctly
- [ ] `familyLoading` doesn't block essential navigation
- [ ] No infinite loading loops
- [ ] Loading states reset properly

### **Firebase Integration**
- [ ] Zustand stores integrate with Firebase correctly
- [ ] Subscriptions set up and cleaned up properly
- [ ] Error states managed in stores
- [ ] Real-time updates reflected in Zustand state

### **Parameter Order (Critical Fix)**
- [ ] `createFamily(userId, familyName)` - correct order
- [ ] `joinFamilyWithCode(userId, inviteCode)` - correct order
- [ ] No "No document to update" errors

---

## 🚨 **Common Issues & Solutions (Updated)**

### **Issue: Multiple initialization logs**
- **Cause**: Development hot reloading causes app remounts
- **Expected**: May see "🔄 Stores already initialized, skipping..." 
- **Solution**: Normal in development, won't happen in production

### **Issue: Repeated "Loading persisted auth state..."**
- **Cause**: Firebase auth listener triggering multiple times during development
- **Expected**: Multiple calls during hot reload cycles
- **Solution**: Normal behavior, auth state will stabilize

### **Issue: User stays on loading screen**
- **Check**: Zustand auth store loading state
- **Check**: Family store loading state
- **Solution**: Verify store initialization and Firebase connection

### **Issue: "No document to update" error**
- **Check**: Parameter order in family store methods
- **Solution**: Ensure `userId` is passed first, not `familyName`

### **Issue: Tasks page stuck loading**
- **Check**: Remove dependency on `familyLoading` for navigation
- **Solution**: Only check `authLoading` and `hasFamilyId` for routing

### **Issue: Store state not persisting**
- **Check**: SecureStore integration in auth store
- **Check**: Store initialization on app startup
- **Solution**: Verify persistent state loading

### **Issue: Family subscription not working**
- **Check**: Subscription setup in family store
- **Check**: Cleanup on user logout
- **Solution**: Verify useEffect dependencies in index route

### **Issue: Console logs don't match E2E scenarios**
- **Check**: Development vs production environment
- **Expected**: More logs in development due to hot reloading
- **Solution**: Compare behavior patterns, not exact log counts

---

## 🎯 **Success Criteria (Updated for Zustand)**

✅ **All Zustand stores initialize correctly**  
✅ **Loading states managed properly (no infinite loops)**  
✅ **Family creation works without parameter errors**  
✅ **Tasks page loads immediately after family creation**  
✅ **Store state persists across app restarts**  
✅ **Real-time updates work with Zustand integration**  
✅ **Error handling works in all stores**  
✅ **Store cleanup works on logout**

Run through all scenarios systematically to ensure the Zustand migration is working correctly end-to-end!

## 🔄 **Migration Verification Checklist**

- [ ] No more Context Provider dependencies
- [ ] All components use Zustand store hooks
- [ ] Store subscriptions replace useEffect hooks
- [ ] Loading state logic simplified
- [ ] Parameter order bugs fixed
- [ ] Real-time sync still working
- [ ] Error states properly managed
- [ ] App performance improved
