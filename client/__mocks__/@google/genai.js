class GoogleGenerativeAI {
    constructor(apiKey) {
        // mock constructor
    }

    getGenerativeModel(model) {
        return {
            generateContent: (prompt) => {
                return Promise.resolve({
                    response: {
                        text: () => {
                            return JSON.stringify({
                                correct_approach: 'Mocked correct approach',
                                incorrect_approach: 'Mocked incorrect approach',
                            });
                        }
                    }
                });
            }
        };
    }
}

module.exports = {
    GoogleGenerativeAI,
};
