import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Question } from '../services/learningService';

interface QuestionCardProps {
    question: Question;
    selectedOption: string | null;
    onSelectAnswer: (answer: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedOption, onSelectAnswer }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.questionText}>{question.question}</Text>
            <View style={styles.optionsContainer}>
                {question.options.map((option, index) => {
                    const isSelected = selectedOption === option.text;
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.option,
                                isSelected ? styles.selectedOption : styles.unselectedOption,
                            ]}
                            onPress={() => onSelectAnswer(option.text)}
                            testID={`option-${index}`}
                        >
                            <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                                {option.text}
                            </Text>
                            <Icon
                                name={isSelected ? "check-circle-outline" : "circle"}
                                size={24}
                                color={isSelected ? "#6200EE" : "#E0E0E0"}
                                style={styles.icon}
                                testID={isSelected ? `selected-icon-${index}` : `unselected-icon-${index}`}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 20,
    },
    questionText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#000',
    },
    optionsContainer: {
        gap: 12,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    unselectedOption: {
        borderColor: '#E0E0E0',
        backgroundColor: '#fff',
    },
    selectedOption: {
        borderColor: '#6200EE',
        backgroundColor: '#F5F0FF',
    },
    optionText: {
        fontSize: 16,
        color: '#000',
        flex: 1,
    },
    selectedOptionText: {
        color: '#6200EE',
        fontWeight: '500',
    },
    icon: {
        marginLeft: 8,
    },
});

export default QuestionCard;
