import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { RegistarDto } from "./dtos/registar.dto";
import bcrypt from "node_modules/bcryptjs";
import { LoginDto } from "./dtos/login.dto";
import { AccessTokenType, JWTPayloadType } from "src/utils/types";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthProvider {
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
        const { email, password, username } = registerDto;
        // confirm if email is exist
        const userFromDb = await this.usersRepository.findOne({ where: { email } });
        if (userFromDb) throw new BadRequestException("user aleardy exist");

        // hash password
        const hashedPassword = await this.hashPassword(password);

        // create new user
        let newUser = this.usersRepository.create({
            email,
            username,
            password: hashedPassword,
        });

        // save user in DB
        newUser = await this.usersRepository.save(newUser);

        // generate Jwt and return it with data to user
        const accessToken = await this.generateJwt({
            id: newUser.id,
            userType: newUser.userType,
        });
        return { accessToken };
    }

    /**
     * Log In user
     * @param loginDto data for Log in to user account
     * @returns JWT
     */
    public async login(loginDto: LoginDto): Promise<AccessTokenType> {
        // confim if user exist
        const { email, password } = loginDto;
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) throw new BadRequestException("Invalid Email Or Password");

        // compare clint password and password save in dp
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch)
            throw new BadRequestException("Invalid Email Or Password");

        // generate Jwt and return it with data to user
        const accessToken = await this.generateJwt({
            id: user.id,
            userType: user.userType,
        });
        return { accessToken };
    }

    /**
     * Hashing Password
     * @param password plain text password
     * @returns hashing password
     */
    public async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    /**
     * Generate Json Web Token
     * @param payload JWt payload
     * @returns Token
     */
    private async generateJwt(payload: JWTPayloadType): Promise<string> {
        return await this.jwtService.signAsync(payload);
    }
}
