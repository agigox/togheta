import { View } from 'react-native';
import InviteBlock from './components/InviteBlock';
import Header from './components/Header';
import FamilyList from './components/FamilyList';


const FamilyScreen = () => {
  return (
   <View className="flex-1 bg-white px-6 pt-10">
      <Header />

      <FamilyList />

      <InviteBlock />
    </View>
  )
}

export default FamilyScreen