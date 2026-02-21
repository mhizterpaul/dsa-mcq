import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Text, ActivityIndicator, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { UserRootState } from '../store';
import { toggleBookmark } from '../store/userProfile.slice';
import { QuestionResponse } from '../store/primitives/UserProfile';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { learningService, Question } from '../../learning/services/learningService';

const BookmarkItem = ({
    bookmark,
    index,
    question,
    isExpanded,
    onToggle
}: {
    bookmark: QuestionResponse,
    index: number,
    question?: Question,
    isExpanded: boolean,
    onToggle: () => void
}) => {
    return (
        <View style={styles.itemContainer}>
            <TouchableOpacity
                style={styles.collapsedView}
                onPress={onToggle}
                testID={`bookmark-item-${index}`}
            >
                <Text style={styles.itemIndex}>{index + 1}</Text>
                <View style={styles.collapsedContent}>
                    <Text
                        style={styles.questionTextPreview}
                        numberOfLines={1}
                        testID={`bookmark-title-${index}`}
                    >
                        {question?.question || `Question ${bookmark.questionId}`}
                    </Text>
                    <Text style={styles.questionType}>Multiple choice</Text>
                </View>
                <TouchableOpacity testID={`three-dots-${index}`}>
                    <Feather name="more-vertical" size={20} color="#888" />
                </TouchableOpacity>
            </TouchableOpacity>

            {isExpanded && question && (
                <View style={styles.expandedView} testID={`expanded-view-${index}`}>
                    <Text style={styles.fullQuestionText}>{question.question}</Text>
                    <View style={styles.optionsContainer}>
                        {question.options.map((option, optIndex) => {
                            const isSelected = option.text === bookmark.mostRecentAnswer;
                            const isCorrect = option.isCorrect;

                            return (
                                <View
                                    key={optIndex}
                                    style={[
                                        styles.optionItem,
                                        isSelected && styles.selectedOption
                                    ]}
                                    testID={`option-${index}-${optIndex}`}
                                >
                                    <View style={[
                                        styles.radioCircle,
                                        isSelected && styles.selectedRadioCircle
                                    ]}>
                                        {isSelected && <View style={styles.selectedInnerCircle} />}
                                    </View>
                                    <Text style={styles.optionText}>{option.text}</Text>
                                    {isSelected && (
                                        <MaterialIcons
                                            name={isCorrect ? "check-circle" : "cancel"}
                                            size={20}
                                            color={isCorrect ? "green" : "red"}
                                            style={styles.statusIcon}
                                            testID="status-icon"
                                        />
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </View>
            )}
            <Divider />
        </View>
    );
};

const BookmarkList = () => {
    const profile = useSelector((state: UserRootState) => state.profile.profile);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [questions, setQuestions] = useState<Record<string, Question>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (profile && profile.bookmarks.length > 0) {
                setLoading(true);
                setError(null);
                try {
                    const ids = profile.bookmarks.map(b => parseInt(b.questionId, 10));
                    const fetchedQuestions = await learningService.getQuestionsByIds(ids);
                    const questionMap = fetchedQuestions.reduce((acc, q) => {
                        acc[String(q.id)] = q;
                        return acc;
                    }, {} as Record<string, Question>);
                    setQuestions(questionMap);
                } catch (error) {
                    console.error("Error fetching bookmarked questions:", error);
                    setError("Failed to load bookmarks");
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchQuestions();
    }, [profile?.bookmarks]);

    const filteredBookmarks = useMemo(() => {
        if (!profile) return [];
        return profile.bookmarks.filter(b => {
            const question = questions[b.questionId];
            if (!question) return b.questionId.includes(searchQuery);
            return question.question.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [profile?.bookmarks, questions, searchQuery]);

    if (!profile) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator animating={true} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    testID="search-bar"
                />
            </View>

            <Text style={styles.header}>Bookmarks ({filteredBookmarks.length})</Text>

            {loading && Object.keys(questions).length === 0 ? (
                <ActivityIndicator animating={true} style={{ marginTop: 20 }} />
            ) : error ? (
                <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: 'red' }]}>{error}</Text>
                </View>
            ) : filteredBookmarks.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No bookmarks yet</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredBookmarks}
                    keyExtractor={(item) => item.questionId}
                    renderItem={({ item, index }) => (
                        <BookmarkItem
                            bookmark={item}
                            index={index}
                            question={questions[item.questionId]}
                            isExpanded={expandedId === item.questionId}
                            onToggle={() => setExpandedId(expandedId === item.questionId ? null : item.questionId)}
                        />
                    )}
                    contentContainerStyle={styles.scrollContent}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        margin: 20,
        paddingHorizontal: 15,
        borderRadius: 10,
        height: 45,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    header: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'grey',
        marginHorizontal: 20,
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    scrollContent: {
        paddingHorizontal: 0,
    },
    itemContainer: {
        backgroundColor: '#fff',
    },
    collapsedView: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        height: 80,
    },
    itemIndex: {
        fontSize: 16,
        color: 'grey',
        marginRight: 15,
        width: 25,
    },
    collapsedContent: {
        flex: 1,
    },
    questionTextPreview: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    questionType: {
        fontSize: 12,
        color: 'grey',
        marginTop: 4,
    },
    expandedView: {
        padding: 20,
        paddingTop: 0,
        backgroundColor: '#fafafa',
    },
    fullQuestionText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
        marginBottom: 20,
    },
    optionsContainer: {
        gap: 12,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#fff',
    },
    selectedOption: {
        borderColor: '#6200EE',
        backgroundColor: '#f6f0ff',
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    selectedRadioCircle: {
        borderColor: '#6200EE',
    },
    selectedInnerCircle: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#6200EE',
    },
    optionText: {
        flex: 1,
        fontSize: 15,
    },
    statusIcon: {
        marginLeft: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: 'grey',
    },
});

export default BookmarkList;
