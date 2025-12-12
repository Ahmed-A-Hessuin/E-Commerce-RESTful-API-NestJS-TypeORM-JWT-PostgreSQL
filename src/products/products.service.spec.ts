import { Test, TestingModule } from "@nestjs/testing";
import { ProductsService } from "./products.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UsersService } from "../users/users.service";
import { Product } from "./product.entity";
import { Repository } from "typeorm";
import { CreateProductDto } from "./dtos/create-product.dto";
type ProductTestType = { id: number, title: string, price: number };
type Options = { where: { title?: string, minPrice?: number, maxPrice?: number } }
type FindOneParam = { where: { id: number } }

describe('ProductsService', () => {
    let productsService: ProductsService;
    let productRepository: Repository<Product>;
    const REPOSITORY_TOKEN = getRepositoryToken(Product);
    const createProductDto: CreateProductDto = {
        title: 'book',
        description: 'about this book',
        price: 50
    }
    let products: ProductTestType[];

    beforeEach(async () => {
        products = [
            { id: 1, title: 'p1', price: 10 },
            { id: 2, title: 'p1', price: 10 },
            { id: 3, title: 'p1', price: 10 },
            { id: 4, title: 'p1', price: 10 }
        ]
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                {
                    provide: UsersService,
                    useValue: { getCurrentUser: jest.fn((userId: number) => Promise.resolve({ id: userId })) }
                },
                {
                    provide: REPOSITORY_TOKEN,
                    useValue: {
                        create: jest.fn((dto: CreateProductDto) => dto),
                        save: jest.fn((dto: CreateProductDto) => Promise.resolve({ ...dto, id: 1 })),
                        find: jest.fn((options?: Options) => {
                            if (options?.where.title) return Promise.resolve([products[0], products[1]]);
                            return Promise.resolve(products)
                        }),
                        findOne: jest.fn((param: FindOneParam) => Promise.resolve(products.find(p => p.id === param.where.id))),
                        remove: jest.fn((product: Product) => {
                            const index = products.indexOf(product);
                            if (index !== -1)
                                return Promise.resolve(products.splice(index, 1))
                        })
                    }
                }
            ]
        }).compile();
        productsService = module.get<ProductsService>(ProductsService);
        productRepository = module.get<Repository<Product>>(REPOSITORY_TOKEN)
    });

    it("should product service be defind", () => {
        expect(productsService).toBeDefined();
    })
    it("should productsRepository be defind", () => {
        expect(productRepository).toBeDefined();
    })

    // Create new Product Tests
    describe("createProduct()", () => {
        it("should call 'create' method in product repository", async () => {
            await productsService.createProduct(createProductDto, 1);
            expect(productRepository.create).toHaveBeenCalled();
            expect(productRepository.create).toHaveBeenCalledTimes(1)
        })

        it("should call 'save' method in product repository", async () => {
            await productsService.createProduct(createProductDto, 1);
            expect(productRepository.save).toHaveBeenCalled();
            expect(productRepository.save).toHaveBeenCalledTimes(1)
        })

        it("should create a new product", async () => {
            const result = await productsService.createProduct(createProductDto, 1);
            expect(result).toBeDefined()
            expect(result.title).toBe("book")
            expect(result.id).toBe(1)

        })
    })

    // Get All Products 
    describe('getAll()', () => {
        it("should call 'find' method in product repository", async () => {
            await productsService.getAll()
            expect(productRepository.find).toHaveBeenCalled();
            expect(productRepository.find).toHaveBeenCalledTimes(1)
        })

        it("should return 2 products if an argument passed", async () => {
            const data = await productsService.getAll('book');
            expect(data).toHaveLength(2);
        })

        it("should return 2 products if an argument passed", async () => {
            const data = await productsService.getAll('book');
            expect(data).toHaveLength(2);
        })

        it("should return all products if no argument passed", async () => {
            const data = await productsService.getAll();
            expect(data).toHaveLength(4);
        })
    })

    // Get One Product by id
    describe('getOneBy()', () => {
        it("should call 'findOne' method in product repository", async () => {
            await productsService.getOneBy(1);
            expect(productRepository.findOne).toHaveBeenCalled();
            expect(productRepository.findOne).toHaveBeenCalledTimes(1)
        });
        it("should return a product with the given id", async () => {
            const product = await productsService.getOneBy(1);
            expect(product).toMatchObject(products[0])
        });
        it("should throw NotFoundException if product was not found", async () => {
            expect.assertions(1);
            try {
                await productsService.getOneBy(20);
            } catch (error) {
                expect(error).toMatchObject({ message: 'product not found' });
            }
        });
    });

    // Update Product
    describe('update()', () => {
        const title = 'product updated';

        it("should call 'save' method in product repository and update the product", async () => {
            const result = await productsService.update(1, { title });
            expect(productRepository.save).toHaveBeenCalled();
            expect(productRepository.save).toHaveBeenCalledTimes(1);
            expect(result.title).toBe(title)
        });
        it("should throw NotFoundException if product was not found", async () => {
            expect.assertions(1);
            try {
                await productsService.update(20, { title });
            } catch (error) {
                expect(error).toMatchObject({ message: 'product not found' });
            }
        });
    })

    // Delete Product 
    describe('delete()', () => {
        it("should call 'remove' method in products repository", async () => {
            await productsService.delete(1)
            expect(productRepository.remove).toHaveBeenCalled();
            expect(productRepository.remove).toHaveBeenCalledTimes(1);
        });
        it("should remove the product and return the sccess message", async () => {
            const result = await productsService.delete(1)
            expect(result).toMatchObject({ message: ' product deleted successfully ' })
        });
        it("should throw NotFoundException if product was not found", async () => {
            expect.assertions(1);
            try {
                await productsService.delete(20);
            } catch (error) {
                expect(error).toMatchObject({ message: 'product not found' });
            }
        });
    })
})