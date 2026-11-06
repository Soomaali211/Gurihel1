import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Kaliya fields-kan ayaa la beddeli karaa. `role`, `status`, `phone`… waa la diidaa (forbidNonWhitelisted). */
export class UpdateMeDto {
  @ApiPropertyOptional({ example: 'Faadumo Axmed' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  full_name?: string;

  @ApiPropertyOptional({ enum: ['so', 'en', 'ar'] })
  @IsOptional()
  @IsIn(['so', 'en', 'ar'])
  lang?: 'so' | 'en' | 'ar';
}
