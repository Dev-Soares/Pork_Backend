import { Module } from '@nestjs/common';
import { AuthGuardModule } from 'src/common/guards/auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';

@Module({
  controllers: [ExpenseController],
  providers: [ExpenseService],
  imports: [DatabaseModule, AuthGuardModule],
  exports: [ExpenseService],
})
export class ExpenseModule {}
