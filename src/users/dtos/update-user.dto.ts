import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, Length, MinLength } from "class-validator";

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    @Length(2, 250)
    @ApiPropertyOptional()
    username?: string;

    @IsOptional()
    @IsString()
    @MinLength(5)
    @IsNotEmpty()
    @ApiPropertyOptional()
    password?: string;
}