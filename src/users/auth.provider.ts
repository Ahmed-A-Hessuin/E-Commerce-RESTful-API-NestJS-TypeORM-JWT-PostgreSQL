import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { RegistarDto } from "./dtos/registar.dto";
import * as bcrypt from 'bcryptjs';
import { LoginDto } from "./dtos/login.dto";
import { JWTPayloadType } from "../utils/types";
import { JwtService } from "@nestjs/jwt";
import { MailService } from "../mail/mail.service";
import { randomBytes } from "node:crypto";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class AuthProvider {
    constructor(
        @InjectRepository(User) private readonly usersRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly config: ConfigService
    ) { }

    /**
     * Create new user
     * @param registerDto data from creating new user
     * @returns JWT
     */
    public async register(registerDto: RegistarDto) {
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
            verificationToken: randomBytes(32).toString('hex')
        });

        // save user in DB
        newUser = await this.usersRepository.save(newUser);

        // generate link 
        const link = this.generateLink(newUser.id, newUser.verificationToken)
        //send Email 
        await this.mailService.sendVerifyEmailTemplate(email, link)

        // const accessToken = await this.generateJwt({ id: newUser.id, userType: newUser.userType, });
        return { message: 'Verification token has been sent to email , Please verify your email' };
    }

    /**
     * Log In user
     * @param loginDto data for Log in to user account
     * @returns JWT
     */
    public async login(loginDto: LoginDto) {
        // confim if user exist
        const { email, password } = loginDto;
        const user = await this.usersRepository.findOne({ where: { email } });
        if (!user) throw new BadRequestException("Invalid Email Or Password");

        // compare clint password and password save in dp
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch)
            throw new BadRequestException("Invalid Email Or Password");

        // check if the email is verified 
        if (!user.isAccountVerified) {
            let verificationToken = user.verificationToken;
            if (!verificationToken) {
                user.verificationToken = randomBytes(32).toString('hex')
                const result = await this.usersRepository.save(user);
                verificationToken = result.verificationToken
            }
            const link = this.generateLink(user.id, verificationToken)
            await this.mailService.sendVerifyEmailTemplate(email, link)
            return { message: 'Verification token has been sent to email , Please verify your email' };
        }
        // generate Jwt and return it with data to user
        const accessToken = await this.generateJwt({ id: user.id, userType: user.userType });
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

    /**
     * Generate email verification link
     */
    private generateLink(userId: number, verificationToken: string) {
        return `${this.config.get<string>("DOMAIN")}/api/users/verify-email/${userId}/${verificationToken}`
    }
}
