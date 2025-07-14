import { Controller, Get, Query } from '@nestjs/common';
import { FindRoleByIdDto } from './dto/find-role-by-id.dto';
import { RolesService } from './roles.service';

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
