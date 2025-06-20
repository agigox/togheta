# Expo Router Setup Guide

This document outlines the complete setup process for implementing Expo Router with file-based routing in this React Native/Expo project.

## 📋 Setup Process

### Prerequisites
- Expo Router was already installed: `expo-router: ~5.1.0`
- Required dependencies were present: `react-native-screens`, `expo-linking`, `expo-constants`

### Step 1: Configuration Files

#### 1.1 Update `package.json`
```json
{
  "main": "expo-router/entry"
}
```

#### 1.2 Update `App.tsx`
```tsx
import 'expo-router/entry';
```

#### 1.3 Update `app.json`
```json
{
  "expo": {
    "scheme": "togheta",
    "web": {
      "bundler": "metro"
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

### Step 2: Create Route Files

#### 2.1 Root Layout (`app/_layout.tsx`)
- Sets up Stack navigator
- Wraps app with AuthProvider
- Handles font loading with SplashScreen
- Defines screen options (headerShown: false)

#### 2.2 Index Route (`app/index.tsx`)
- Entry point for the app
- Checks authentication status
- Redirects to appropriate route based on auth state
- Shows loading screen during auth check

#### 2.3 Auth Route (`app/auth.tsx`)
- Renders AuthScreen component
- Auto-redirects authenticated users to /tasks
- Handles login/signup flow

#### 2.4 Tasks Route (`app/tasks.tsx`)
- Renders TaskScreen component (protected route)
- Auto-redirects unauthenticated users to /auth
- Main app functionality for authenticated users

### Step 3: Export Updates
Added `SplashScreen` to shared components exports in `src/shared/components/index.ts`

## 🧭 How Routing Works

### File-Based Routing
Expo Router uses the file system in the `app/` directory to define routes:
- `app/index.tsx` → `/` (root route)
- `app/auth.tsx` → `/auth`
- `app/tasks.tsx` → `/tasks`
- `app/_layout.tsx` → Root layout (wraps all routes)

### Navigation Flow
1. **App Launch** → `_layout.tsx` loads
2. **Font Loading** → Shows SplashScreen while fonts load
3. **Navigation Start** → Goes to `index.tsx`
4. **Auth Check** → Checks `useAuth()` context
5. **Auto Redirect** → Routes to `/auth` or `/tasks`
6. **Route Protection** → Each route checks auth and redirects if needed

### Authentication-Based Navigation
```tsx
// In each route component
const { isAuthenticated } = useAuth();
const router = useRouter();

useEffect(() => {
  if (isAuthenticated) {
    router.replace('/tasks');
  } else {
    router.replace('/auth');
  }
}, [isAuthenticated, router]);
```

## 🔧 Current Route Structure

```
app/
├── _layout.tsx     # Root layout (Stack navigator + AuthProvider)
├── index.tsx       # Entry point with auth-based redirection
├── auth.tsx        # Authentication screen
└── tasks.tsx       # Main app screen (protected)
```

**Route Mapping:**
- `/` → Auto-redirect based on auth status
- `/auth` → Login/signup screen
- `/tasks` → Main tasks screen (protected)

## ➕ Adding New Routes

### 1. Simple Route
Create a new file in `app/` directory:

```tsx
// app/profile.tsx
import { Text, View } from 'react-native';

export default function Profile() {
  return (
    <View>
      <Text>Profile Screen</Text>
    </View>
  );
}
```

### 2. Protected Route
For routes that require authentication:

```tsx
// app/settings.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '~/context/AuthContext';
import { SettingsScreen } from '~/features/settings';

export default function Settings() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth');
    }
  }, [isAuthenticated, router]);

  return <SettingsScreen />;
}
```

### 3. Dynamic Routes
For parameterized routes:

```tsx
// app/task/[id].tsx
import { useLocalSearchParams } from 'expo-router';

export default function TaskDetail() {
  const { id } = useLocalSearchParams();
  
  return (
    <View>
      <Text>Task ID: {id}</Text>
    </View>
  );
}
```

### 4. Update Layout (if needed)
Add new routes to the Stack in `_layout.tsx`:

```tsx
<Stack screenOptions={{ headerShown: false }}>
  <Stack.Screen name="index" />
  <Stack.Screen name="auth" />
  <Stack.Screen name="tasks" />
  <Stack.Screen name="profile" />
  <Stack.Screen name="settings" />
</Stack>
```

## 🎯 Navigation Methods

### Programmatic Navigation
```tsx
import { useRouter } from 'expo-router';

const router = useRouter();

// Navigate to route
router.push('/profile');

// Replace current route
router.replace('/auth');

// Go back
router.back();

// Navigate with parameters
router.push('/task/123');
```

### Link Component
```tsx
import { Link } from 'expo-router';

<Link href="/profile">
  <Text>Go to Profile</Text>
</Link>
```

## 🔒 Route Protection Patterns (IMPLEMENTED)

We have implemented two powerful patterns for protecting routes in this project:

### 1. Auth Guard Hook (`useRequireAuth`)

**Location:** `src/hooks/useRequireAuth.ts`

This custom hook handles authentication checking and automatic redirection:

```tsx
import { useRequireAuth } from '~/hooks/useRequireAuth';

export default function SomeProtectedRoute() {
  const { isAuthenticated, loading } = useRequireAuth();
  
  // Hook automatically redirects to /auth if not authenticated
  // Returns loading state and authentication status
  
  if (loading) {
    return <LoadingScreen message="Loading..." />;
  }
  
  return <YourProtectedContent />;
}
```

**Features:**
- Automatic redirect to `/auth` for unauthenticated users
- Handles loading states during auth checks
- Returns both `isAuthenticated` and `loading` states
- Reusable across any route component

### 2. Route Wrapper Component (`ProtectedRoute`)

**Location:** `src/shared/components/ProtectedRoute.tsx`

This component wraps protected content and handles all auth logic:

```tsx
import { ProtectedRoute } from '~/shared';

export default function SomeProtectedRoute() {
  return (
    <ProtectedRoute>
      <YourProtectedContent />
    </ProtectedRoute>
  );
}
```

**Features:**
- Wraps any content that needs protection
- Shows loading screen during auth checks
- Handles redirection automatically
- Optional custom fallback component
- Cleaner, more declarative syntax

### 3. Example Implementation: Settings Route

**File:** `app/settings.tsx` (CREATED)

```tsx
import { View, Text } from 'react-native';
import { ProtectedRoute } from '~/shared';

export default function Settings() {
  return (
    <ProtectedRoute>
      {/* Your actual settings content goes here */}
      <View>
        <Text>Settings Screen</Text>
      </View>
    </ProtectedRoute>
  );
}
```

**How to create your SettingsScreen component:**

1. **Create the feature directory:**
   ```
   src/features/settings/
   ├── index.ts
   ├── SettingsScreen.tsx
   └── components/
       └── SettingsForm.tsx
   ```

2. **Create SettingsScreen.tsx:**
   ```tsx
   // src/features/settings/SettingsScreen.tsx
   import { View, Text } from 'react-native';
   import { Button, LogoutButton } from '~/shared';
   
   export function SettingsScreen() {
     return (
       <View style={{ flex: 1, padding: 20 }}>
         <Text style={{ fontSize: 24, marginBottom: 20 }}>Settings</Text>
         
         {/* Add your settings content here */}
         <Button title="Profile Settings" onPress={() => {}} />
         <Button title="Notification Settings" onPress={() => {}} />
         <Button title="Privacy Settings" onPress={() => {}} />
         
         <LogoutButton />
       </View>
     );
   }
   ```

3. **Export from index.ts:**
   ```tsx
   // src/features/settings/index.ts
   export { SettingsScreen } from './SettingsScreen';
   ```

4. **Update the route file:**
   ```tsx
   // app/settings.tsx
   import { ProtectedRoute } from '~/shared';
   import { SettingsScreen } from '~/features/settings';
   
   export default function Settings() {
     return (
       <ProtectedRoute>
         <SettingsScreen />
       </ProtectedRoute>
     );
   }
   ```

### 4. Navigation to Protected Routes

**From any component:**
```tsx
import { useRouter } from 'expo-router';

function SomeComponent() {
  const router = useRouter();
  
  const goToSettings = () => {
    router.push('/settings');
  };
  
  return (
    <Button title="Settings" onPress={goToSettings} />
  );
}
```

**Using Link component:**
```tsx
import { Link } from 'expo-router';

<Link href="/settings">
  <Text>Go to Settings</Text>
</Link>
```

### 5. Testing Protected Routes

1. **Test unauthenticated access:**
   - Navigate directly to `/settings` when logged out
   - Should automatically redirect to `/auth`

2. **Test authenticated access:**
   - Login first, then navigate to `/settings`
   - Should display the protected content

3. **Test loading states:**
   - Watch for loading screens during auth checks
   - Ensure smooth transitions

### 6. Advanced Protection Patterns

**Custom permission checks:**
```tsx
// src/hooks/useRequirePermission.ts
import { useAuth } from '~/context/AuthContext';
import { useRouter } from 'expo-router';

export function useRequirePermission(permission: string) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const hasPermission = user?.permissions?.includes(permission);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth');
    } else if (!hasPermission) {
      router.replace('/unauthorized');
    }
  }, [isAuthenticated, hasPermission]);
  
  return { hasPermission, isAuthenticated };
}
```

**Role-based protection:**
```tsx
// components/RoleProtectedRoute.tsx
interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string;
}

export function RoleProtectedRoute({ children, requiredRole }: RoleProtectedRouteProps) {
  const { user } = useAuth();
  const hasRole = user?.role === requiredRole;
  
  if (!hasRole) {
    return <UnauthorizedScreen />;
  }
  
  return <>{children}</>;
}
```

## 🚀 Testing the Setup

1. **Start Development Server:**
   ```bash
   npm start
   ```

2. **Test Routes:**
   - Scan QR code with Expo Go
   - Or press `i` for iOS simulator
   - Or press `w` for web browser

3. **Verify Navigation:**
   - App should redirect to `/auth` when not logged in
   - After login, should redirect to `/tasks`
   - Routes should protect against unauthorized access

## 📝 Best Practices

1. **Route Naming:** Use lowercase with hyphens for multi-word routes
2. **Layout Hierarchy:** Keep layouts minimal and focused
3. **Auth Protection:** Always protect sensitive routes
4. **Loading States:** Show loading screens during navigation
5. **Error Handling:** Handle navigation errors gracefully
6. **Deep Linking:** Test routes work with deep links

## 🐛 Troubleshooting

- **Routes not working:** Check file names match exactly
- **Navigation errors:** Ensure all dependencies are installed
- **Auth loops:** Verify auth context is properly initialized
- **Metro bundler issues:** Clear cache with `npx expo start -c`
