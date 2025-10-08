import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { RegistarDto } from "./dtos/registar.dto";
import bcrypt from "node_modules/bcryptjs";
import { LoginDto } from "./dtos/login.dto";
import { JwtService } from "@nestjs/jwt";
import { AccessTokenType, JWTPayloadType } from "src/utils/types";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { UserType } from "src/utils/enums";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    /**
     * create new user
     * @param registerDto 
     * @returns JWT
    */
    public async register(registerDto: RegistarDto): Promise<AccessTokenType> {
        const { email, password, username } = registerDto
        // confirm if email is exist 
        const userFromDb = await this.usersRepository.findOne({ where: { email } })
        if (userFromDb) throw new BadRequestException("user aleardy exist");

        // hash password 
        const hashedPassword = await this.hashPassword(password)

        // create new user 
        let newUser = this.usersRepository.create({
            email,
            username,
            password: hashedPassword
        })

        // save user in DB
        newUser = await this.usersRepository.save(newUser)

        // generate Jwt and return it with data to user 
        const accessToken = await this.generateJwt({ id: newUser.id, userType: newUser.userType })
        return { accessToken };
    }

    /**
     * Log In user
     * @param loginDto data for Log in to user account
     * @returns JWT
    */
    public async login(loginDto: LoginDto): Promise<AccessTokenType> {
        // confim if user exist 
        const { email, password } = loginDto
        const user = await this.usersRepository.findOne({ where: { email } })
        if (!user) throw new BadRequestException("Invalid Email Or Password");

        // compare clint password and password save in dp
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) throw new BadRequestException("Invalid Email Or Password");

        // generate Jwt and return it with data to user 
        const accessToken = await this.generateJwt({ id: user.id, userType: user.userType })
        return { accessToken };
    }

    /**
     * Get Current User (logged User)
     * @param id id for logged user
     * @returns user date from db
    */
    public async getCurrentUser(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } })
        if (!user) throw new NotFoundException('User Not Found')
        return user;
    }

    /**
     * Get All users from db
     * @returns array of users
    */
    public getAll(): Promise<User[]> {
        return this.usersRepository.find();

    }

    /**
     * 
     * @param id id of the logged user 
     * @param updateUserDto data for updating the user
     * @returns update user from the database 
    */
    public async update(id: number, updateUserDto: UpdateUserDto) {
        const { username, password } = updateUserDto
        const user = await this.usersRepository.findOne({ where: { id } })
        if (!user) {
            throw new Error('User not found');
        }
        user.username = username ?? user.username;
        if (password) {
            user.password = await this.hashPassword(password)
        }
        return this.usersRepository.save(user)
    }

    /**
     * Delete User
     * @param userId id for the user
     * @param payload JWTPayload
     * @returns a success message
    */
    public async delete(userId: number, payload: JWTPayloadType) {
        const user = await this.getCurrentUser(userId)
        if (user.id === payload.id || payload?.userType === UserType.ADMIN) {
            await this.usersRepository.remove(user)
            return { message: 'User has been deleted' }
        }
        throw new ForbiddenException("access denied , you are now allowed")
    }

    /**
     * Generate Json Web Token
     * @param payload JWt payload
     * @returns Token
    */
    private async generateJwt(payload: JWTPayloadType): Promise<string> {
        return await this.jwtService.signAsync(payload)
    }

    /**
     * Hashing Password
     * @param password plain text password
     * @returns hashing password
    */
    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }
}