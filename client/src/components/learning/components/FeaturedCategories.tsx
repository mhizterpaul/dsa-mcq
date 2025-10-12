import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { RootState } from '../../../store';

const selectCategoriesEntities = (state: RootState) => state.learning.categories.entities;

const selectFeaturedCategories = createSelector(
  [selectCategoriesEntities],
  (entities) => Object.values(entities).filter(c => c?.featured)
);

const FeaturedCategories = () => {
  const featuredCategories = useSelector(selectFeaturedCategories);

  const handleSelectCategory = (categoryName: string) => {
    console.log('Selected category:', categoryName);
  };

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