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
     Tab changing from login to signup
     Tab change completed successfully
     🔥 Firebase auth state changed: authenticated (testuser1@example.com)
     🔥 Firebase auth state changed: authenticated (testuser1@example.com)  ← Normal duplicate
     👤 Setting up family subscription for user: [uid]
     👤 Setting up Firestore listener for user in store: [uid]
     User signed up successfully: [uid]
     Syncing user to Firestore: testuser1@example.com
     User synced successfully. FamilyId: null
     ✅ User document created, ready for onboarding
     🔄 User should be redirected to onboarding by app/index.tsx routing logic
     Signup successful - user data persisted
     ```
   - **Note**: The duplicate Firebase auth state change is **normal** during signup process
   - **Important**: The app should automatically redirect to `/onboarding` after successful signup

3. **Verify Onboarding Redirect**
   - App should automatically redirect to `/onboarding`
   - **Note**: You may see brief loading state transitions during family subscription setup
   - **Expected Console Logs**:
     ```
     👤 User document snapshot in store: { exists: true, data: { familyId: null, ... } }
     👤 Setting familyId from Firestore in store: null
     🔄 Routing logic check: { authLoading: false, isAuthenticated: true, hasFamilyId: false }
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

## 🎯 **Test Scenario 6: Comprehensive Task Creation & Management**

### **Objective**: Test complete task lifecycle with Zustand stores

### **Prerequisites**: Complete Scenario 1 (user with family created)

### **6A: Basic Task Creation**

#### **Steps**:
1. **Navigate to Tasks Screen**
   - Should see family name in header
   - Should see "Add Task" button or input field
   - Should see empty task list or welcome message

2. **Create First Task**
   - Enter task title: "Buy groceries"
   - Click "Add Task" or press Enter
   - **Expected Console Logs**:
     ```
     📋 Subscribing to tasks for family: [familyId]
     Adding task to family [familyId]: Buy groceries
     ✅ Task added successfully: [taskId]
     📋 Tasks snapshot updated: 1 tasks
     ```
   - Task should appear immediately in the list
   - Input field should clear after creation

3. **Verify Task Properties**
   - Task should show: title, unchecked state, creator info
   - Should be able to see task in Firebase Console under `/families/[familyId]/tasks/`

#### **Firebase Verification**:
- **Check `/families/[familyId]/tasks/[taskId]`**: Should contain:
  ```json
  {
    "title": "Buy groceries",
    "completed": false,
    "createdBy": "[userId]",
    "createdAt": "[timestamp]",
    "assignedTo": null
  }
  ```

### **6B: Multiple Task Creation**

#### **Steps**:
1. **Add Multiple Tasks Quickly**
   - Add task: "Clean kitchen"
   - Add task: "Walk the dog"
   - Add task: "Pay bills"
   - **Expected Console Logs**:
     ```
     Adding task to family [familyId]: Clean kitchen
     ✅ Task added successfully: [taskId2]
     Adding task to family [familyId]: Walk the dog
     ✅ Task added successfully: [taskId3]
     Adding task to family [familyId]: Pay bills
     ✅ Task added successfully: [taskId4]
     📋 Tasks snapshot updated: 4 tasks
     ```

2. **Verify Task Order**
   - Tasks should appear in creation order (newest first or oldest first)
   - All tasks should be visible and interactive

3. **Test Empty Task Prevention**
   - Try to add empty task (just spaces or empty string)
   - Should not create task or show validation error
   - Input should not clear if validation fails

### **6C: Task State Management**

#### **Steps**:
1. **Complete a Task**
   - Click checkbox next to "Buy groceries"
   - **Expected Console Logs**:
     ```
     Updating task [taskId]: completed = true
     ✅ Task updated successfully
     📋 Tasks snapshot updated: 4 tasks
     ```
   - Task should show as completed (strikethrough, different color, etc.)

2. **Uncomplete a Task**
   - Click checkbox again to uncomplete "Buy groceries"
   - Task should return to uncompleted state
   - Should update in real-time

3. **Test Multiple Completions**
   - Complete "Clean kitchen" and "Walk the dog"
   - Should see completed/uncompleted tasks properly organized
   - Completed count should update if displayed

### **6D: Task Validation & Error Handling**

#### **Steps**:
1. **Test Long Task Titles**
   - Add very long task: "This is a very long task title that might exceed normal length limits and should be handled properly by the application"
   - Should either accept with proper display or show character limit

2. **Test Special Characters**
   - Add task with emojis: "🛒 Shopping 🥕🥛"
   - Add task with special chars: "Fix bug #123 & update docs"
   - Should handle and display correctly

3. **Test Network Error Handling**
   - Turn on airplane mode
   - Try to add task: "Offline task"
   - Should show appropriate error message
   - Turn off airplane mode - task should sync when connection returns

4. **Test Concurrent Modifications**
   - With two browser tabs open to same family
   - Add task in tab 1, immediately add task in tab 2
   - Both tasks should appear in both tabs
   - No conflicts or lost tasks

### **6E: Task Assignment (if implemented)**

#### **Steps**:
1. **Assign Task to Family Member**
   - If assignment feature exists, test assigning tasks
   - Should update assignedTo field
   - Should show assigned member in UI

2. **Unassign Task**
   - Remove assignment from task
   - Should revert to unassigned state

### **6F: Task Deletion (if implemented)**

#### **Steps**:
1. **Delete Task**
   - If delete feature exists, delete "Pay bills" task
   - **Expected Console Logs**:
     ```
     Deleting task [taskId]: Pay bills
     ✅ Task deleted successfully
     📋 Tasks snapshot updated: 3 tasks
     ```
   - Task should disappear from list
   - Should be removed from Firebase

2. **Confirm Deletion**
   - Should show confirmation dialog before deletion
   - Should handle "Cancel" properly

---

## 🎯 **Test Scenario 7: Real-Time Task Synchronization**

### **Objective**: Test multi-user task collaboration with Zustand stores

### **Prerequisites**: Complete Scenarios 1 & 2 (have 2 users in same family)

### **Steps**:

1. **Setup Two Sessions**
   - User 1: Login on device/browser 1
   - User 2: Login on device/browser 2
   - Both should be in same family, both on tasks screen

2. **User 1 Creates Task**
   - User 1 adds: "Team task - grocery shopping"
   - **Expected on User 1**:
     ```
     Adding task to family [familyId]: Team task - grocery shopping
     ✅ Task added successfully: [taskId]
     ```
   - **Expected on User 2**:
     ```
     📋 Tasks snapshot updated: [X] tasks
     ```
   - User 2 should see the new task appear immediately

3. **User 2 Completes Task**
   - User 2 marks "Team task - grocery shopping" as complete
   - **Expected on User 2**:
     ```
     Updating task [taskId]: completed = true
     ✅ Task updated successfully
     ```
   - **Expected on User 1**:
     ```
     📋 Tasks snapshot updated: [X] tasks
     ```
   - User 1 should see task marked as completed immediately

4. **Rapid Interactions**
   - User 1 adds multiple tasks quickly
   - User 2 completes tasks as they appear
   - Both users should see all changes in real-time
   - No race conditions or lost updates

5. **Connection Interruption**
   - User 1 goes offline (airplane mode)
   - User 2 adds task: "Offline test task"
   - User 1 comes back online
   - User 1 should see "Offline test task" appear

### **Firebase Verification for Real-Time Tests**:
- All task changes should be reflected in Firebase Console immediately
- Task counts should match between users and Firebase
- No duplicate or orphaned tasks
- Proper timestamp ordering

---

## 🎯 **Test Scenario 8: Task Performance & Edge Cases**

### **Objective**: Test task system performance and edge cases

### **8A: Large Task Lists**

#### **Steps**:
1. **Create Many Tasks**
   - Add 20+ tasks with different titles
   - Should remain responsive during creation
   - Should handle scrolling smoothly
   - **Expected Console Logs**:
     ```
     📋 Tasks snapshot updated: 20 tasks
     ```

2. **Test Task List Performance**
   - Scroll through large task list
   - Mark multiple tasks complete/incomplete rapidly
   - Should remain responsive
   - Should not cause UI freezing

### **8B: Stress Testing**

#### **Steps**:
1. **Rapid Task Creation**
   - Add 10 tasks as quickly as possible
   - All tasks should be created successfully
   - Should handle queue properly without loss

2. **Concurrent User Stress Test**
   - Multiple users (3+) all adding tasks simultaneously
   - Should handle all operations without conflicts
   - Real-time sync should work for all users

### **8C: Edge Case Inputs**

#### **Steps**:
1. **Boundary Testing**
   - Empty task (should be prevented)
   - Very long task (1000+ characters)
   - Tasks with only whitespace
   - Tasks with special Unicode characters: "Task με ελληνικά 中文 🚀"

2. **SQL Injection Prevention**
   - Task with SQL-like content: "'; DROP TABLE tasks; --"
   - Should be safely stored as plain text
   - Should not cause any security issues

### **8D: Memory & Resource Management**

#### **Steps**:
1. **Memory Leak Testing**
   - Create and complete many tasks
   - Navigate away and back to tasks screen
   - Should not accumulate memory over time
   - Zustand subscriptions should clean up properly

2. **Subscription Management**
   - Logout and login multiple times
   - Should not create duplicate subscriptions
   - **Expected Console Logs**:
     ```
     📋 Cleaning up previous task subscription
     📋 Subscribing to tasks for family: [familyId]
     ```

---

## 🎯 **Test Scenario 9: Error Handling with Zustand**

### **Objective**: Test error scenarios and Zustand error states

### **9A: Network Issues**

#### **Steps**:
1. **Task Creation with Network Issues**
   - Turn on airplane mode
   - Try to add task: "Offline task"
   - Should show appropriate error message
   - Should store error in tasks store state
   - Turn off airplane mode - should retry and succeed

2. **Task Update with Network Issues**
   - Mark task as complete while offline
   - Should queue operation or show error
   - Should sync when connection returns

### **9B: Firebase Permission Errors**

#### **Steps**:
1. **Simulate Permission Denied**
   - If possible, test with restricted Firebase rules
   - Should handle gracefully with error messages
   - Should not crash the app

2. **Invalid Data Scenarios**
   - Test with corrupted task data in Firebase
   - Should handle gracefully without breaking UI

### **9C: Store Error Recovery**

#### **Steps**:
1. **Store Error States**
   - Force error in tasks store (if possible)
   - Should display error UI
   - Should provide retry mechanism
   - Should recover gracefully

2. **Error Persistence**
   - Errors should be cleared when operations succeed
   - Should not show stale error messages

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

| Scenario | Expected Route | Zustand Store State | Task Tests | Notes |
|----------|---------------|-------------------|------------|--------|
| New Signup | `/auth` → `/onboarding` | Auth: authenticated, Family: no familyId | N/A | Zustand manages loading states |
| Create Family | `/onboarding` → `/tasks` | Family: has familyId, loading: false | Task creation ready | **Immediate redirect** - no waiting |
| Join Family | `/onboarding` → `/tasks` | Family: joined existing family | Task sync working | Parameter order fixed |
| Existing Login | `/auth` → `/tasks` | Auth: restored from SecureStore | Tasks load properly | Zustand persistence working |
| Task Creation | `/tasks` | Tasks: array of tasks, loading: false | ✅ CRUD operations | Real-time sync with Firebase |
| Multi-user Tasks | `/tasks` | Tasks: synced across users | ✅ Real-time updates | Concurrent user support |
| Task Performance | `/tasks` | Tasks: handles 20+ tasks | ✅ Performance tests | No memory leaks |
| Error Handling | Any route | All stores: proper error states | ✅ Graceful failures | User-friendly messages |

---

## 🔍 **Debugging Checklist for Zustand Migration**

If any scenario fails, check:

### **Zustand Store Logs**
- [ ] Store initialization logged: `🚀 Initializing Zustand stores...`
- [ ] Store reset operations logged: `🔄 Resetting family store state`
- [ ] Family operations logged with store context
- [ ] Auth state changes reflected in stores
- [ ] Task operations logged: `📋 Subscribing to tasks for family`

### **Task-Specific Logs**
- [ ] Task creation logged: `Adding task to family [familyId]`
- [ ] Task updates logged: `Updating task [taskId]`
- [ ] Task sync logged: `📋 Tasks snapshot updated: X tasks`
- [ ] Task subscriptions properly cleaned up

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

## 🎯 **Success Criteria (Updated for Zustand + Task Management)**

### **Core Functionality**
✅ **All Zustand stores initialize correctly**  
✅ **Loading states managed properly (no infinite loops)**  
✅ **Family creation works without parameter errors**  
✅ **Tasks page loads immediately after family creation**  
✅ **Store state persists across app restarts**  

### **Task Management**
✅ **Task creation works reliably**  
✅ **Task completion/incompletion toggles properly**  
✅ **Real-time task sync between multiple users**  
✅ **Task list handles 20+ tasks without performance issues**  
✅ **Task validation prevents empty/invalid tasks**  
✅ **Task operations work offline and sync when online**  

### **Store Integration**
✅ **Real-time updates work with Zustand integration**  
✅ **Error handling works in all stores (auth, family, tasks)**  
✅ **Store cleanup works on logout**  
✅ **Task subscriptions properly managed**  
✅ **No memory leaks from task operations**  

### **Multi-User Collaboration**
✅ **Multiple users can work on tasks simultaneously**  
✅ **Task changes appear in real-time for all family members**  
✅ **No race conditions during concurrent task operations**  
✅ **Proper conflict resolution for simultaneous edits**  

### **Performance & Reliability**
✅ **Task operations remain responsive under load**  
✅ **Large task lists (20+ items) perform well**  
✅ **Network interruptions handled gracefully**  
✅ **Error states recover properly**  
✅ **UI remains stable during rapid task operations**  

Run through all scenarios systematically to ensure the Zustand migration and task management are working correctly end-to-end!

## 🔄 **Migration Verification Checklist**

- [ ] No more Context Provider dependencies
- [ ] All components use Zustand store hooks
- [ ] Store subscriptions replace useEffect hooks
- [ ] Loading state logic simplified
- [ ] Parameter order bugs fixed
- [ ] Real-time sync still working
- [ ] Error states properly managed
- [ ] App performance improved
