import { Controller, Get } from '@nestjs/common';

@Controller()
export class HelloController {
  @Get('hello-word')
  helloWord() {
    return { message: 'Hello Word' };
  }
}
