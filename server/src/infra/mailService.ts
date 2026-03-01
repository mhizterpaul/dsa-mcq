import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export class MailService {
  private transporter: nodemailer.Transporter;
  private prisma: PrismaClient;
  public static readonly MAX_RETRIES = 3;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    /**
     * Mail Service configuration using OAuth2.
     * The following credentials (SERVICE, USER, CLIENTID, CLIENTSECRET, REFRESH_TOKEN)
     * are required to be set as environment variables.
     */
    const service = process.env.SERVICE || 'gmail';
    const user = process.env.USER || 'dev.paulirem@gmail.com';
    const clientId = process.env.CLIENTID;
    const clientSecret = process.env.CLIENTSECRET;
    const refreshToken = process.env.REFRESH_TOKEN;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI ? `${process.env.GOOGLE_REDIRECT_URI}/oauth2callback` : 'https://developers.google.com/oauthplayground';

    // OAuth2 client setup for Refresh Token flow
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    if (refreshToken) {
      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });
    }

    this.transporter = nodemailer.createTransport({
      service,
      auth: {
        type: 'OAuth2',
        user,
        clientId,
        clientSecret,
        refreshToken,
        accessToken: refreshToken ? (oauth2Client.getAccessToken().then(res => res.token) as any) : undefined,
      },
    } as any);
  }

  async sendMail(mailOptions: MailOptions) {
    try {
      const info = await this.transporter.sendMail(mailOptions);
      return info;
    } catch (error: any) {
      await this.addToOutbox(mailOptions, error);
      throw error;
    }
  }

  private async addToOutbox(mailOptions: MailOptions, error: any) {
    await this.prisma.outbox.create({
      data: {
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
        retries: 0,
        lastRetry: new Date(),
        error: error.message,
      },
    });
  }

  async retryFailedEmails() {
    const failedEmails = await this.prisma.outbox.findMany({
      where: { retries: { lt: MailService.MAX_RETRIES } },
    });

    for (const email of failedEmails) {
      try {
        const mailOptions = {
          to: email.to,
          subject: email.subject,
          html: email.html,
        };
        await this.transporter.sendMail(mailOptions);
        await this.prisma.outbox.delete({ where: { id: email.id } });
      } catch (error: any) {
        await this.prisma.outbox.update({
          where: { id: email.id },
          data: {
            retries: email.retries + 1,
            lastRetry: new Date(),
            error: error.message,
          },
        });
      }
    }
  }
}
