import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { JwtAuthGuard } from './common/jwt-auth.guard';
import { RolesGuard } from './common/roles.guard';
import { DbModule } from './db/db.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ListingsModule } from './modules/listings/listings.module';
import { SearchModule } from './modules/search/search.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { BookingModule } from './modules/booking/booking.module';
import { ChatModule } from './modules/chat/chat.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MediaModule } from './modules/media/media.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';

@Module({
  imports: [
    // Xadka caadiga ah: 120 codsi / daqiiqad / IP. Endpoint xasaasi ah (OTP login) waxay yeelan doonaan xad hoose.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    DbModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ListingsModule,
    SearchModule,
    ProjectsModule,
    BookingModule,
    ChatModule,
    PaymentsModule,
    NotificationsModule,
    MediaModule,
    ModerationModule,
    AnalyticsModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  // Isku-xigga muhiim: 1) rate-limit, 2) token (route kasta oo aan @Public ahayn), 3) doorka (@Roles).
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
