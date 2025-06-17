import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './interfaces/user.interface';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private dataSource: DataSource) {}

  async findByDocumento(documento: string): Promise<ApiResponse<User>> {
    const result = await this.dataSource.query(
      `SELECT * FROM Users WHERE documento = @0`,
      [documento],
    );
    const user = result[0];
    if (!user) {
      throw new NotFoundException('Usuario no encontrado con ese documento.');
    }
    return {
      success: true,
      message: 'Usuario encontrado correctamente',
      data: user,
    };
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
  }): Promise<ApiResponse<User>> {
    const existing = await this.findByDocumento(data.documento).catch(
      () => null,
    );
    if (existing?.data) {
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

    return {
      success: true,
      message: 'Usuario creado exitosamente',
      data: result[0],
    };
  }

  async findAllUsers(): Promise<ApiResponse<User[]>> {
    const result = await this.dataSource.query(`
    SELECT u.*, r.nombre AS rol
    FROM Users u
    JOIN Roles r ON u.id_rol = r.id
  `);

    return {
      success: true,
      message: 'Lista de usuarios obtenida correctamente',
      data: result,
    };
  }

  async findUserById(id: number): Promise<ApiResponse<User>> {
    const result = await this.dataSource.query(
      `SELECT * FROM Users WHERE id = @0`,
      [id],
    );
    const user = result[0];
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    return {
      success: true,
      message: 'Usuario encontrado por ID',
      data: user,
    };
  }

  async updateUser(
    id: number,
    data: Partial<User>,
  ): Promise<ApiResponse<User>> {
    const existing = await this.findUserById(id);

    if (!existing.data) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    if (data.documento) {
      const otro = await this.dataSource.query(
        `SELECT * FROM Users WHERE documento = @0`,
        [data.documento],
      );
      if (otro[0] && otro[0].id !== id) {
        throw new ConflictException('El documento ya está registrado.');
      }
    }

    await this.dataSource.query(
      `
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
    `,
      [
        data.nombre_completo ?? existing.data.nombre_completo,
        data.documento ?? existing.data.documento,
        data.telefono ?? existing.data.telefono,
        data.correo ?? existing.data.correo,
        data.password ?? existing.data.password,
        data.id_rol ?? existing.data.id_rol,
        data.is_active ?? existing.data.is_active,
        id,
      ],
    );

    const updated = await this.findUserById(id);
    return {
      success: true,
      message: 'Usuario actualizado correctamente',
      data: updated.data,
    };
  }

  async deleteUser(id: number): Promise<ApiResponse<null>> {
    const existing = await this.findUserById(id);
    if (!existing.data) {
      throw new NotFoundException('No es posible eliminar algo que no existe.');
    }

    await this.dataSource.query(`DELETE FROM Users WHERE id = @0`, [id]);

    return {
      success: true,
      message: 'Usuario eliminado correctamente',
      data: null,
    };
  }

  // user.service.ts
  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    const response = await this.findUserById(userId);
    const user = response.data;

    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const match = await bcrypt.compare(dto.currentPassword, user.password);
    if (!match) {
      throw new BadRequestException('La contraseña actual es incorrecta.');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.dataSource.query(
      `UPDATE Users SET password = @0 WHERE id = @1`,
      [hashedNewPassword, userId],
    );
  }
}
