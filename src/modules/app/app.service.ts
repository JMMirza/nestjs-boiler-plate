import { Injectable } from '@nestjs/common';
import { config } from 'src/config';
import { renderLandingPage } from './landing-page';
import { readFileSync } from 'fs';
import { join } from 'path';

function readVersion(): string {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'))
      .version;
  } catch {
    return '0.0.0';
  }
}

@Injectable()
export class AppService {
  private landingPageHtml: string;

  statusCheck(): string {
    return 'pong';
  }

  landingPage(): string {
    // Rendered once — the content only depends on startup config
    this.landingPageHtml ??= renderLandingPage({
      appName: process.env.APP_NAME || 'Nest Boiler Plate',
      version: readVersion(),
      env: config.NODE_ENV || 'development',
      showDocs: config.NODE_ENV !== 'production',
    });
    return this.landingPageHtml;
  }
}
