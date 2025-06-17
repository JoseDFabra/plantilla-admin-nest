import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  documento: string;

  @IsString()
  @MinLength(6)
  password: string;
}
