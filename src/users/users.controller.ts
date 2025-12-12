import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, Res, UploadedFile, UseGuards, UseInterceptors} from "@nestjs/common";
import { UsersService } from "./users.service";
import { RegistarDto } from "./dtos/registar.dto";
import { LoginDto } from "./dtos/login.dto";
import { AuthGuard } from "./guards/auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import type { JWTPayloadType } from '../utils/types';
import { AuthRolesGuard } from "./guards/auth-roles.guard";
import { UserType } from "../utils/enums";
import { Roles } from "./decorators/user-role.decorators";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { LoggerInterceptor } from "../utils/interceptors/logger.interceptor";
import { FileInterceptor } from "@nestjs/platform-express";
import express from "express";
import { ApiTags, ApiOperation, ApiSecurity, ApiConsumes, ApiBody, ApiParam } from "@nestjs/swagger";
import { ImageUploadDto } from "./dtos/image-upload.dto";

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // POST : ~ /api/users/auth/register
    @Post('auth/register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: RegistarDto })
    public register(@Body() body: RegistarDto) {
        return this.usersService.register(body);
    }

    // POST : ~ /api/users/auth/login
    @Post('auth/login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login user and get JWT token' })
    @ApiBody({ type: LoginDto })
    public login(@Body() body: LoginDto) {
        return this.usersService.login(body);
    }

    // GET : ~ /api/users/current-user
    @Get('current-user')
    @UseGuards(AuthGuard)
    @UseInterceptors(LoggerInterceptor)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: 'Get the current logged-in user' })
    public getCurrentUser(@CurrentUser() payload: JWTPayloadType) {
        return this.usersService.getCurrentUser(payload.id);
    }

    // GET : ~ /api/users
    @Get()
    @Roles(UserType.ADMIN)
    @UseGuards(AuthRolesGuard)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: 'Get all users (Admin only)' })
    public getAllUsers() {
        return this.usersService.getAll();
    }

    // PUT : ~ /api/users
    @Put()
    @Roles(UserType.ADMIN, UserType.NORMAL_USER)
    @UseGuards(AuthRolesGuard)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: 'Update current user information' })
    @ApiBody({ type: UpdateUserDto })
    public updateUser(@CurrentUser() payload: JWTPayloadType, @Body() body: UpdateUserDto) {
        return this.usersService.update(payload.id, body);
    }

    // DELETE : ~ /api/users/:id
    @Delete(':id')
    @Roles(UserType.ADMIN, UserType.NORMAL_USER)
    @UseGuards(AuthRolesGuard)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: 'Delete a user by Id' })
    @ApiParam({ name: 'id', type: Number })
    public deleteUser(@Param('id', ParseIntPipe) id: number, @CurrentUser() payload: JWTPayloadType) {
        return this.usersService.delete(id, payload);
    }

    // POST: ~/api/users/upload-image
    @Post('upload-image')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('user-image'))
    @ApiSecurity('bearer')
    @ApiOperation({ summary: 'Upload user profile image' })
    @ApiConsumes("multipart/form-data")
    @ApiBody({type : ImageUploadDto , description : 'profile Image'})
    public uploadProfileImage(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() payload: JWTPayloadType
    ) {
        if (!file) throw new BadRequestException('no image provided');
        return this.usersService.setProfileImage(payload.id, file.filename);
    }

    // DELETE ~/api/users/images/remove-profile-image
    @Delete("images/remove-profile-image")
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: 'Remove profile image of current user' })
    public removeProfileImage(@CurrentUser() payload: JWTPayloadType) {
        return this.usersService.removeProfileImage(payload.id);
    }

    // GET: ~/api/users/images/:image
    @Get("images/:image")
    @UseGuards(AuthGuard)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: 'Serve user profile image by filename' })
    @ApiParam({ name: 'image', type: String })
    public showProfileImage(@Param("image") image: string, @Res() res: express.Response) {
        return res.sendFile(image, { root: 'images/users' });
    }

    // GET: ~/api/users/verify-email/:id/:verificationToken
    @Get("verify-email/:id/:verificationToken")
    @ApiOperation({ summary: 'Verify user email using token' })
    @ApiParam({ name: 'id', type: Number })
    @ApiParam({ name: 'verificationToken', type: String })
    public verifyEmail(
        @Param('id', ParseIntPipe) id: number,
        @Param('verificationToken') verificationToken: string
    ) {
        return this.usersService.verifyEmail(id, verificationToken);
    }
}
