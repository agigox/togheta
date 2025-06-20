
import FamilyScreen from '~/features/family/FamilyScreen';
import { ProtectedRoute } from '~/shared';

// This is where you would import your actual SettingsScreen component
// import { FamilyScreen } from '~/features/family';

export default function Family() {
  return (
    <ProtectedRoute>
      
      
      <FamilyScreen />
      
    </ProtectedRoute>
  );
}
