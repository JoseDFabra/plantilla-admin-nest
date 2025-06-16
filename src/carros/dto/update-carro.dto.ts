import { PartialType } from '@nestjs/swagger';
import { CreateCarroDto } from './create-carro.dto';

export class UpdateCarroDto extends PartialType(CreateCarroDto) {}
