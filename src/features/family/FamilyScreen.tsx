import React from 'react'
import { View, Text } from 'react-native';
import FamilyForm from './components/FamilyForm';

const FamilyScreen = () => {
  return (
   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Family Screen</Text>
        <Text style={{ marginTop: 16, textAlign: 'center' }}>
          This is a protected route.{'\n'}
          Only authenticated users can see this.
          <FamilyForm />
        </Text>
      </View>
  )
}

export default FamilyScreen