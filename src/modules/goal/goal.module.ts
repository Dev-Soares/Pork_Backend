import { Module } from '@nestjs/common';
import { AuthGuardModule } from 'src/common/guards/auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { GoalController } from './goal.controller';
import { GoalService } from './goal.service';

@Module({
  controllers: [GoalController],
  providers: [GoalService],
  imports: [DatabaseModule, AuthGuardModule],
  exports: [GoalService],
})
export class GoalModule {}
