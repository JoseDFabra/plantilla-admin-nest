import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateCarroDto {


  @IsString()
  marca:string;
  
  @IsString()
  @IsNotEmpty()
  modelo: string;
  
  @IsNumber()
  @IsNotEmpty()
  anio: number;

  @IsString()
  color:string;


}
