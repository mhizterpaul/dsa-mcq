import { MailService } from '../../src/services/mailService';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    outbox: {
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  })),
}));

jest.mock('nodemailer');

describe('MailService', () => {
  let mailService: MailService;
  let prisma: PrismaClient;
  let sendMailMock: jest.Mock;

  beforeEach(() => {
    prisma = new PrismaClient();
    sendMailMock = jest.fn();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });
    mailService = new MailService(prisma);
  });

  it('should send an email successfully', async () => {
    const mailOptions = {
      to: 'test@example.com',
      subject: 'Test',
      html: '<h1>Test</h1>',
    };
    await mailService.sendMail(mailOptions);
    expect(sendMailMock).toHaveBeenCalledWith(mailOptions);
    expect(prisma.outbox.create).not.toHaveBeenCalled();
  });

  it('should add a failed email to the outbox', async () => {
    sendMailMock.mockRejectedValue(new Error('Failed to send email'));
    const mailOptions = {
      to: 'test@example.com',
      subject: 'Test',
      html: '<h1>Test</h1>',
    };
    await mailService.sendMail(mailOptions);
    expect(prisma.outbox.create).toHaveBeenCalledWith({
      data: {
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
        retries: 0,
        lastRetry: expect.any(Date),
        error: 'Failed to send email',
      },
    });
  });

  it('should retry failed emails and remove them from the outbox on success', async () => {
    const failedEmail = {
      id: '1',
      to: 'test@example.com',
      subject: 'Test',
      html: '<h1>Test</h1>',
      retries: 0,
      lastRetry: new Date(),
      error: 'Failed to send email',
      createdAt: new Date(),
    };
    (prisma.outbox.findMany as jest.Mock).mockResolvedValue([failedEmail]);
    sendMailMock.mockResolvedValueOnce({}); // Succeed on retry

    await mailService.retryFailedEmails();
    expect(sendMailMock).toHaveBeenCalledWith({
      to: failedEmail.to,
      subject: failedEmail.subject,
      html: failedEmail.html,
    });
    expect(prisma.outbox.delete).toHaveBeenCalledWith({ where: { id: failedEmail.id } });
  });
});
