import prisma from '../db/prisma';

class AnalyticsService {
    async getFeaturedCategories() {
        const categories = await prisma.category.findMany({
            include: {
                questions: {
                    select: {
                        likes: true,
                    },
                },
            },
        });

        const categoriesWithLikes = categories.map(category => {
            const totalLikes = category.questions.reduce((acc, q) => acc + q.likes, 0);
            return {
                ...category,
                totalLikes,
            };
        });

        const sortedCategories = categoriesWithLikes.sort((a, b) => b.totalLikes - a.totalLikes);

        return sortedCategories.slice(0, 5);
    }
}

export const analyticsService = new AnalyticsService();
