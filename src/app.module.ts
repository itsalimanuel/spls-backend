import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [ConfigModule.forRoot(), ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
