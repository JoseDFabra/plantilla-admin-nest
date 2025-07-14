import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { Rol } from './interfaces/rol.interface';

@Injectable()
export class RolesService {
  constructor(private dataSource: DataSource) {}

  async findOne(id: number): Promise<ApiResponse<Rol>> {
    const result = await this.dataSource.query(
      `SELECT id, nombre FROM Roles WHERE id = @0`,
      [id],
    );

    const rol = result[0];

    if (!rol) {
      throw new NotFoundException(`No se encontró el rol con ID ${id}`);
    }

    return {
      success: true,
      message: 'Rol encontrado correctamente',
      data: rol,
    };
  }

  // Opcional: completar también findAll
  async findAll(): Promise<ApiResponse<Rol[]>> {
    const roles = await this.dataSource.query(
      `SELECT id, nombre FROM Roles ORDER BY id`,
    );
    return {
      success: true,
      message: 'Lista de roles',
      data: roles,
    };
  }
}
