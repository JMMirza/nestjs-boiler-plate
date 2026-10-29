import { Injectable } from '@nestjs/common';
import * as formData from 'form-data';
import Mailgun from 'mailgun.js';
import { config } from 'src/config';

@Injectable()
export class EmailService {
  private mg: any;
  private readonly domain: string;

  constructor() {
    const mailgunClient = new Mailgun(formData);
    this.mg = mailgunClient.client({
      username: 'api',
      key: config.MAILGUN_API_KEY,
    });
    this.domain = config.MAILGUN_DOMAIN;
  }

  async sendEmailNotification(options: any) {
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
