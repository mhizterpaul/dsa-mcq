import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PromoBanner = () => {
  return (
    <View>
      <View style={styles.bannerBox}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>SPIN AND GET{`\n`}MORE REWARDS</Text>
          <TouchableOpacity style={styles.spinBtn}>
            <Text style={styles.spinBtnText}>Spin Now</Text>
          </TouchableOpacity>
        </View>
        <Icon name="cash-multiple" size={48} color="#FFBE0B" style={{ marginLeft: 10 }} />
      </View>
      <View style={styles.carouselDots}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D2756',
    borderRadius: 18,
    marginHorizontal: 18,
    marginTop: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  bannerTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    lineHeight: 22,
  },
  spinBtn: {
    backgroundColor: '#7B61FF',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 7,
    alignSelf: 'flex-start',
  },
  spinBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  carouselDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#FF7A3C',
  },
});

export default PromoBanner;
