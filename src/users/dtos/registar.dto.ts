import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, MaxLength, MinLength } from "class-validator";

export class RegistarDto {

    @IsEmail()
    @MaxLength(250)
    @IsNotEmpty()
    @ApiProperty()
    email: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    @ApiProperty()
    password: string;

    @IsOptional()
    @IsString()
    @Length(2, 150)
    @ApiPropertyOptional()
    username: string
}