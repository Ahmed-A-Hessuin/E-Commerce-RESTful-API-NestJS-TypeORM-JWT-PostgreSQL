import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { productsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { dataSourceOptions } from '../db/data-source';


@Module({
  controllers: [AppController],
  imports: [
    productsModule,
    ReviewsModule,
    UsersModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV !== 'production' ? `.env.${process.env.NODE_ENV}` : '.env'
    })
  ],
  providers: [{
    provide: APP_INTERCEPTOR,
    useClass: ClassSerializerInterceptor
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