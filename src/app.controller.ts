import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('ORDER_SERVICE') private orderService: ClientProxy,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @MessagePattern('order_created')
  handleOrderCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    // console.log(`Pattern: ${context.getPattern()}`);
    // console.log(context.getMessage());
    // console.log(context.getChannelRef());
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    console.log('Order received for processing:', data);
    const isInStock = true;
    if (isInStock) {
      console.log('Inventory available, processing order.');
      channel.ack(originalMsg);
      this.orderService.emit('order_completed', data);
      // Completed Order
    } else {
      console.log('Inventory not available, rejecting order.');
      channel.ack(originalMsg);
      // Canceled Order
      this.orderService.emit('order_canceled', data);
    }
  }
}
