import { Body, Controller, Param, ParseIntPipe, Post, UseGuards, Get, Put, Delete, Query } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dtos/create-review.dto";
import { CurrentUser } from "src/users/decorators/current-user.decorator";
import type { JWTPayloadType } from "src/utils/types";
import { AuthRolesGuard } from "src/users/guards/auth-roles.guard";
import { Roles } from "src/users/decorators/user-role.decorators";
import { UserType } from "src/utils/enums";
import { UpdateReviewDto } from "./dtos/update-review.dto";


@Controller('api/reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    // POST : ~ /api/reviews/:productId
    @Post(':productId')
    @UseGuards(AuthRolesGuard)
    @Roles(UserType.ADMIN, UserType.NORMAL_USER)
    public createNewReview(
        @Param('productId', ParseIntPipe) productId: number,
        @Body() body: CreateReviewDto,
        @CurrentUser() payload: JWTPayloadType
    ) {
        return this.reviewsService.createReview(payload.id, productId, body);
    }

    // GET : ~ /api/reviews
    @Get()
    @UseGuards(AuthRolesGuard)
    @Roles(UserType.ADMIN)
    public getAllReviews(
        @Query('pageNumber', ParseIntPipe) pageNumber: number,
        @Query('reviewPerPage', ParseIntPipe) reviewPerPage: number
    ) {
        return this.reviewsService.getAll(pageNumber, reviewPerPage)
    }

    // PUT : ~ /api/reviews/:id

    @Put(':id')
    @UseGuards(AuthRolesGuard)
    @Roles(UserType.ADMIN, UserType.NORMAL_USER)
    public updateReview(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateReviewDto,
        @CurrentUser() payload: JWTPayloadType
    ) {
        return this.reviewsService.update(id, payload.id, body);
    }

    // Delete : ~ /api/reviews/:id
    @Delete(':id')
    @UseGuards(AuthRolesGuard)
    @Roles(UserType.ADMIN, UserType.NORMAL_USER)
    public deleteReview(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() payload: JWTPayloadType
    ) {
        return this.reviewsService.delete(id, payload);
    }
}