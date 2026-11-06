import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

/**
 * Isku-xirka diraha SMS/WhatsApp. Ku dar provider dhab ah (Twilio, Africa's Talking, Infobip, WhatsApp Cloud)
 * adigoo ka dhigaya class cusub oo `SmsSender` ka dhaxla, kadibna ku dar `auth.module.ts` + `SMS_PROVIDER`.
 */
export abstract class SmsSender {
  abstract send(phone: string, text: string): Promise<void>;
}

/** DEV KALIYA: OTP wuxuu ku qoran yahay logs. `loadEnv` wuu diidaa production-ka. */
@Injectable()
export class ConsoleSmsSender extends SmsSender {
  private readonly log = new Logger('DEV-SMS');
  async send(phone: string, text: string): Promise<void> {
    this.log.warn(`[DEV ONLY] → ${phone}: ${text}`);
  }
}

/** Provider la'aan: ma dirto, wuxuu soo celiyaa 503 si cad. */
@Injectable()
export class DisabledSmsSender extends SmsSender {
  async send(): Promise<void> {
    throw new ServiceUnavailableException('SMS provider lama habeyn');
  }
}
