import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '~/context/AuthContext';
import Button from '~/shared/components/Button';
import Input from '~/shared/components/Input';
import { createFamily, joinFamilyWithCode, syncUserToFirestore } from '~/firebase/families';
import { LogoutButton } from '~/shared';

export function OnboardingScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const handleStartNewFamily = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setLoading(true);
    try {
      console.log('🏠 Creating new family for user:', user.email);
      
      // Ensure user document exists first
      await syncUserToFirestore({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || undefined,
      });
      
      // Create family and add user as admin
      const familyId = await createFamily(user.uid, `${user.displayName || user.email?.split('@')[0]}'s Family`);
      
      Alert.alert(
        'Success!', 
        'Welcome to your new family! You can now start managing tasks together.',
        [{ 
          text: 'Continue', 
          style: 'default',
          onPress: () => router.replace('/tasks')
        }]
      );
      
      console.log('✅ Family created successfully with ID:', familyId);
    } catch (error) {
      console.error('❌ Error creating family:', error);
      Alert.alert(
        'Error', 
        'Failed to create family. Please try again.',
        [{ text: 'OK', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    if (inviteCode.length !== 6) {
      Alert.alert('Error', 'Invite code must be 6 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('🔗 Joining family with code:', inviteCode);
      
      // Ensure user document exists first
      await syncUserToFirestore({
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || undefined,
      });
      
      await joinFamilyWithCode(user.uid, inviteCode.toUpperCase());
      
      Alert.alert(
        'Success!', 
        'Welcome to the family! You can now see and manage shared tasks.',
        [{ 
          text: 'Continue', 
          style: 'default',
          onPress: () => router.replace('/tasks')
        }]
      );
      
      console.log('✅ Successfully joined family');
      setInviteCode('');
      setShowJoinForm(false);
    } catch (error) {
      console.error('❌ Error joining family:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join family';
      Alert.alert('Error', errorMessage, [{ text: 'OK', style: 'default' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 py-8">
      <View className="flex-1 justify-center">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
            Welcome to Togheta!
          </Text>
          <Text className="text-lg text-gray-600 text-center mb-2">
            Manage tasks together with your family
          </Text>
          <Text className="text-base text-gray-500 text-center">
            Get started by creating a new family or joining an existing one
          </Text>
        </View>

        {!showJoinForm ? (
          <View className="space-y-4">
            <Button
              title="Start New Family"
              onPress={handleStartNewFamily}
              loading={loading}
              size="lg"
              fullWidth
            />
            
            <Button
              title="Join with Invite Code"
              onPress={() => setShowJoinForm(true)}
              variant="outline"
              size="lg"
              fullWidth
            />
          </View>
        ) : (
          <View className="space-y-4">
            <Text className="text-xl font-semibold text-gray-900 text-center mb-4">
              Join Family
            </Text>
            
            <Input
              placeholder="Enter 6-digit invite code"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
            />
            
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <Button
                  title="Join Family"
                  onPress={handleJoinFamily}
                  loading={loading}
                  disabled={inviteCode.length !== 6}
                  variant="primary"
                  fullWidth
                />
              </View>
              
              <View className="flex-1">
                <Button
                  title="Back"
                  onPress={() => {
                    setShowJoinForm(false);
                    setInviteCode('');
                  }}
                  variant="outline"
                  fullWidth
                />
              </View>
            </View>
          </View>
        )}
      </View>
      <LogoutButton />
      <View className="mt-8">
        <Text className="text-sm text-gray-400 text-center">
          You can always invite more family members later
        </Text>
      </View>
    </View>
  );
}
