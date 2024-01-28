import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm'
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
  "type": "postgres",
  "host": "localhost",
  "port": 5432,
  "username": process.env.POSTGRES_USER,
  "password": process.env.POSTGRES_PASSWORD,
  "database": process.env.POSTGRES_DB,
  "synchronize": true,
  "entities": ["dist/**/*.entity{.ts,.js}"],
  "logging": true,
  "autoLoadEntities": true
}),
    UserModule,
    AuthModule,
    BlogModule

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
