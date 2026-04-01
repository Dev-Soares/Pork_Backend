import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateGoalDto) {
    try {
      return await this.prisma.goal.create({
        data: {
          name: dto.name,
          targetAmount: dto.targetAmount,
          currentAmount: 0,
          deadline: new Date(dto.deadline),
          achieved: false,
          userId,
        },
      });
    } catch {
      throw new InternalServerErrorException('Erro ao criar meta');
    }
  }

  async findAll(userId: string) {
    try {
      return await this.prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      throw new InternalServerErrorException('Erro ao listar metas');
    }
  }

  async findOne(id: string, userId: string) {
    try {
      const goal = await this.prisma.goal.findFirst({
        where: { id, userId },
      });

      if (!goal) {
        throw new NotFoundException('Meta nao encontrada');
      }

      return goal;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao buscar meta');
    }
  }

  async update(id: string, userId: string, dto: UpdateGoalDto) {
    try {
      const data = {
        name: dto.name,
        targetAmount: dto.targetAmount,
        currentAmount: dto.currentAmount,
        deadline:
          dto.deadline !== undefined ? new Date(dto.deadline) : undefined,
        achieved: dto.achieved,
      };

      const result = await this.prisma.goal.updateMany({
        where: { id, userId },
        data,
      });

      if (!result.count) throw new NotFoundException('Meta nao encontrada');

      return this.findOne(id, userId);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Erro ao atualizar meta');
    }
  }

  async remove(id: string, userId: string) {
    try {
      const result = await this.prisma.goal.deleteMany({
        where: { id, userId },
      });

      if (!result.count) {
        throw new NotFoundException('Meta nao encontrada');
      }

      return { message: 'Meta removida com sucesso' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao remover meta');
    }
  }
}
