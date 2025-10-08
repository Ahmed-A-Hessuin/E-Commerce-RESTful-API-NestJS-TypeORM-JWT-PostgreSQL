import {  IsNotEmpty, IsOptional, IsString, Length, MinLength } from "class-validator";

export class UpdateUserDto {

    @IsOptional()
    @IsString()
    @Length(2,250)
    username?: string;

    @IsOptional()
    @IsString()
    @MinLength(5)
    @IsNotEmpty()
    password?: string;
}