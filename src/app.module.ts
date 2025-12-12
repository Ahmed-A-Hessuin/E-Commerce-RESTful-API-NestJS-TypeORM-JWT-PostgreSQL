import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { productsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { dataSourceOptions } from '../db/data-source';
import { UploadsModule } from './uploads/uploads.module';
import { MailModule } from './mail/mail.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';



@Module({
  controllers: [AppController],
  imports: [
    productsModule,
    ReviewsModule,
    UsersModule,
    UploadsModule,
    MailModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV !== 'production' ? `.env.${process.env.NODE_ENV}` : '.env'
    }) ,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 10 sec
          limit: 10, // 10 req every 60 seconds for a client
        },
      ],
    }),
  ],
  providers: [{
    provide: APP_INTERCEPTOR,
    useClass: ClassSerializerInterceptor
  }, 
  {
    provide : APP_GUARD ,
    useClass : ThrottlerGuard
  }]
})
export class AppModule { }


/*   LOCAL DATABASE */
// {
//       inject: [ConfigService],
//       useFactory: (config: ConfigService) => {
//         return {
//           type: 'postgres',
//           database: config.get<string>("DB_DATABASE"),
//           username: config.get<string>("DB_USERNAME"),
//           password: config.get<string>("DB_PASSWORD"),
//           port: config.get<number>("DB_PORT"),
//           host: 'localhost',
//           synchronize: process.env.NODE_ENV !== 'prodcution',
//           entities: [Product , User , Review]
//         }
//       }
// }