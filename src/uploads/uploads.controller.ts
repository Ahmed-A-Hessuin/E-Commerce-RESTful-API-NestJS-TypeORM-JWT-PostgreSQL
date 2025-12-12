import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import express from "express";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";
import { FilesUploadDto } from "./dtos/files-upload.dto";
import { FileUploadDto } from "./dtos/file-upload.dto";


@Controller("api/uploads")
export class uploadsController {

    // POST : ~/api/uploads
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes("multipart/form-data")
    @ApiBody({ type: FileUploadDto, description: 'Uploading multiplle images example' })
    public uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException("no file provided")
        console.log('file uploaded', { file });
        return { message: 'File uploaded successfully' }
    }

    // POST : ~/api/uploads/multiple-files 
    @Post("multiple-files")
    @UseInterceptors(FilesInterceptor('files'))
    @ApiConsumes("multipart/form-data")
    @ApiBody({ type: FilesUploadDto, description: 'Uploading multiplle images example ' })
    public uploadMultipleFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
        if (!files || files.length === 0) throw new BadRequestException("no file provided")
        console.log('Files uploaded', { files });
        return { message: 'Files uploaded successfully' }
    }

    // GET: ~/api/uploads/:image
    @Get(":image")
    public showUploadedImage(@Param("image") image: string, @Res() res: express.Response) {
        return res.sendFile(image, { root: 'images' })
    }
} 