import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { productsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './products/product.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/user.entity';
import { Review } from './reviews/review.entity';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';


@Module({
  controllers : [AppController] ,
  imports: [
    productsModule,
    ReviewsModule,
    UsersModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          database: config.get<string>("DB_DATABASE"),
          username: config.get<string>("DB_USERNAME"),
          password: config.get<string>("DB_PASSWORD"),
          port: config.get<number>("DB_PORT"),
          host: 'localhost',
          synchronize: process.env.NODE_ENV !== 'prodcution',
          entities: [Product , User , Review]
        }
      }
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV !== 'production' ? `.env.${process.env.NODE_ENV} ` : '.env'
    })
  ],
  providers :[{
    provide : APP_INTERCEPTOR ,
    useClass : ClassSerializerInterceptor
  }]
})
export class AppModule { }
