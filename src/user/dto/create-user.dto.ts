import { IsNotEmpty, IsString, IsOptional, IsEmail, MinLength, MaxLength, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  nombre_completo: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(11)
  documento: string;

  @IsOptional()
  @IsString()
  @MaxLength(11)
  telefono?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  correo?: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsInt()
  id_rol: number;
}
