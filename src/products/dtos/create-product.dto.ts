import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min, Length, MinLength } from 'class-validator'


export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 100)
    @ApiProperty()
    title: string;

    @IsString()
    @MinLength(5)
    @ApiProperty()
    description: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    @ApiProperty()
    price: number;
}   