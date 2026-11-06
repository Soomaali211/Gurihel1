import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ENV, type Env } from '../../config/env';
import { AuthController } from './auth.controller';
import { AuthService, ACCESS_TTL_S } from './auth.service';
import { ConsoleSmsSender, DisabledSmsSender, SmsSender } from './sms.sender';

export const JWT_ISSUER = 'gurihel-api';
export const JWT_AUDIENCE = 'gurihel-clients';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true, // JwtAuthGuard (APP_GUARD) wuxuu u baahan yahay JwtService
      inject: [ENV],
      useFactory: (env: Env) => ({
        secret: env.jwtSecret,
        signOptions: { algorithm: 'HS256', expiresIn: ACCESS_TTL_S, issuer: JWT_ISSUER, audience: JWT_AUDIENCE },
        verifyOptions: { algorithms: ['HS256'], issuer: JWT_ISSUER, audience: JWT_AUDIENCE },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: SmsSender,
      inject: [ENV],
      useFactory: (env: Env): SmsSender => (env.smsProvider === 'console' ? new ConsoleSmsSender() : new DisabledSmsSender()),
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
