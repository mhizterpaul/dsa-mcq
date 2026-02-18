import { EngagementComponent } from '../components/engagement/interface';

// This would represent the structure of a badge
interface Badge {
    id: string;
    name: string;
}

const getEarnedBadgesForSession = async (sessionId: string): Promise<Badge[]> => {
    console.log(`Mediator fetching badges for session: ${sessionId}`);

    // The mediator calls the engagement component to handle the logic.
    // The engagement component would have a method like `fetchBadgesForSession`.
    // Since we don't have that yet, we'll just mock the interaction.

    const engagementComponent = new EngagementComponent();
    // const badges = await engagementComponent.fetchBadgesForSession(sessionId);

    // Mocked response
    const mockBadges: Badge[] = [
        { id: 'badge-1', name: 'Quick Thinker' },
    ];

    return mockBadges;
};

const getUserProgress = async (userId: string): Promise<any> => {
    const engagementComponent = new EngagementComponent();
    return await engagementComponent.getUserMetrics(userId);
};

const mediatorService = {
    getEarnedBadgesForSession,
    getUserProgress,
};

export default mediatorService;
