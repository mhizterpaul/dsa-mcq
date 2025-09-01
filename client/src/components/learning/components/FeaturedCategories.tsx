import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Button } from 'react-native-ui-lib';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { LearningRootState } from '../store';
import { addCategory, setCategories } from '../store/category.slice';
import { Category } from '../store/primitives/Category';

const FeaturedCategories = () => {
  const categories = useSelector((state: LearningRootState) => Object.values(state.categories.entities));
  const featuredCategories = categories.filter((c) => c.featured);
  const dispatch = useDispatch();

  const handleSelectCategory = (categoryName: string) => {
    console.log('Selected category:', categoryName);
  };

  const handleAddDummyData = () => {
    const dummyCategories: Category[] = [
      new Category('1', 'SPORTS', 0, true, 'basketball', '#FF7A3C'),
      new Category('2', 'SPACE', 0, true, 'rocket', '#7B61FF'),
      new Category('3', 'ART', 0, true, 'palette', '#2EC4B6'),
      new Category('4', 'SCIENCE', 0, true, 'flask', '#FFBE0B'),
    ];
    dispatch(setCategories(dummyCategories));
  };

  useEffect(() => {
    handleAddDummyData();
  }, []);

  return (
    <View>
        <Text text70b color_grey10 marginT-28 marginL-18 marginB-10>Featured Categories</Text>
        <View row spread marginH-12>
            {featuredCategories.slice(0, 2).map((category) => (
                <TouchableOpacity key={category.id} style={{width: '47%'}} onPress={() => handleSelectCategory(category.name)}>
                    <View row centerV bg-white br20 paddingV-18 paddingH-16 style={{elevation: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3}}>
                        <Icon name={category.icon} size={22} color={category.color} />
                        <Text text80b color_grey10 marginL-10>{category.name}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
        <View row spread marginH-12>
            {featuredCategories.slice(2, 4).map((category) => (
                <TouchableOpacity key={category.id} style={{width: '47%'}} onPress={() => handleSelectCategory(category.name)}>
                    <View row centerV bg-white br20 paddingV-18 paddingH-16 style={{elevation: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 3}}>
                        <Icon name={category.icon} size={22} color={category.color} />
                        <Text text80b color_grey10 marginL-10>{category.name}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    </View>
  );
};

export default FeaturedCategories;
