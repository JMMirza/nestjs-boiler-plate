import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class SelfOrAdminInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const targetId = request.params?.id;
    if (request?.user?.id !== targetId && request?.user?.role != 'admin') {
      throw new UnauthorizedException(['You are not allowed for this action']);
    }
    return next.handle();
  }
}
