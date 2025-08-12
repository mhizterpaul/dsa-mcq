import { ILearningComponent, LearningComponent } from '../learning/interface';
import { IEngagementComponent, EngagementComponent } from '../engagement/interface';
import { IUserComponent, UserComponent } from '../user/interface';
import { IAnalyticsComponent, AnalyticsComponent } from '../analytics/interface';

export interface IMediator {
  initiate(): void;
  getLearningComponent(): ILearningComponent;
  getEngagementComponent(): IEngagementComponent;
  getUserComponent(): IUserComponent;
  getAnalyticsComponent(): IAnalyticsComponent;

  // Methods for cross-component communication
  renderLeaderboard(): void;
  scheduleReminders(): void;
}

export class Mediator implements IMediator {
  private learning: ILearningComponent;
  private engagement: IEngagementComponent;
  private user: IUserComponent;
  private analytics: IAnalyticsComponent;

  constructor() {
    this.learning = new LearningComponent();
    this.engagement = new EngagementComponent();
    this.user = new UserComponent();
    this.analytics = new AnalyticsComponent();
  }

  initiate() {
    console.log("Mediator initiating workflow...");
    this.learning.loadQuestions();
    this.user.loadUserProfile();
    // ... and so on
  }

  // Getter methods for components
  getLearningComponent(): ILearningComponent {
    return this.learning;
  }

  getEngagementComponent(): IEngagementComponent {
    return this.engagement;
  }

  getUserComponent(): IUserComponent {
    return this.user;
  }

  getAnalyticsComponent(): IAnalyticsComponent {
    return this.analytics;
  }

  // Cross-component communication methods
  renderLeaderboard() {
    this.engagement.renderLeaderboard();
  }

  scheduleReminders() {
    this.engagement.scheduleReminders();
  }
}
