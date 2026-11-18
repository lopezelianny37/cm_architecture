import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { SubmitMotivatorsDto } from './dto/submit-motivators.dto';
import { PublicMotivatorsService } from './public-motivators.service';

const ONE_HOUR_MS = 60 * 60 * 1000;

@Controller('api/public/moving-motivators')
export class PublicMotivatorsController {
  constructor(private readonly publicMotivatorsService: PublicMotivatorsService) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: ONE_HOUR_MS } })
  @HttpCode(HttpStatus.CREATED)
  submit(@Body() dto: SubmitMotivatorsDto) {
    return this.publicMotivatorsService.submit(dto);
  }
}
