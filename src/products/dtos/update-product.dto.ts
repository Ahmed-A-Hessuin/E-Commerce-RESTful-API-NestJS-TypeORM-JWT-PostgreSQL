import { IsString, IsNumber, IsNotEmpty, Min, Length, IsOptional, MinLength } from 'class-validator'


export class UpdateProductDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @Length(3, 100)
    title?: string;

    @IsString()
    @IsOptional()
    @MinLength(5)
    description?: string;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @Min(0)
    price?: number;
}