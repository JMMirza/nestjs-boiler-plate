import * as morgan from 'morgan';
import { createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';

const logDir = join(__dirname, '../../logs');
mkdirSync(logDir, { recursive: true });

const logStream = createWriteStream(join(logDir, 'access.log'), {
  flags: 'a', // append mode
});

export const morganMiddleware = morgan('combined', {
  stream: logStream,
});
