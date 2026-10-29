import { Injectable, Logger } from '@nestjs/common';
import * as formData from 'form-data';
import Mailgun from 'mailgun.js';
import { config } from 'src/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private mg: any;
  private readonly domain: string;

  constructor() {
    this.domain = config.MAILGUN_DOMAIN;
    // Without credentials the app still boots; sends are logged (dev) or rejected (prod)
    if (config.MAILGUN_API_KEY && this.domain) {
      const mailgunClient = new Mailgun(formData);
      this.mg = mailgunClient.client({
        username: 'api',
        key: config.MAILGUN_API_KEY,
      });
    }
  }

  async sendEmailNotification(options: any) {
    if (!this.mg) {
      if (config.NODE_ENV === 'production') {
        throw new Error('Failed to send emails: Mailgun is not configured');
      }
      const body = (options.text || options.html || '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      this.logger.warn(
        `Mailgun not configured, email not sent. To: ${options.to} | Subject: ${options.subject} | ${body}`,
      );
      return null;
    }

    try {
      const response = await this.mg.messages.create(this.domain, {
        from: config.MAIL_FROM,
        to: options.to,
        subject: options.subject,
        text: options.text || '',
        html: options.html || '',
      });

      console.log(`Message sent: ${response.id}`);

      return response;
    } catch (error) {
      console.error('Error occurred while sending email:', error);
      throw new Error(`Failed to send emails: ${error.message}`);
    }
  }
}
