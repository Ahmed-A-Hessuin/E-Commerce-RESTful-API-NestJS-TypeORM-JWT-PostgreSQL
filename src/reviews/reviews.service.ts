import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Review } from "./review.entity";
import { Repository } from "typeorm";
import { ProductsService } from "src/products/products.service";
import { UsersService } from "src/users/users.service";
import { CreateReviewDto } from "./dtos/create-review.dto";
import { UpdateReviewDto } from "./dtos/update-review.dto";
import { JWTPayloadType } from "src/utils/types";
import { UserType } from "src/utils/enums";

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review) private readonly reviewsRepository: Repository<Review>,
        private readonly productService: ProductsService,
        private readonly usersService: UsersService
    ) { }

    /**
     * @param userId id for the user that created this review
     * @param productId id for product
     * @param dto data for creating the review
     * @returns the created review from db
     */
    public async createReview(userId: number, productId: number, dto: CreateReviewDto) {
        const product = await this.productService.getOneBy(productId)
        const user = await this.usersService.getCurrentUser(userId)
        const review = this.reviewsRepository.create({ ...dto, user, product })
        const result = await this.reviewsRepository.save(review);
        return {
            id: result.id,
            comment: result.comment,
            rating: result.rating,
            createdAt: result.createdAt,
            userId: user.id,
            productId: product.id
        }
    }

    /**
     * Get All Reviews
     * @param pageNumber number of the current page
     * @param reviewPerPage data per page 
     * @returns collection of reviews
     */
    public async getAll(pageNumber: number, reviewPerPage: number) {
        return this.reviewsRepository.find({
            skip: reviewPerPage * (pageNumber - 1),
            take: reviewPerPage,
            order: { createdAt: 'DESC' } 
        });
    }

    /**
     * @param reviewId id for the review
     * @param userId id for the owner of the review
     * @param dto data for updating the review
     * @returns updated review
     */
    public async update(reviewId: number, userId: number, dto: UpdateReviewDto) {
        const review = await this.getReviewBy(reviewId)
        if (review.user.id !== userId)
            throw new ForbiddenException('access denied , you are not allowed')

        review.rating = dto.rating ?? review.rating;
        review.comment = dto.comment ?? review.comment
        return this.reviewsRepository.save(review)
    }

    /**
     * @param reviewId id for the review
     * @param payload JWTPayload
     * @returns message to sucess deleted
     */
    public async delete(reviewId: number, payload: JWTPayloadType) {
        const review = await this.getReviewBy(reviewId)
        if (review.user.id === payload.id || payload.userType === UserType.ADMIN) {
            await this.reviewsRepository.remove(review)
            return { message: 'Review has been deleted' }
        }
        throw new ForbiddenException('access denied , you are not allowed')
    }

    /**
     * Get single review by id
     * @param id id for the review
     * @returns review from the database
     */
    private async getReviewBy(id: number) {
        const review = await this.reviewsRepository.findOne({ where: { id } })
        if (!review) throw new NotFoundException('Review Not Found')
        return review
    }
}