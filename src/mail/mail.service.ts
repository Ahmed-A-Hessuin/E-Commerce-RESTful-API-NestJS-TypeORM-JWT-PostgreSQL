import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, RequestTimeoutException } from "@nestjs/common";


@Injectable({})
export class MailService {
    constructor(private readonly mailerService: MailerService) { }
    /**
    * sending email after user logged in this account
    * @param email  logged in user email
    */
    public async sendLogInEmail(email: string) {
        try {
            const today = new Date();
            await this.mailerService.sendMail({
                to: email,
                from: `<no-reply@my-nest-app.com>`,
                subject: 'Log in',
                template: 'login',
                context: { email, today }
            })
        } catch (error) {
            console.log(error);
            throw new RequestTimeoutException();
        }
    }

    /**
     * sending verify email template
     * @param email email of the registered user
     * @param link link with id of the user and verification token 
     */
    public async sendVerifyEmailTemplate(email: string, link: string) {
        try {
            await this.mailerService.sendMail({
                to: email,
                from: `<no-reply@my-nest-app.com>`,
                subject: 'Verify your account',
                template: 'verify-email',
                context: { email, link }
            })
        } catch (error) {
            console.log(error);
            throw new RequestTimeoutException();
        }
    }
}