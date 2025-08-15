import React from 'react';
import { UserComponent } from '../../mediator';

const user = new UserComponent();

const WelcomeScreen = () => {
  return user.renderWelcome("WelcomeScreen");
};

export default WelcomeScreen;
