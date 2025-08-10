import { LearningComponent } from '../learning/interface';
import { EngagementComponent } from '../engagement/interface';
import { UserComponent } from '../user/interface';
import { AnalyticsComponent } from '../analytics/interface';

// This interface defines the contract for all components that the Mediator can manage.
export interface IComponent {
  // Placeholder for common methods, if any.
  // For now, we rely on the specific component classes.
}

export class Mediator {
  private components: {
    learning: LearningComponent;
    engagement: EngagementComponent;
    user: UserComponent;
    analytics: AnalyticsComponent;
  };

  constructor() {
    this.components = {
      learning: new LearningComponent(),
      engagement: new EngagementComponent(),
      user: new UserComponent(),
      analytics: new AnalyticsComponent(),
    };
  }

  initiate() {
    console.log("Mediator initiating workflow...");
    this.components.learning.loadQuestions();
    this.components.user.loadUserProfile();
    // ... and so on, following the sequence from the style guide.
  }

  getLearningComponent(): LearningComponent {
    return this.components.learning;
  }

  getEngagementComponent(): EngagementComponent {
    return this.components.engagement;
  }

  getUserComponent(): UserComponent {
    return this.components.user;
  }

  getAnalyticsComponent(): AnalyticsComponent {
    return this.components.analytics;
  }
}
