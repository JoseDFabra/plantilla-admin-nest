import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCarroDto } from './dto/create-carro.dto';
import { UpdateCarroDto } from './dto/update-carro.dto';
import { DataSource } from 'typeorm';
import { Carro } from './interface/carro.interface';
import { ApiResponse } from 'src/common/interfaces/api-response.interface';
import { handleDatabaseError } from 'src/common/utils/sql-error.util';

@Injectable()
export class CarrosService {
  constructor(private readonly dataSource: DataSource) {}

  async create(dto: CreateCarroDto): Promise<ApiResponse<Carro>> {
    try {
      const { marca, modelo, anio, color } = dto;

      const result = await this.dataSource.query(
        `
        INSERT INTO Carros (marca, modelo, anio, color)
        OUTPUT INSERTED.* VALUES (@0, @1, @2, @3)
        `,
        [marca, modelo, anio, color],
      );

      return {
        success: true,
        message: 'Carro creado correctamente',
        data: result[0],
      };
    } catch (error) {
      handleDatabaseError(error, 'carro');
    }
  }

  async findAll(): Promise<ApiResponse<Carro[]>> {
    try {
      const result = await this.dataSource.query(`SELECT * FROM Carros`);
      if (!result.length) {
        return { success: false, message: 'No se encontraron carros', data: [] };
      }

      return {
        success: true,
        message: 'Carros encontrados',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException('Error al obtener los carros');
    }
  }

  async findOne(id: number): Promise<ApiResponse<Carro>> {
    try {
      const result = await this.dataSource.query(
        `SELECT * FROM Carros WHERE id = @0`,
        [id],
      );

      const carro = result[0];
      if (!carro) {
        throw new NotFoundException('Carro no encontrado.');
      }

      return {
        success: true,
        message: 'Carro encontrado',
        data: carro,
      };
    } catch (error) {
      throw new BadRequestException('Error al buscar el carro');
    }
  }

  async update(id: number, dto: UpdateCarroDto): Promise<ApiResponse<Carro>> {
  try {
    const existe = await this.dataSource.query(
      `SELECT * FROM Carros WHERE id = @0`,
      [id],
    );

    if (!existe[0]) {
      throw new NotFoundException('Carro no encontrado para actualizar.');
    }

    const { marca, modelo, anio, color } = dto;

    await this.dataSource.query(
      `
      UPDATE Carros
      SET marca = @0, modelo = @1, anio = @2, color = @3
      WHERE id = @4
      `,
      [marca, modelo, anio, color, id],
    );

    // 🔄 Consulta el carro actualizado desde la BD
    const updated = await this.dataSource.query(
      `SELECT * FROM Carros WHERE id = @0`,
      [id],
    );

    return {
      success: true,
      message: 'Carro actualizado correctamente',
      data: updated[0],
    };
  } catch (error) {
    handleDatabaseError(error, 'carro');
  }
  }

  async remove(id: number): Promise<ApiResponse<Carro>> {
    try {
      const result = await this.dataSource.query(
        `SELECT * FROM Carros WHERE id = @0`,
        [id],
      );

      const carro = result[0];
      if (!carro) {
        throw new NotFoundException('Carro no encontrado para eliminar.');
      }

      await this.dataSource.query(`DELETE FROM Carros WHERE id = @0`, [id]);

      return {
        success: true,
        message: 'Carro eliminado correctamente',
        data: carro,
      };
    } catch (error) {
      handleDatabaseError(error, 'carro');
    }
  }
}
