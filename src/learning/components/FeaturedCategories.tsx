import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FeaturedCategories = ({ onSelectCategory }: { onSelectCategory: (category: string) => void }) => {
  return (
    <View>
        <Text style={styles.sectionTitle}>Featured Categories</Text>
        <View style={styles.categoriesGrid}>
          <TouchableOpacity style={styles.categoryBox} onPress={() => onSelectCategory('Sports')}>
            <Icon name="basketball" size={22} color="#FF7A3C" />
            <Text style={styles.categoryText}>SPORTS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryBox} onPress={() => onSelectCategory('Space')}>
            <Icon name="rocket" size={22} color="#7B61FF" />
            <Text style={styles.categoryText}>SPACE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryBox} onPress={() => onSelectCategory('Art')}>
            <Icon name="palette" size={22} color="#2EC4B6" />
            <Text style={styles.categoryText}>ART</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryBox} onPress={() => onSelectCategory('Science')}>
            <Icon name="flask" size={22} color="#FFBE0B" />
            <Text style={styles.categoryText}>SCIENCE</Text>
          </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#222',
        marginTop: 28,
        marginLeft: 18,
        marginBottom: 10,
      },
      categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: 12,
        justifyContent: 'space-between',
      },
      categoryBox: {
        width: '47%',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 18,
        marginBottom: 12,
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1,
      },
      categoryText: {
        fontWeight: '600',
        fontSize: 13,
        marginLeft: 10,
        color: '#222',
      },
});

export default FeaturedCategories;
