import React, { useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthForm } from './components';
import AsyncStorage from '@react-native-async-storage/async-storage';
const storeData = async (value: string) => {
  try {
    await AsyncStorage.setItem('my-key', value);
  } catch (e) {
    // saving error
  }
};
const getData = async (data: string) => {
  try {
    const value = await AsyncStorage.getItem(data);
    if (value !== null) {
      console.log(value);
    }
  } catch (e) {
    console.log(e);
  }
};
const getAllKeys = async () => {
  let keys: readonly string[] = [];
  try {
    keys = await AsyncStorage.getAllKeys();
  } catch (e) {
    // read key error
  }

  console.log(keys);
  // example console.log result:
  // ['@MyApp_user', '@MyApp_key']
};
const AuthScreen = () => {
  useEffect(() => {
    // Example usage of AsyncStorage
    storeData('Hello, World!');
    getAllKeys();
    getData('my-key');
    getData('lastOpenedStory');
  }, []);

  return (
    <SafeAreaView className="bg-background flex-1 pt-[120px]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-start">
            <AuthForm />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthScreen;
