import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { RegistarDto } from "./dtos/registar.dto";
import { LoginDto } from "./dtos/login.dto";
import { AuthGuard } from "./guards/auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import type { JWTPayloadType } from '../utils/types';
import { AuthRolesGuard } from "./guards/auth-roles.guard";
import { UserType } from "src/utils/enums";
import { Roles } from "./decorators/user-role.decorators";


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
}