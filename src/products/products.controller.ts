import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    Delete,
    ParseIntPipe,
    UseGuards,
    Query,
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductsService } from './products.service';
import { AuthRolesGuard } from '../users/guards/auth-roles.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import type { JWTPayloadType } from '../utils/types';
import { Roles } from '../users/decorators/user-role.decorators';
import { UserType } from '../utils/enums';

@ApiTags('Products')
@Controller('api/products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    // POST : ~ /api/products
    // Create a new product (Admin only)
    @Post()
    @UseGuards(AuthRolesGuard)
    @Roles(UserType.ADMIN)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: 'Create a new product (Admin only)' })
    @ApiBody({ type: CreateProductDto })
    public createProduct(@Body() body: CreateProductDto, @CurrentUser() payload: JWTPayloadType) {
        return this.productsService.createProduct(body, payload.id);
    }

    // GET : ~ /api/products
    // Get all products with optional filters
    @Get()
    @ApiOperation({ summary: 'Get all products with optional filters' })
    @ApiQuery({ name: 'title', required: false, description: 'Filter by product title (partial match)' })
    @ApiQuery({ name: 'minPrice', required: false, description: 'Filter by minimum price' })
    @ApiQuery({ name: 'maxPrice', required: false, description: 'Filter by maximum price' })
    public getAllProducts(
        @Query('title') title?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
    ) {
        return this.productsService.getAll(title, minPrice, maxPrice);
    }

    // GET : ~ /api/products/:id
    // Get a single product by its ID
    @Get(':id')
    @ApiOperation({ summary: 'Get a single product by ID' })
    @ApiParam({ name: 'id', type: Number, description: 'Unique product ID' })
    public getSingleProducts(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.getOneBy(id);
    }

    // PUT : ~ /api/products/:id
    // Update an existing product (Admin only)
    @Put(':id')
    @UseGuards(AuthRolesGuard)
    @Roles(UserType.ADMIN)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: 'Update a product by ID (Admin only)' })
    @ApiParam({ name: 'id', type: Number, description: 'Unique product ID' })
    @ApiBody({ type: UpdateProductDto })
    public updateProduct(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateProductDto) {
        return this.productsService.update(id, body);
    }

    // DELETE : ~ /api/products/:id
    // Delete a product by ID (Admin only)
    @Delete(':id')
    @UseGuards(AuthRolesGuard)
    @Roles(UserType.ADMIN)
    @ApiSecurity('bearer')
    @ApiOperation({ summary: 'Delete a product by ID (Admin only)' })
    @ApiParam({ name: 'id', type: Number, description: 'Unique product ID' })
    public deleteProduct(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.delete(id);
    }
}
