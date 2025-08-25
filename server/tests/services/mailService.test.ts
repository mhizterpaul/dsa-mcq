import { mailService } from '../../services/mailService';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailService', () => {
  let sendMailMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    sendMailMock = jest.fn();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });
  });

  it('should send an email successfully', async () => {
    const mailOptions = {
      to: 'test@example.com',
      subject: 'Test',
      html: '<h1>Test</h1>',
    };
    await mailService.sendMail(mailOptions);
    expect(sendMailMock).toHaveBeenCalledWith(mailOptions);
  });

  it('should add a failed email to the outbox', async () => {
    sendMailMock.mockRejectedValue(new Error('Failed to send email'));
    const mailOptions = {
      to: 'test@example.com',
      subject: 'Test',
      html: '<h1>Test</h1>',
    };
    await mailService.sendMail(mailOptions);
    const outbox = mailService.getOutbox();
    expect(outbox).toHaveLength(1);
    expect(outbox[0].mailOptions).toEqual(mailOptions);
  });

  it('should retry failed emails and remove them from the outbox on success', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('Failed to send email'));
    sendMailMock.mockResolvedValueOnce({}); // Succeed on retry

    const mailOptions = {
      to: 'test@example.com',
      subject: 'Test',
      html: '<h1>Test</h1>',
    };
    await mailService.sendMail(mailOptions);
    await mailService.retryFailedEmails();
    const outbox = mailService.getOutbox();
    expect(outbox).toHaveLength(0);
  });
});
