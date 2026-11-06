import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators';

@ApiTags('meta')
@Public()
@Controller()
export class AppController {
  /** Macluumaad aasaasi ah. Waxay hoos socotaa rate-limit (ma ka reebna). */
  @Get()
  info() {
    return { name: 'GuriHel API', version: '0.1.0', docs: '/api/docs' };
  }
}
