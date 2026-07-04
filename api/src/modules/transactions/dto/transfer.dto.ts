import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
} from 'class-validator';

export class TransferDto {
  @IsEmail()
  receiverEmail: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(999999999999.99)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
