import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LearningComponent } from '../../learning/interface';

const learning = new LearningComponent();

const QuizScreen = ({ navigation }: any) => {
  const handleNext = () => {
    console.log('Next button pressed');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
            <Icon name="chevron-left" size={28} color="#222" />
          </TouchableOpacity>
        </View>
        {learning.renderQuiz(handleNext)}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F8FF',
  },
  container: {
    flex: 1,
    margin: 0,
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 0,
    marginTop: 0,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
    shadowColor: '#A259FF',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 0,
    backgroundColor: '#fff',
  },
  headerIcon: {
    padding: 4,
  },
});

export default QuizScreen; 