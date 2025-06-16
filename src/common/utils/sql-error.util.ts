import { ConflictException, InternalServerErrorException } from '@nestjs/common';

export function handleDatabaseError(error: any, resourceName: string = 'recurso'): never {
  const message = error?.message || '';
  const number = error?.number;

  const isDuplicateError =
    number === 2627 ||
    message.includes('Cannot insert duplicate key') ||
    message.includes('Violation of UNIQUE KEY constraint');

  const isFkError =
    message.includes('REFERENCE constraint') ||
    message.includes('conflicted with the REFERENCE constraint');

  if (isDuplicateError) {
    throw new ConflictException(`${resourceName} ya se encuentra registrado.`);
  }

  if (isFkError) {
    throw new ConflictException(`Esta ${resourceName} no se puede eliminar porque está asociado a otros registros.`);
  }

  throw new InternalServerErrorException('Error inesperado en la base de datos.');
}
