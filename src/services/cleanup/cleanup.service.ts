import { Injectable } from '@nestjs/common';

@Injectable()
export class CleanupService {
  cleanup() {
    return 'This action performs cleanup';
  }
}
