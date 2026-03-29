import { EngagementComponentImpl } from '../components/engagement/EngagementComponentImpl';

interface Badge {
    id: string;
    name: string;
}

const getEarnedBadgesForSession = async (sessionId: string): Promise<Badge[]> => {
    console.log(`Mediator fetching badges for session: ${sessionId}`);
    const engagementComponent = new EngagementComponentImpl();
    return await engagementComponent.fetchBadgesForSession(sessionId);
};

const getUserProgress = async (userId: string): Promise<any> => {
    const engagementComponent = new EngagementComponentImpl();
    return await engagementComponent.getUserMetrics(userId);
};

const mediatorService = {
    getEarnedBadgesForSession,
    getUserProgress,
};

export default mediatorService;
