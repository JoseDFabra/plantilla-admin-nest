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
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {Request} from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request ){
     const userId = (req.user as any).userId;
    const user = await this.userService.findUserById(userId);
    if (user) {
      const { password, ...rest } = user; // 👈 oculta la contraseña
      return rest;

    }

    return {user};
  }
  
  

  // 🚀 Crear usuario (con encriptación de contraseña)
  @Post()
  async create(@Body() body: Omit<User, 'id' | 'refreshToken'>): Promise<Omit<User, 'password'>> {
    const {
      nombre_completo,
      documento,
      telefono,
      correo,
      password,
      id_rol,
    } = body;

    if (!nombre_completo || !documento || !password || !id_rol) {
      throw new BadRequestException('Faltan campos obligatorios: nombre_completo, documento, password o rol.');
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await this.userService.createUser({
      nombre_completo,
      documento,
      telefono: telefono ?? undefined,
      correo: correo ?? undefined,
      password: hash,
      id_rol,
    });

    const { password: _, ...rest } = user;
    return rest;
  }

  // 🔍 Listar todos los usuarios
  @Get()
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userService.findAllUsers();
    return users.map(({ password, ...rest }) => rest);
  }

  // 🔍 Obtener usuario por ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Omit<User, 'password'>> {
    const user = await this.userService.findUserById(id);
    const { password, ...rest } = user;
    return rest;
  }

  // ✏️ Actualizar usuario
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Omit<User, 'id'>>,
  ): Promise<Omit<User, 'password'>> {
    const updateData: Partial<User> = { ...body };

    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const user = await this.userService.updateUser(id, updateData);
    const { password, ...rest } = user;
    return rest;
  }

  // 🗑️ Eliminar usuario
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.userService.deleteUser(id);
    return { success: true };
  }
}
