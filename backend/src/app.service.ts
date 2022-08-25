import { Injectable } from '@nestjs/common';
import { APP_NAME } from '~shared/index';

@Injectable()
export class AppService {
  getHello(): string {
    return APP_NAME;
  }
}
