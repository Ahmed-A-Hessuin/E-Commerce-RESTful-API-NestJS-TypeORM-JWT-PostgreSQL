import { IsString, IsNumber, IsNotEmpty, Min, Length, MinLength } from 'class-validator'

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 100)
    title: string;

    @IsString()
    @MinLength(5)
    description: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    price: number;
}   