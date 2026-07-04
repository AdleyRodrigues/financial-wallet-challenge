import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../auth/current-user.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { DepositDto } from './dto/deposit.dto';
import { TransferDto } from './dto/transfer.dto';
import { TransactionsService } from './transactions.service';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.transactionsService.list(user.id);
  }

  @Post('deposit')
  deposit(@CurrentUser() user: { id: string }, @Body() dto: DepositDto) {
    return this.transactionsService.deposit(user.id, dto);
  }

  @Post('transfer')
  transfer(@CurrentUser() user: { id: string }, @Body() dto: TransferDto) {
    return this.transactionsService.transfer(user.id, dto);
  }

  @Post(':id/reverse')
  reverse(
    @CurrentUser() user: { id: string },
    @Param('id') transactionId: string,
  ) {
    return this.transactionsService.reverse(user.id, transactionId);
  }
}
