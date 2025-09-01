import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Question } from '../services/learningService';

interface QuestionCardProps {
    question: Question;
    onSelectAnswer: (answer: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onSelectAnswer }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const handleSelect = (optionText: string) => {
        setSelectedOption(optionText);
        onSelectAnswer(optionText);
    };

    return (
        <View style={styles.card}>
            <Text style={styles.questionText}>{question.question}</Text>
            <View style={styles.optionsContainer}>
                {question.options.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.option,
                            selectedOption === option.text && styles.selectedOption,
                        ]}
                        onPress={() => handleSelect(option.text)}
                    >
                        <Text style={styles.optionText}>{option.text}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        margin: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    questionText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    optionsContainer: {
        // styles for the container of options
    },
    option: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 15,
        marginBottom: 10,
    },
    selectedOption: {
        backgroundColor: '#d3eaff',
        borderColor: '#007bff',
    },
    optionText: {
        fontSize: 16,
    },
});

export default QuestionCard;
