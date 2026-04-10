import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashService } from '../../common/hash/hash.service';
import { CreateUserDto } from './dto/create-user.dto';

type UserPublic = Pick<User, 'id' | 'name' | 'email' | 'salary' | 'economy'>;

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async create(data: CreateUserDto): Promise<UserPublic> {
    const hashedPassword = await this.hashService.hashPassword(data.password);
    const economyValue = this.calculateEconomyValue(
      data.plan,
      data.salary,
    );
    try {
      return await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          salary: data.salary,
          plan: data.plan,
          password: hashedPassword,
          economy: economyValue,
        },
        select: {
          id: true,
          name: true,
          email: true,
          salary: true,
          economy: true,
          plan: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('E-mail já cadastrado');
      }
      throw new InternalServerErrorException('Erro ao criar usuário');
    }
  }

  async findByEmailWithPassword(email: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('Email ou senha inválidos');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Erro ao buscar usuário');
    }
  }

  async findOne(id: string): Promise<UserPublic> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          salary: true,
          economy: true,
          plan: true,
        },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Erro ao buscar usuário');
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserPublic> {
    let economy: number | undefined;

    if (dto.salary !== undefined || dto.plan !== undefined) {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('Usuário não encontrado');
      economy = this.calculateEconomyValue(
        dto.plan ?? user.plan,
        dto.salary ?? user.salary,
      );
    }

    const data = {
      name: dto.name,
      email: dto.email,
      salary: dto.salary,
      plan: dto.plan,
      economy,
    };

    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          salary: true,
          plan: true,
          economy: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025')
          throw new NotFoundException('Usuário não encontrado');
        if (error.code === 'P2002')
          throw new ConflictException('E-mail já cadastrado');
      }
      throw new InternalServerErrorException(
        'Erro ao atualizar informações do Usuário',
      );
    }
  }

  async remove(id: string): Promise<UserPublic> {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025')
          throw new NotFoundException('Usuário não encontrado');
      }
      throw new InternalServerErrorException('Erro ao deletar usuário');
    }
  }

  calculateEconomyValue(plan: string, salary: number): number {
    if (plan === 'BASICO') {
      return salary * 0.1;
    } else if (plan === 'PADRAO') {
      return salary * 0.25;
    } else if (plan === 'AVANCADO') {
      return salary * 0.4;
    }
    return 0;
  }
}
