import {
    Body,
    Controller,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
    Get,
    Put,
    Delete,
    Query,
} from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dtos/create-review.dto";
import { CurrentUser } from "../users/decorators/current-user.decorator";
import type { JWTPayloadType } from "../utils/types";
import { AuthRolesGuard } from "../users/guards/auth-roles.guard";
import { Roles } from "../users/decorators/user-role.decorators";
import { UserType } from "../utils/enums";
import { UpdateReviewDto } from "./dtos/update-review.dto";
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBody,
    ApiSecurity,
} from "@nestjs/swagger";

@ApiTags('Reviews')
@Controller('api/reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    // POST : ~ /api/reviews/:productId
    @Post(':productId')
    @UseGuards(AuthRolesGuard)
    @Roles(UserType.ADMIN, UserType.NORMAL_USER)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: 'Create a new review for a product' })
    @ApiParam({ name: 'productId', type: Number, description: 'ID of the product to review' })
    @ApiBody({ type: CreateReviewDto })
    public createNewReview(
        @Param('productId', ParseIntPipe) productId: number,
        @Body() body: CreateReviewDto,
        @CurrentUser() payload: JWTPayloadType,
    ) {
        return this.reviewsService.createReview(payload.id, productId, body);
    }

    // GET : ~ /api/reviews
    @Get()
    @UseGuards(AuthRolesGuard)
    @Roles(UserType.ADMIN)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: 'Get all reviews (Admin only)' })
    @ApiQuery({ name: 'pageNumber', type: Number, required: false, example: 1 })
    @ApiQuery({ name: 'reviewPerPage', type: Number, required: false, example: 10 })
    public getAllReviews(
        @Query('pageNumber', ParseIntPipe) pageNumber: number,
        @Query('reviewPerPage', ParseIntPipe) reviewPerPage: number,
    ) {
        return this.reviewsService.getAll(pageNumber, reviewPerPage);
    }

    // PUT : ~ /api/reviews/:id
    @Put(':id')
    @UseGuards(AuthRolesGuard)
    @Roles(UserType.ADMIN, UserType.NORMAL_USER)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: 'Update an existing review' })
    @ApiParam({ name: 'id', type: Number, description: 'Review Id to update' })
    @ApiBody({ type: UpdateReviewDto })
    public updateReview(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateReviewDto,
        @CurrentUser() payload: JWTPayloadType,
    ) {
        return this.reviewsService.update(id, payload.id, body);
    }

    // DELETE : ~ /api/reviews/:id
    @Delete(':id')
    @UseGuards(AuthRolesGuard)
    @Roles(UserType.ADMIN, UserType.NORMAL_USER)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: 'Delete a review by ID' })
    @ApiParam({ name: 'id', type: Number, description: 'Review ID to delete' })
    public deleteReview(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() payload: JWTPayloadType,
    ) {
        return this.reviewsService.delete(id, payload);
    }
}
