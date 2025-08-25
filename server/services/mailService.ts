import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

interface OutboxEntry {
  mailOptions: MailOptions;
  retries: number;
  lastRetry: Date;
  error: string;
}

const OUTBOX_PATH = path.resolve(__dirname, '../outbox.json');

class MailService {
  private transporter: nodemailer.Transporter;
  private outbox: OutboxEntry[] = [];

  constructor() {
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
    this.loadOutbox();
  }

  private async loadOutbox() {
    try {
      const data = await fs.readFile(OUTBOX_PATH, 'utf-8');
      this.outbox = JSON.parse(data);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        this.outbox = [];
      } else {
        console.error('Error loading outbox:', error);
      }
    }
  }

  private async saveOutbox() {
    await fs.writeFile(OUTBOX_PATH, JSON.stringify(this.outbox, null, 2));
  }

  async sendMail(mailOptions: MailOptions) {
    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error: any) {
      await this.addToOutbox({
        mailOptions,
        retries: 0,
        lastRetry: new Date(),
        error: error.message,
      });
    }
  }

  private async addToOutbox(entry: OutboxEntry) {
    this.outbox.push(entry);
    await this.saveOutbox();
  }

  async retryFailedEmails() {
    for (let i = this.outbox.length - 1; i >= 0; i--) {
      const entry = this.outbox[i];
      if (entry.retries < 3) {
        try {
          await this.transporter.sendMail(entry.mailOptions);
          this.outbox.splice(i, 1); // Remove from outbox on success
        } catch (error: any) {
          entry.retries++;
          entry.lastRetry = new Date();
          entry.error = error.message;
        }
      }
    }
    await this.saveOutbox();
  }

  getOutbox(): OutboxEntry[] {
    return this.outbox;
  }
}

export const mailService = new MailService();
