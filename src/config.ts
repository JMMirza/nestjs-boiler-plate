import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 4002,
  SERVICE_NAME: process.env.SERVICE_NAME || 'nest-boiler-plate',
  CORS_ORIGINS: process.env.CORS_ORIGINS,
  JWT_TOKEN_KEY: process.env.JWT_TOKEN_KEY,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  DATABASE_LINK: process.env.DATABASE_LINK,
  DATABASE_NAME: process.env.DATABASE_NAME,
  MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN,
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
  MAIL_FROM: process.env.MAIL_FROM,
};
