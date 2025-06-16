import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  
  
  async login(dto: LoginDto) {
    const rolesPermitidos = [1, 2, 3, 4];
    const user = await this.userService.findByDocumento(dto.documento);
    if (!user) {
      throw new UnauthorizedException('Documento no encontrado.');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Contraseña incorrecta.');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Tu cuenta está inactiva. Contacta al administrador.');
    }

    if (!rolesPermitidos.includes(user.id_rol)) {
      throw new UnauthorizedException('No tienes permisos para acceder al panel administrativo.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      documento: user.documento,
      rol: user.id_rol,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
    });

    await this.userService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }


  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.config.get('JWT_SECRET'),
        },
      );

      const user = await this.userService.findUserById(payload.sub);

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token inválido.');
      }

      const newPayload: JwtPayload = {
        sub: user.id,
        documento: user.documento,
        rol: user.id_rol,
      };

      const newAccessToken = await this.jwtService.signAsync(newPayload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN'),
      });

      const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
      });

      await this.userService.updateRefreshToken(user.id, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      throw new UnauthorizedException('Refresh token inválido o expirado.');
    }
  }
}
