import { ILearningComponent, LearningComponent } from '../learning/interface';
import { IEngagementComponent, EngagementComponent } from '../engagement/interface';
import { IUserComponent, UserComponent } from '../user/interface';
import { IAnalyticsComponent, AnalyticsComponent } from '../analytics/interface';

export interface IMediator {
  initiate(): void;
  
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
    // ... and so on
  }

}
