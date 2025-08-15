import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FeaturedCategories = () => {
  return (
    <View>
        <Text text70b color_grey10 marginT-28 marginL-18 marginB-10>Featured Categories</Text>
        <View row spread marginH-12>
          <TouchableOpacity style={{width: '47%'}} onPress={() => onSelectCategory('Sports')}>
            <View row centerV bg-white br20 paddingV-18 paddingH-16 style={{elevation: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3}}>
                <Icon name="basketball" size={22} color="#FF7A3C" />
                <Text text80b color_grey10 marginL-10>SPORTS</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={{width: '47%'}} onPress={() => onSelectCategory('Space')}>
            <View row centerV bg-white br20 paddingV-18 paddingH-16 style={{elevation: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3}}>
                <Icon name="rocket" size={22} color="#7B61FF" />
                <Text text80b color_grey10 marginL-10>SPACE</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View row spread marginH-12>
            <TouchableOpacity style={{width: '47%'}} onPress={() => onSelectCategory('Art')}>
                <View row centerV bg-white br20 paddingV-18 paddingH-16 style={{elevation: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3}}>
                    <Icon name="palette" size={22} color="#2EC4B6" />
                    <Text text80b color_grey10 marginL-10>ART</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={{width: '47%'}} onPress={() => onSelectCategory('Science')}>
                <View row centerV bg-white br20 paddingV-18 paddingH-16 style={{elevation: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3}}>
                    <Icon name="flask" size={22} color="#FFBE0B" />
                    <Text text80b color_grey10 marginL-10>SCIENCE</Text>
                </View>
            </TouchableOpacity>
        </View>
    </View>
  );
};

export default FeaturedCategories;
