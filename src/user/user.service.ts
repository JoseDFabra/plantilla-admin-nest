import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './interfaces/user.interface';

@Injectable()
export class UserService {
  constructor(private dataSource: DataSource) {}

  async findByDocumento(documento: string): Promise<User | null> {
    const result = await this.dataSource.query(
      `SELECT * FROM Users WHERE documento = @0`,
      [documento],
    );
    return result[0] || null;
  }

  async updateRefreshToken(userId: number, token: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE Users SET refreshToken = @0 WHERE id = @1`,
      [token, userId],
    );
  }

  async createUser(data: {
    nombre_completo: string;
    documento: string;
    telefono?: string;
    correo?: string;
    password: string;
    id_rol: number;
    is_active?: boolean;
  }): Promise<User> {
    const existing = await this.findByDocumento(data.documento);
    if (existing) {
      throw new ConflictException('El documento ya está registrado.');
    }

    const result = await this.dataSource.query(
      `
    INSERT INTO Users (nombre_completo, documento, telefono, correo, password, id_rol, is_active)
    OUTPUT INSERTED.*
    VALUES (@0, @1, @2, @3, @4, @5, @6)
    `,
      [
        data.nombre_completo,
        data.documento,
        data.telefono || null,
        data.correo || null,
        data.password,
        data.id_rol,
        data.is_active ?? true,
      ],
    );

    return result[0];
  }

  async findAllUsers(): Promise<User[]> {
    const result = await this.dataSource.query(
      `
      SELECT u.*, r.nombre AS rol
      FROM Users u
      JOIN Roles r ON u.id_rol = r.id
      `,
    );
    return result;
  }

  async findUserById(id: number): Promise<User> {
    const result = await this.dataSource.query(
      `SELECT * FROM Users WHERE id = @0`,
      [id],
    );

    const user = result[0];
    if (!user) throw new NotFoundException('Usuario no encontrado.');
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const existing = await this.findUserById(id);

    if (data.documento) {
      const otro = await this.findByDocumento(data.documento);
      if (otro && otro.id !== id) {
        throw new ConflictException('El documento ya está registrado.');
      }
    }


    const updateQuery = `
    UPDATE Users
    SET 
      nombre_completo = @0,
      documento = @1,
      telefono = @2,
      correo = @3,
      password = @4,
      id_rol = @5,
      is_active = @6
    WHERE id = @7
  `;

    await this.dataSource.query(updateQuery, [
      data.nombre_completo ?? existing.nombre_completo,
      data.documento ?? existing.documento,
      data.telefono ?? existing.telefono,
      data.correo ?? existing.correo,
      data.password ?? existing.password,
      data.id_rol ?? existing.id_rol,
      data.is_active ?? existing.is_active,
      id,
    ]);

    return this.findUserById(id);
  }

  async deleteUser(id: number): Promise<void> {
    const existing = await this.findUserById(id);
    if (!existing) {
      throw new NotFoundException(
        'No es posible eliminar algo que no existe en la base de datos',
      );
    }

    await this.dataSource.query(`DELETE FROM Users WHERE id = @0`, [id]);
  }
}
