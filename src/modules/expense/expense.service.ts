import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateExpenseDto) {
    try {
      return await this.prisma.expense.create({
        data: {
          title: dto.title,
          category: dto.category,
          amount: dto.amount,
          ...(dto.date && { date: new Date(dto.date) }),
          userId,
        },
      });
    } catch {
      throw new InternalServerErrorException('Erro ao criar despesa');
    }
  }

  async findAll(userId: string) {
    try {
      return await this.prisma.expense.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
      });
    } catch {
      throw new InternalServerErrorException('Erro ao listar despesas');
    }
  }

  async findOne(id: string, userId: string) {
    try {
      const expense = await this.prisma.expense.findFirst({
        where: { id, userId },
      });

      if (!expense) {
        throw new NotFoundException('Despesa nao encontrada');
      }

      return expense;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao buscar despesa');
    }
  }

  async update(id: string, userId: string, dto: UpdateExpenseDto) {
    try {
      const data = {
        title: dto.title,
        category: dto.category,
        amount: dto.amount,
        date: dto.date !== undefined ? new Date(dto.date) : undefined,
      };

      const result = await this.prisma.expense.updateMany({
        where: { id, userId },
        data,
      });

      if (!result.count) throw new NotFoundException('Despesa nao encontrada');

      return this.findOne(id, userId);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Erro ao atualizar despesa');
    }
  }

  async remove(id: string, userId: string) {
    try {
      const result = await this.prisma.expense.deleteMany({
        where: { id, userId },
      });

      if (!result.count) {
        throw new NotFoundException('Despesa nao encontrada');
      }

      return { message: 'Despesa removida com sucesso' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao remover despesa');
    }
  }
}
