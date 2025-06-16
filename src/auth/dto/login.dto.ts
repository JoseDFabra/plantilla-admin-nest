import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  documento: string;

  @IsString()
  @MinLength(4)
  password: string;
}
