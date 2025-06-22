# End-to-End Test Scenarios for Family Management App

## 🧪 **Complete Testing Guide**

This document provides comprehensive test scenarios to validate the entire onboarding and family management system from end to end.

---

## 📱 **Prerequisites for Testing**

1. **Firebase Console Access**: Ensure you can view Firestore collections
2. **Device/Simulator**: iOS Simulator, Android Emulator, or physical device
3. **Multiple Test Accounts**: Prepare 3-4 different email addresses for testing
4. **Console Logs**: Keep developer console open to monitor logs

---

## 🎯 **Test Scenario 1: New User Signup → Create Family**

### **Objective**: Test complete new user flow with family creation

### **Steps**:
1. **Open the app** (should show loading screen, then redirect to `/auth`)
2. **Sign up with new email** (e.g., `testuser1@example.com`)
   - Enter email and password
   - Click "Sign Up"
   - **Expected Console Logs**:
     ```
     User signed up successfully: [uid]
     Syncing user to Firestore: testuser1@example.com
     ✅ User document created, ready for onboarding
     🔄 User should be redirected to onboarding by app/index.tsx routing logic
     ```

3. **Verify Onboarding Redirect**
   - App should automatically redirect to `/onboarding`
   - **Expected Console Logs**:
     ```
     👤 User document snapshot: { exists: true, data: { familyId: null, ... } }
     👤 Setting familyId from Firestore: null
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
     ✅ Family created successfully with ID: [familyId]
     ```
   - Should show success alert: "Welcome to your new family!"
   - Click "Continue" in alert

6. **Verify Tasks Screen**
   - Should redirect to `/tasks`
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
     🔗 Joining family with code: [code]
     ✅ Successfully joined family: [familyId]
     ```
   - Should show success alert: "Welcome to the family!"
   - Click "Continue"

6. **Verify Tasks Screen**
   - Should redirect to `/tasks`
   - Should show same family name as first user
   - Should see shared tasks (if any were created)

### **Firebase Verification**:
- **Check `/users/[uid2]`**: Should have same `familyId` as first user
- **Check `/families/[familyId]/members/[uid2]`**: Should exist with `role: member`

---

## 🎯 **Test Scenario 3: Existing User Login**

### **Objective**: Test returning user login flow

### **Steps**:
1. **Logout from current session** (use logout button)
   - Should redirect to `/auth`

2. **Login with existing account** (from Scenario 1 or 2)
   - Enter email and password
   - Click "Login"
   - **Expected Console Logs**:
     ```
     User logged in successfully: [uid]
     👤 User document snapshot: { exists: true, data: { familyId: "[familyId]", ... } }
     👤 Setting familyId from Firestore: [familyId]
     🔄 Routing logic check: { authLoading: false, familyLoading: false, isAuthenticated: true, hasFamilyId: true }
     ➡️ Redirecting to /tasks - user has family
     ```

3. **Verify Direct Redirect to Tasks**
   - Should NOT go to onboarding
   - Should go directly to `/tasks`
   - Should see family tasks and members

---

## 🎯 **Test Scenario 4: User Without Family Logs In**

### **Objective**: Test edge case where existing user has no family

### **Steps**:
1. **Manually remove familyId from user document**
   - In Firebase Console, edit the user document
   - Delete the `familyId` field or set it to `null`

2. **Login with that account**
   - Should redirect to `/onboarding` (not `/tasks`)
   - User can then create or join a family

---

## 🎯 **Test Scenario 5: Task Management Between Family Members**

### **Objective**: Test real-time task synchronization

### **Prerequisites**: Complete Scenarios 1 & 2 (have 2 users in same family)

### **Steps**:
1. **User 1 adds a task**
   - Login as first user
   - Add task: "Buy groceries"
   - Task should appear in list

2. **User 2 sees the task**
   - Login as second user (different device/browser)
   - Should see the same task in real-time

3. **User 2 completes the task**
   - Mark "Buy groceries" as complete
   - Should update in real-time

4. **User 1 sees the update**
   - Task should show as completed for User 1

---

## 🎯 **Test Scenario 6: Error Handling**

### **Objective**: Test error scenarios and edge cases

### **Steps**:

#### **6A: Network Issues**
1. **Disconnect internet during signup**
   - Should show appropriate error message
   - Should not create partial data

#### **6B: Duplicate Join Attempt**
1. **Try to join same family twice**
   - Use same invite code from Scenario 2
   - Should show appropriate error (if prevented)

#### **6C: Invalid Email Signup**
1. **Try invalid email formats**
   - Should show validation errors

#### **6D: Weak Password**
1. **Try weak passwords**
   - Should show Firebase validation errors

---

## 🎯 **Test Scenario 7: App State Persistence**

### **Objective**: Test app state after restart

### **Steps**:
1. **Login and navigate to tasks**
2. **Close and reopen the app**
   - Should remember login state
   - Should redirect directly to `/tasks`
   - Should not require re-authentication

3. **Test with airplane mode**
   - Turn on airplane mode
   - Reopen app
   - Should still show cached data
   - Should show appropriate offline state

---

## 🎯 **Test Scenario 8: Multiple Families (Edge Case)**

### **Objective**: Test user switching between families

### **Steps**:
1. **Create first family** (Scenario 1)
2. **Remove user from family** (manually in Firebase)
3. **User logs in again**
   - Should redirect to onboarding
   - Can create new family or join different one

---

## 📋 **Expected Results Summary**

| Scenario | Expected Route | Firebase State | Notes |
|----------|---------------|----------------|--------|
| New Signup | `/auth` → `/onboarding` | User doc with `familyId: null` | Should NOT auto-create family |
| Create Family | `/onboarding` → `/tasks` | User has `familyId`, family exists | Success alert shown |
| Join Family | `/onboarding` → `/tasks` | User added to existing family | Validates invite code |
| Existing Login | `/auth` → `/tasks` | User has existing `familyId` | Skips onboarding |
| No Family Login | `/auth` → `/onboarding` | User has `familyId: null` | Needs family setup |

---

## 🔍 **Debugging Checklist**

If any scenario fails, check:

### **Console Logs**
- [ ] Authentication state changes logged
- [ ] Firestore document creation logged
- [ ] Routing decisions logged
- [ ] Family operations logged

### **Firebase Console**
- [ ] User documents created correctly
- [ ] Family documents have all required fields
- [ ] Member subcollections populated
- [ ] Invite codes are unique

### **App Navigation**
- [ ] Loading states shown appropriately
- [ ] Redirects happen automatically
- [ ] No infinite redirect loops
- [ ] Back navigation works correctly

---

## 🚨 **Common Issues & Solutions**

### **Issue: User stays on loading screen**
- **Check**: AuthContext loading state
- **Check**: useUserFamily hook loading state
- **Solution**: Verify Firebase connection

### **Issue: User goes to tasks instead of onboarding**
- **Check**: User document `familyId` field
- **Check**: useUserFamily hook logs
- **Solution**: Ensure `familyId` is `null` for new users

### **Issue: Invite code doesn't work**
- **Check**: Family document has `inviteCode` field
- **Check**: Code is exactly 6 characters
- **Check**: Firebase security rules allow reading families

### **Issue: Tasks don't sync between users**
- **Check**: Both users have same `familyId`
- **Check**: Firestore security rules
- **Check**: Task documents have correct `familyId`

---

## 🎯 **Success Criteria**

✅ **All scenarios complete without errors**  
✅ **Console logs show expected messages**  
✅ **Firebase data matches expectations**  
✅ **Real-time updates work correctly**  
✅ **Error handling works appropriately**  
✅ **App state persists across restarts**

Run through all scenarios systematically to ensure the complete onboarding system works end-to-end!
