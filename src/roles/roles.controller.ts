import { Controller, Get, Query } from '@nestjs/common';
import { RolesService } from './roles.service';
import { FindRoleByIdDto } from './dto/find-role-by-id.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('find-by-id')
  findById(@Query() dto: FindRoleByIdDto) {
    return this.rolesService.findOne(dto.id_rol);
  }
}
