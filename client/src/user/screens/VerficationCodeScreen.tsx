import React from 'react';
import { UserComponent } from '../../mediator';

const user = new UserComponent();

const VerificationCodeScreen = ({ navigation }) => {
  return user.renderVerificationCodeForm("VerificationCodeScreen", navigation);
};

export default VerificationCodeScreen;
