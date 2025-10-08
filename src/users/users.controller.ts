import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put, UseGuards, UseInterceptors } from "@nestjs/common";
import { UsersService } from "./users.service";
import { RegistarDto } from "./dtos/registar.dto";
import { LoginDto } from "./dtos/login.dto";
import { AuthGuard } from "./guards/auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import type { JWTPayloadType } from '../utils/types';
import { AuthRolesGuard } from "./guards/auth-roles.guard";
import { UserType } from "src/utils/enums";
import { Roles } from "./decorators/user-role.decorators";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { LoggerInterceptor } from "src/utils/interceptors/logger.interceptor";


@Controller('api/users')
export class usersController {
    constructor(private readonly usersService: UsersService) { }

    // POST : ~ /api/users/auth/register
    @Post('auth/register')
    public registar(@Body() body: RegistarDto) {
        return this.usersService.register(body)
    }

    // POST : ~ /api/users/auth/login
    @Post('auth/login')
    @HttpCode(HttpStatus.OK)
    public login(@Body() body: LoginDto) {
        return this.usersService.login(body)
    }

    // GET : ~ /api/users/current-user
    @Get('current-user')
    @UseGuards(AuthGuard)
    @UseInterceptors(LoggerInterceptor)
    public getCurrentUser(@CurrentUser() payload: JWTPayloadType) {
        return this.usersService.getCurrentUser(payload.id)
    }

    // GET : ~ /api/users
    @Get()
    @Roles(UserType.ADMIN)
    @UseGuards(AuthRolesGuard)
    public getAllUsers() {
        return this.usersService.getAll()
    }

    // Update : ~ /api/users 
    @Put()
    @Roles(UserType.ADMIN, UserType.NORMAL_USER)
    @UseGuards(AuthRolesGuard)
    public updateUser(@CurrentUser() payload: JWTPayloadType, @Body() body: UpdateUserDto) {
        return this.usersService.update(payload.id, body)
    }

    // Delete : ~ /api/users/:id
    @Delete(':id')
    @Roles(UserType.ADMIN, UserType.NORMAL_USER)
    @UseGuards(AuthRolesGuard)
    public deleteUser(@Param('id', ParseIntPipe) id: number, @CurrentUser() payload: JWTPayloadType) {
        return this.usersService.delete(id, payload)
    }
}