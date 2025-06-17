import { IsNotEmpty, IsNumber } from "class-validator";



export class FindRoleByIdDto{


  @IsNumber()
  @IsNotEmpty()
  id_rol:number;



}