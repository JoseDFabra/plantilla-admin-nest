import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  BadRequestException,
  UseGuards,
  Req,
  Query,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ✅ Obtener usuario actual
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const userId = (req.user as any).userId;
    const response = await this.userService.findUserById(userId);
    const user = response.data;

    if (user) {
      const { password, ...rest } = user;
      return rest;
    }

    throw new NotFoundException('Usuario no encontrado.');
  }

  // ✅ Buscar por documento
  @Get('by-documento')
  async findByDocumento(
    @Query('documento') documento: string,
  ): Promise<Omit<User, 'password'>> {
    const response = await this.userService.findByDocumento(documento.trim());
    const user = response.data;

    if (!user) {
      throw new NotFoundException('Usuario no encontrado con ese documento.');
    }

    const { password, ...rest } = user;
    return rest;
  }

  // ✅ Crear usuario con encriptación
  @Post()
  async create(@Body() body: CreateUserDto): Promise<Omit<User, 'password'>> {
    const { nombre_completo, documento, telefono, correo, password, id_rol } =
      body;

    if (!nombre_completo || !documento || !password || !id_rol) {
      throw new BadRequestException(
        'Faltan campos obligatorios: nombre_completo, documento, password o rol.',
      );
    }

    const hash = await bcrypt.hash(password, 10);

    const response = await this.userService.createUser({
      nombre_completo,
      documento,
      telefono: telefono ?? undefined,
      correo: correo ?? undefined,
      password: hash,
      id_rol,
    });

    const user = response.data;
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    const { password: _, ...rest } = user;
    return rest;
  }

  // ✅ Obtener todos los usuarios
  @Get()
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const response = await this.userService.findAllUsers();
    const users = response.data;
    if (!users) {
      throw new NotFoundException('Usuarios no encontrado.');
    }
    return users.map(({ password, ...rest }) => rest);
  }

  // ✅ Obtener usuario por ID
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Omit<User, 'password'>> {
    const response = await this.userService.findUserById(id);
    const user = response.data;
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    const { password, ...rest } = user;
    return rest;
  }

  // ✅ Actualizar usuario
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Omit<User, 'id'>>,
  ): Promise<Omit<User, 'password'>> {
    const updateData: Partial<User> = { ...body };

    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const response = await this.userService.updateUser(id, updateData);
    const user = response.data;
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    const { password, ...rest } = user;
    return rest;
  }

  // ✅ Eliminar usuario
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    await this.userService.deleteUser(id);
    return { success: true };
  }

  // user.controller.ts
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    const userId = (req.user as any).userId;
    await this.userService.changePassword(userId, dto);
    return { message: 'Contraseña actualizada correctamente' };
  }
}
