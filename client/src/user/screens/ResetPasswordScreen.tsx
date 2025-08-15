import React from 'react';
import { UserComponent } from '../../mediator';

const user = new UserComponent();

const ResetPasswordScreen = () => {
  return user.renderResetPasswordForm("ResetPasswordScreen");
};

export default ResetPasswordScreen;
