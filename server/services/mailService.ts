import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
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

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    // These are test credentials. In a production environment, these should be
    // replaced with actual credentials from a secure source.
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'testuser',
        pass: 'testpass',
      },
    });
  }

  async sendMail(mailOptions: MailOptions) {
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error: any) {
      await this.addToOutbox(mailOptions, error);
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
      where: { retries: { lt: 3 } },
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
