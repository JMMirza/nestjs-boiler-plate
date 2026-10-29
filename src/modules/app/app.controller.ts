import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Landing page — sent raw with @Res() so the JSON TransformInterceptor doesn't wrap it
  @Get()
  @ApiExcludeEndpoint()
  landingPage(@Res() res: Response) {
    res.type('html').send(this.appService.landingPage());
  }

  @Get('/ping')
  statusCheck(): string {
    return this.appService.statusCheck();
  }
}
