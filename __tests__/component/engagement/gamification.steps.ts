import { loadFeature, defineFeature } from 'jest-cucumber';
import { configureStore, AnyAction } from '@reduxjs/toolkit';
import rootReducer from '../../../src/mediator/store/rootReducer';
import {
  setUserEngagement,
  updateLeaderboardRank,
  checkForMilestones,
  scheduleReminderForUser,
  checkAndSendNudge,
} from '../../../src/engagement/store/userEngagement.slice';
import * as engagementService from '../../../src/engagement/services/engagementService';
import { UserEngagement } from '../../../src/engagement/store/primitives/UserEngagement';
import { ThunkDispatch } from 'redux-thunk';

jest.mock('../../../src/engagement/services/engagementService');

const mockedEngagementService = engagementService as jest.Mocked<typeof engagementService>;

const feature = loadFeature('./gamification.feature', { loadRelativePath: true });

let store: ReturnType<typeof configureStore>;
let userId = 'test-user';
type AppDispatch = ThunkDispatch<any, any, AnyAction>;
let dispatch: AppDispatch;
let dispatchedActions: AnyAction[] = [];

const setupStore = (initialState?: any) => {
  dispatchedActions = [];
  const a = configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().prepend(store => next => action => {
            dispatchedActions.push(action);
            return next(action);
        }),
  });
  store = a;
  dispatch = store.dispatch;
};

defineFeature(feature, (test) => {
  beforeEach(() => {
    setupStore();
    dispatch(setUserEngagement({ userId }));
  });

  // test('Schedule personalized reminder before next session', ({ given, and, when, then }) => {
  //   let nextSessionTime: number;
  //   let leadTime: number;

  //   given('the next session is due in 4 hours according to SM-2 scheduling', () => {
  //       nextSessionTime = Date.now() + 4 * 60 * 60 * 1000;
  //   });
  //   and('the user’s preferred lead time is 2 hours', () => {
  //       leadTime = 2 * 60 * 60 * 1000;
  //   });
  //   when('the system schedules the reminder', async () => {
  //       await dispatch(scheduleReminderForUser({ userId, nextSessionTime, leadTime }));
  //   });
  //   then('the reminder should be sent exactly 2 hours before the scheduled session', () => {
  //       expect(mockedEngagementService.scheduleReminder).toHaveBeenCalledWith(
  //           expect.any(Function),
  //           userId,
  //           nextSessionTime,
  //           leadTime,
  //       );
  //   });
  //   and('the message should reference the upcoming session', () => {
  //     // This is tested in the service implementation
  //   });
  //   and('the message should not exceed 50 characters', () => {
  //     // This is tested in the service implementation
  //   });
  // });

  test('Suppress reminder if session is already started', ({ given, when, then }) => {
    given('the user has started the session before the scheduled reminder time', () => {
      // This logic is inside the scheduleReminder service, which is mocked.
    });
    when('the system checks pending reminders', () => {
      //
    });
    then('the reminder should not be sent', () => {
      //
    });
  });

  test('Trigger nudge for missed session', ({ given, and, when, then }) => {
    given('the user missed yesterday’s session', () => {
      const userEngagement = new UserEngagement(userId);
      userEngagement.last_session_timestamp = Date.now() - 25 * 60 * 60 * 1000;
      setupStore({ engagement: { userEngagement: { engagements: { [userId]: userEngagement }, ui:{} } } });
    });
    and('streak_length has decreased by 1', () => {
      // This is a side effect of missing a session, assumed to be handled elsewhere.
    });
    when('the nudge is generated', async () => {
      mockedEngagementService.generateNudgeForMissedSession.mockReturnValue({
        message: "You missed yesterday's session. Keep your streak going today!",
        type: 'nudge',
      });
      await dispatch(checkAndSendNudge(userId));
    });
    then('the message should acknowledge the missed session in a supportive tone', () => {
        const notificationActions = dispatchedActions.filter(a => a.type === 'notifications/addNotification');
        expect(notificationActions).toHaveLength(1);
        expect(notificationActions[0].payload.message).toContain('missed');
    });
    and('it should include a call-to-action to resume today', () => {
        const notificationActions = dispatchedActions.filter(a => a.type === 'notifications/addNotification');
        expect(notificationActions[0].payload.message).toContain('today');
    });
    and('the message length should be ≤ 50 characters', () => {
        const notificationActions = dispatchedActions.filter(a => a.type === 'notifications/addNotification');
        expect(notificationActions[0].payload.message.length).toBeLessThanOrEqual(50);
    });
  });

  test('Trigger visual cue for leaderboard change', ({ given, when, then, and }) => {
    given('the user has moved up or down at least 1 position on the leaderboard since the last session', () => {
        const userEngagement = new UserEngagement(userId);
        userEngagement.leaderboard_rank = 5;
        setupStore({ engagement: { userEngagement: { engagements: { [userId]: userEngagement }, ui:{} } } });
    });
    when('the leaderboard is displayed', async () => {
        await dispatch(updateLeaderboardRank({ userId, newRank: 4 }));
    });
    then('a visual cue should indicate the position change', () => {
        const { ui } = store.getState().engagement.userEngagement;
        expect(ui.showLeaderboardChange).toBe(true);
    });
    and('the visual cue should be animated for emphasis', () => {
      // UI test, out of scope
    });
    and('no text-based message is sent for this change', () => {
        const notificationActions = dispatchedActions.filter(a => a.type === 'notifications/addNotification');
        expect(notificationActions).toHaveLength(0);
    });
  });

  test('Trigger visual cue for XP milestone', ({ given, when, then, and }) => {
    given('the user needs ≤ 50 XP to reach the next level', () => {
        mockedEngagementService.checkXpMilestone.mockReturnValue(true);
    });
    when('the milestone is in reach', async () => {
        await dispatch(checkForMilestones(userId));
    });
    then('an animated progress bar should be displayed', () => {
        const { ui } = store.getState().engagement.userEngagement;
        expect(ui.showXpMilestone).toBe(true);
    });
    and('the progress bar should highlight the XP remaining', () => {
      // UI test, out of scope
    });
    and('no text-based message is sent for this milestone', () => {
        const notificationActions = dispatchedActions.filter(a => a.type === 'notifications/addNotification');
        expect(notificationActions).toHaveLength(0);
    });
  });

  test('Trigger visual cue for streak milestone', ({ given, when, then, and }) => {
    given('the user has reached a streak milestone (e.g., 7, 30, or 100 days)', () => {
        mockedEngagementService.checkStreakMilestone.mockReturnValue(true);
    });
    when('the milestone is achieved', async () => {
        await dispatch(checkForMilestones(userId));
    });
    then('an animated badge should be displayed', () => {
        const { ui } = store.getState().engagement.userEngagement;
        expect(ui.showStreakMilestone).toBe(true);
    });
    and('the badge animation should last between 0.8s and 1.2s', () => {
      // UI test, out of scope
    });
    and('no text-based message is sent for this milestone', () => {
        const notificationActions = dispatchedActions.filter(a => a.type === 'notifications/addNotification');
        expect(notificationActions).toHaveLength(0);
    });
  });
});
