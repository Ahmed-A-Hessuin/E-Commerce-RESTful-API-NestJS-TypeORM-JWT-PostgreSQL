import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { RegistarDto } from "./dtos/registar.dto";
import { LoginDto } from "./dtos/login.dto";
import { AccessTokenType, JWTPayloadType } from "../utils/types";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { UserType } from "../utils/enums";
import { AuthProvider } from "./auth.provider";
import { join } from 'node:path'
import { unlinkSync } from "node:fs";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly authProvider: AuthProvider
    ) { }

    /**
     * create new user
     * @param registerDto 
     * @returns JWT
    */
    public async register(registerDto: RegistarDto) {
        return this.authProvider.register(registerDto)
    }

    /**
     * Log In user
     * @param loginDto data for Log in to user account
     * @returns JWT
    */
    public async login(loginDto: LoginDto)  {
        return this.authProvider.login(loginDto)
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
     * @returns collection of users
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
            user.password = await this.authProvider.hashPassword(password)
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
        if (user.id === payload?.id || payload.userType === UserType.ADMIN) {
            await this.usersRepository.remove(user)
            return { message: 'User has been deleted' }
        }
        throw new ForbiddenException("access denied , you are now allowed")
    }

    /**
     * set profile image
     * @param userId id for the logged user
     * @param newProfileImage profile image 
     * @returns the user from db
     */
    public async setProfileImage(userId: number, newProfileImage: string) {
        const user = await this.getCurrentUser(userId);
        if (user.profileImage === null) {
            user.profileImage = newProfileImage;
        } else {
            await this.removeProfileImage(userId);
            user.profileImage = newProfileImage
        }
        return this.usersRepository.save(user)
    }

    /**
     * Remove Profile Image
     * @param userId id of the logged in user
     * @returns the user from the database
     */
    public async removeProfileImage(userId: number) {
        const user = await this.getCurrentUser(userId)
        if (user.profileImage === null)
            throw new BadRequestException('there is no profile image')

        const imagePath = join(process.cwd(), `./images/users/${user.profileImage}`)
        unlinkSync(imagePath)

        user.profileImage = null as unknown as string;
        return this.usersRepository.save(user)
    }

    /**
     * verify Email
     * @param userId id of the user from link
     * @param verificationToken verification token from the link
     * @returns success message
     */
    public async verifyEmail (userId : number , verificationToken : string ) {
        const user = await this.getCurrentUser(userId);
        if(user.verificationToken === null)
            throw new NotFoundException('there is no verification token')

        if(user.verificationToken !== verificationToken ) 
            throw new BadRequestException('invalid link')

        user.isAccountVerified = true ;
        user.verificationToken = null as unknown as string ;

        await this.usersRepository.save(user);
        return {message : 'Your email has been verified , please login to your account'}
    }

}