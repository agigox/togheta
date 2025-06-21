import React from 'react'
import { View, Text, FlatList } from 'react-native';
const familyMembers = [
  { id: '1', name: 'You (John)' },
  { id: '2', name: 'Clara (Pending)' },
  { id: '3', name: 'Sarah' },
];
const FamilyList = () => {
  return (
   <View>
           <Text className="text-sm text-gray-500 mb-2">Current Members:</Text>
      <FlatList
        data={familyMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mb-2 border-b border-gray-100 pb-2">
            <Text className="text-base">{item.name}</Text>
          </View>
        )}
      />
         </View>
  )
}

export default FamilyList;