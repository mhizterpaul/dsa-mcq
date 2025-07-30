import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const quizData = {
  title: 'Aptitude Test',
  timer: '2:00',
  questionNumber: 1,
  totalQuestions: 2,
  question: 'If a car travels 200 miles in 4 hours, what is its average speed?',
  options: [
    '40 Mph',
    '50 Mph',
    '60 Mph',
    '70 Mph',
  ],
};

const QuizScreen = ({ navigation }: any) => {
  const [selected, setSelected] = useState(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIcon}>
            <Icon name="chevron-left" size={28} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{quizData.title}</Text>
          <View style={styles.headerRight}>
            <Icon name="clock-outline" size={20} color="#A259FF" />
            <Text style={styles.timerText}>{quizData.timer}</Text>
          </View>
        </View>
        <View style={styles.headerUnderline} />

        {/* Progress Bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${(quizData.questionNumber / quizData.totalQuestions) * 100}%` }]} />
        </View>

        {/* Question Section */}
        <View style={styles.questionSection}>
          <Text style={styles.questionCount}>
            Questions {quizData.questionNumber} of {quizData.totalQuestions}
          </Text>
          <Text style={styles.questionText}>{quizData.question}</Text>

          {/* Options */}
          <FlatList
            data={quizData.options}
            keyExtractor={(item) => item}
            renderItem={({ item, index }) => {
              const isSelected = selected === index;
              return (
                <TouchableOpacity
                  style={[styles.optionBox, isSelected && styles.optionBoxSelected]}
                  onPress={() => setSelected(index)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{item}</Text>
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            }}
            style={{ marginTop: 24 }}
          />
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextBtn}>
          <Text style={styles.nextBtnText}>Next</Text>
          <Icon name="arrow-right" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 0,
    backgroundColor: '#fff',
  },
  headerIcon: {
    padding: 4,
    marginRight: 2,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#222',
    flex: 1,
    textAlign: 'center',
    marginLeft: -28,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    color: '#A259FF',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 4,
  },
  headerUnderline: {
    height: 2,
    backgroundColor: '#A259FF',
    marginTop: 10,
    marginBottom: 0,
    marginHorizontal: 0,
    opacity: 0.2,
  },
  progressBarBg: {
    height: 7,
    backgroundColor: '#F3EFFF',
    borderRadius: 4,
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 0,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 7,
    backgroundColor: '#A259FF',
    borderRadius: 4,
  },
  questionSection: {
    paddingHorizontal: 18,
    paddingTop: 24,
    flex: 1,
  },
  questionCount: {
    color: '#A259FF',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 10,
  },
  questionText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 19,
    marginBottom: 10,
    lineHeight: 26,
  },
  optionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  optionBoxSelected: {
    borderColor: '#A259FF',
    backgroundColor: '#F6F0FF',
  },
  optionText: {
    color: '#222',
    fontSize: 15,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#A259FF',
    fontWeight: 'bold',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  radioOuterSelected: {
    borderColor: '#A259FF',
    backgroundColor: '#F6F0FF',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#A259FF',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 12,
    marginHorizontal: 18,
    marginBottom: 24,
    marginTop: 8,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  nextBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default QuizScreen; 