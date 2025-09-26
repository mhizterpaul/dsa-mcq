import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { LearningRootState } from '../store';
import { setCategories } from '../store/category.slice';
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
  }, [dispatch]);

  return (
    <View style={styles.container}>
        <Text style={styles.title}>Featured Categories</Text>
        <View style={styles.grid}>
            {featuredCategories.map((category) => (
                <Card
                    key={category.id}
                    style={styles.card}
                    onPress={() => handleSelectCategory(category.name)}
                >
                    <Card.Content style={styles.cardContent}>
                        <Icon name={category.icon} size={22} color={category.color} />
                        <Text style={styles.categoryName}>{category.name}</Text>
                    </Card.Content>
                </Card>
            ))}
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 28, // marginT-28
        marginHorizontal: 18, // marginH-18
    },
    title: {
        fontSize: 18, // text70b
        fontWeight: 'bold', // text70b
        color: '#212121', // color_grey10
        marginBottom: 10, // marginB-10
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 3,
        backgroundColor: 'white',
        borderRadius: 20, // br20
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18, // paddingV-18
        paddingHorizontal: 16, // paddingH-16
    },
    categoryName: {
        fontSize: 14, // text80b
        fontWeight: 'bold', // text80b
        color: '#212121', // color_grey10
        marginLeft: 10, // marginL-10
    },
});

export default FeaturedCategories;