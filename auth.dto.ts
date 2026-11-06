import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

const E164 = /^\+[1-9]\d{7,14}$/;

export class OtpRequestDto {
  @ApiProperty({ example: '+252630000001', description: 'Nambar E.164 ah' })
  @IsString()
  @Matches(E164, { message: 'phone waa inuu noqdaa E.164 (tusaale +252630000001)' })
  phone!: string;
}

export class OtpVerifyDto extends OtpRequestDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'code waa 6 lambar' })
  code!: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  @MinLength(20)
  @MaxLength(200)
  refresh_token!: string;
}
