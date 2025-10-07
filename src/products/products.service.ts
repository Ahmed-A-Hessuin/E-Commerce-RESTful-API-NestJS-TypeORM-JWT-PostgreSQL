import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateProductDto } from "./dtos/create-product.dto";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { Repository } from "typeorm";
import { Product } from "./product.entity";
import { InjectRepository } from "@nestjs/typeorm";


@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private readonly productsRepository: Repository<Product>
    ) { }

    /**
    * Create New Product 
    */
    public createProduct(dto: CreateProductDto) {
        const newProduct = this.productsRepository.create(dto);
        return this.productsRepository.save(newProduct)
    }

    /**
    * Get All Products
    */
    public getAll() {
        return this.productsRepository.find();
    }

    /**
    * Get One Product by id
    */
    public async getOneBy(id: number) {
        const product = await this.productsRepository.findOne({ where: { id } });
        if (!product) throw new NotFoundException("NO Product Found");
        return product;
    }

    /**
    * Update Single Product
    */
    public async update(id: number, dto: UpdateProductDto) {
        const product = await this.getOneBy(id);

        product.title = dto.title ?? product.title;
        product.description = dto.description ?? product.description;
        product.price = dto.price ?? product.price;
        return this.productsRepository.save(product)

    }

    /**
    * Delete Single Product
    */
    public async delete(id: number) {
        const product = await this.getOneBy(id);
        await this.productsRepository.remove(product)
        return { message: ' product deleted successfully ' }
    }
}