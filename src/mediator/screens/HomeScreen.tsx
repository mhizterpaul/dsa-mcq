import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const avatarUri = 'https://randomuser.me/api/portraits/men/32.jpg'; // Placeholder avatar

const HomeScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top: Profile & Score */}
        <View style={styles.topRow}>
          <View style={styles.profileRow}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
            <View>
              <Text style={styles.helloText}>Hello!</Text>
              <Text style={styles.nameText}>Ivan L.</Text>
            </View>
          </View>
          <View style={styles.scoreBox}>
            <Icon name="diamond" size={18} color="#fff" />
            <Text style={styles.scoreText}>1200</Text>
          </View>
        </View>

        {/* Game Modes */}
        <View style={styles.modesRow}>
          <TouchableOpacity style={[styles.modeBox, { backgroundColor: '#FF7A3C' }]}> 
            <Icon name="plus" size={28} color="#fff" />
            <Text style={styles.modeText}>Create Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeBox, { backgroundColor: '#7B61FF' }]}> 
            <Icon name="account" size={28} color="#fff" />
            <Text style={styles.modeText}>Solo Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeBox, { backgroundColor: '#2EC4B6' }]}> 
            <Icon name="account-group" size={28} color="#fff" />
            <Text style={styles.modeText}>Multiplayer</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.arrowBox}>
            <Icon name="chevron-right" size={28} color="#FF7A3C" />
          </TouchableOpacity>
        </View>

        {/* Featured Categories */}
        <Text style={styles.sectionTitle}>Featured Categories</Text>
        <View style={styles.categoriesGrid}>
          <TouchableOpacity style={styles.categoryBox} onPress={() => navigation.navigate('Quiz')}>
            <Icon name="basketball" size={22} color="#FF7A3C" />
            <Text style={styles.categoryText}>SPORTS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryBox}>
            <Icon name="rocket" size={22} color="#7B61FF" />
            <Text style={styles.categoryText}>SPACE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryBox}>
            <Icon name="palette" size={22} color="#2EC4B6" />
            <Text style={styles.categoryText}>ART</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryBox}>
            <Icon name="flask" size={22} color="#FFBE0B" />
            <Text style={styles.categoryText}>SCIENCE</Text>
          </TouchableOpacity>
        </View>

        {/* Promo Banner */}
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

        {/* Recent Quiz */}
        <View style={styles.recentRow}>
          <Text style={styles.sectionTitle}>Recent Quiz</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {/* Add recent quiz items here if needed */}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color="#FF7A3C" />
          <Text style={[styles.navText, { color: '#FF7A3C' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="bookmark" size={24} color="#B0B0B0" />
          <Text style={styles.navText}>Bookmark</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Leaderboard')}>
          <Icon name="trophy" size={24} color="#B0B0B0" />
          <Text style={styles.navText}>Leaderboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="account-circle" size={24} color="#B0B0B0" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FF' },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 18,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  helloText: { color: '#B0B0B0', fontSize: 13, fontWeight: '500' },
  nameText: { color: '#222', fontSize: 16, fontWeight: 'bold' },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22223B',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 60,
    justifyContent: 'center',
  },
  scoreText: { color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 15 },
  modesRow: {
    flexDirection: 'row',
    marginTop: 22,
    marginHorizontal: 18,
    alignItems: 'center',
  },
  modeBox: {
    flex: 1,
    height: 74,
    borderRadius: 16,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  arrowBox: {
    width: 36,
    height: 74,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  modeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    marginTop: 6,
  },
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
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: 28,
    marginBottom: 10,
  },
  seeAll: {
    color: '#FF7A3C',
    fontWeight: 'bold',
    fontSize: 13,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 11,
    color: '#B0B0B0',
    fontWeight: '600',
    marginTop: 2,
  },
});

export default HomeScreen; 