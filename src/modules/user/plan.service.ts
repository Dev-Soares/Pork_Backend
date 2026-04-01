import { Injectable } from '@nestjs/common';

@Injectable()
export class PlanService {
  constructor() {}

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
