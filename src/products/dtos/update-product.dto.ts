import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min, Length, IsOptional, MinLength } from 'class-validator'


export class UpdateProductDto {
    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @Length(3, 100)
    @ApiPropertyOptional()
    title?: string;

    @IsString()
    @IsOptional()
    @MinLength(5)
    @ApiPropertyOptional()
    description?: string;

    @IsNumber()
    @IsNotEmpty()
    @IsOptional()
    @Min(0)
    @ApiPropertyOptional()
    price?: number;
}