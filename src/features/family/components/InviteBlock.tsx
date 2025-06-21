import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native';

const FamilyForm = () => {
  const inviteCode = 'ABCD-1234';
  return (
   <View className="mt-6 p-4 border rounded-lg border-gray-200 bg-gray-50">
           <Text className="text-sm mb-2">Share this code:</Text>
           <Text className="font-mono text-lg mb-4">{inviteCode}</Text>
   
           <View className="flex-row gap-4">
             <TouchableOpacity className="flex-1 bg-black py-3 rounded-md">
               <Text className="text-white text-center">Copy Code</Text>
             </TouchableOpacity>
             <TouchableOpacity className="flex-1 border border-black py-3 rounded-md">
               <Text className="text-black text-center">Send Invite</Text>
             </TouchableOpacity>
           </View>
         </View>
  )
}

export default FamilyForm;