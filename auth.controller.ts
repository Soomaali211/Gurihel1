import { Body, Controller, Headers, HttpCode, Ip, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { AuthUser } from '../../common/auth.types';
import { CurrentUser, Public } from '../../common/decorators';
import { OtpRequestDto, OtpVerifyDto, RefreshDto } from './auth.dto';
import { AuthService } from './auth.service';

const TEN_MIN = 600_000;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Jawaab isku mid ah nambar kasta (ma muujiso haddii nambarku diiwaan gashan yahay). */
  @Public()
  @Throttle({ default: { limit: 5, ttl: TEN_MIN } })
  @HttpCode(202)
  @Post('otp/request')
  requestOtp(@Body() dto: OtpRequestDto, @Ip() ip: string) {
    return this.auth.requestOtp(dto.phone, ip);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: TEN_MIN } })
  @HttpCode(200)
  @Post('otp/verify')
  verifyOtp(@Body() dto: OtpVerifyDto, @Headers('user-agent') ua?: string) {
    return this.auth.verifyOtp(dto.phone, dto.code, ua);
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: TEN_MIN } })
  @HttpCode(200)
  @Post('refresh')
  refresh(@Body() dto: RefreshDto, @Headers('user-agent') ua?: string) {
    return this.auth.refresh(dto.refresh_token, ua);
  }

  @ApiBearerAuth()
  @HttpCode(204)
  @Post('logout')
  async logout(@Body() dto: RefreshDto, @CurrentUser() user: AuthUser): Promise<void> {
    await this.auth.logout(user.id, dto.refresh_token);
  }
}
