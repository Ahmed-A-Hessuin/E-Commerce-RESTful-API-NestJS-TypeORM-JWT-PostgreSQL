import { ApiProperty } from "@nestjs/swagger";
import type { Express } from "express";

export class FileUploadDto {

    @ApiProperty({
        type: 'string' ,
        format : 'binary' ,
        required : true ,
        name : 'file'
    })
    file : Express.Multer.File
}