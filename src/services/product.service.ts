import { productRepository } from '@/repositories/product.repository';
import { CreateProductInput, UpdateProductInput, createProductSchema, updateProductSchema } from '@/validators/product.validator';
import { auditService } from './audit.service';
import { prisma } from '@/lib/prisma';

export class ProductService {

  /**
   * Perform publishing validation when product status is set to ACTIVE
   */
  static validatePublishingRequirements(productData: {
    name?: string;
    sku?: string;
    price?: number | any;
    categoryId?: string;
    images?: any[];
    inventoryStock?: number;
    allowNoImages?: boolean;
  }) {
    if (!productData.name || productData.name.trim().length < 2) {
      throw new Error('Publishing validation failed: Product name is required (min 2 chars).');
    }
    if (!productData.sku || productData.sku.trim().length < 3) {
      throw new Error('Publishing validation failed: Valid SKU is required (min 3 chars).');
    }
    const priceNum = Number(productData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      throw new Error('Publishing validation failed: Selling price must be a positive number.');
    }
    if (!productData.categoryId) {
      throw new Error('Publishing validation failed: Product must be assigned to a valid Category.');
    }
    if (!productData.allowNoImages && (!productData.images || productData.images.length === 0)) {
      throw new Error('Publishing validation failed: Product must have at least 1 image before activating.');
    }
  }

  async getProducts(params: {
    page?: number;
    limit?: number;
    categorySlug?: string;
    collectionSlug?: string;
    search?: string;
    cacaoPercentage?: number;
    featured?: boolean;
    status?: string;
    sortBy?: 'price-asc' | 'price-desc' | 'created-desc';
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 12));
    const skip = (page - 1) * limit;

    let { products, total } = await productRepository.findMany({
      skip,
      take: limit,
      categorySlug: params.categorySlug,
      collectionSlug: params.collectionSlug,
      search: params.search,
      cacaoPercentage: params.cacaoPercentage,
      featured: params.featured,
      status: params.status,
      sortBy: params.sortBy,
    });

    if (products.length === 0 && !params.search && !params.categorySlug) {
      const DEFAULT_REAL_PRODUCTS: any[] = [
        {
          id: 'default-rock',
          name: 'Rock Chocolate',
          slug: 'rock-chocolate',
          sku: 'THALF-ROCK-70',
          price: 70,
          weight: '4 pcs',
          description: 'Crispy golden cornflakes tossed in velvety milk chocolate, handcrafted into delightful crunch rocks.',
          shortDescription: 'Milk chocolate & crunchy cornflakes (4 pcs)',
          ingredients: 'Milk chocolate, cornflakes',
          tastingNotes: ['Milk Chocolate', 'Crispy Cornflakes', 'Crunchy Texture'],
          storageInstructions: 'Store in a cool, dry place away from direct sunlight (18°C - 22°C).',
          shelfLife: '3 Months',
          images: [{ id: 'img-rock', url: '/images/choclates/rock-chocolate.jpeg', alt: 'Rock Chocolate', isDefault: true }],
          status: 'ACTIVE',
          featured: true,
        },
        {
          id: 'default-dates',
          name: 'Dates Chocolate',
          slug: 'dates-chocolate',
          sku: 'THALF-DATE-100',
          price: 100,
          weight: '4 pcs',
          description: 'Premium stuffed dates with roasted cashews & roasted almonds, enrobed in a rich blend of milk and dark chocolate.',
          shortDescription: 'Milk & dark chocolate dates with roasted cashew & almond (4 pcs)',
          ingredients: 'Milk chocolate, dark chocolate, dates, roasted cashew, roasted almond',
          tastingNotes: ['Rich Date Sweetness', 'Roasted Cashew', 'Roasted Almond', 'Milk & Dark Blend'],
          storageInstructions: 'Store in a cool, dry place away from direct sunlight (18°C - 22°C).',
          shelfLife: '3 Months',
          images: [{ id: 'img-dates', url: '/images/choclates/dates-chocolate.jpeg', alt: 'Dates Chocolate', isDefault: true }],
          status: 'ACTIVE',
          featured: true,
        },
        {
          id: 'default-lollypop',
          name: 'Chocolate Lollypop',
          slug: 'chocolate-lollypop',
          sku: 'THALF-LOL-50',
          price: 50,
          weight: '3 pcs',
          description: 'Handcrafted chocolate pops made with smooth milk chocolate and creamy white chocolate layers.',
          shortDescription: 'Milk chocolate & white chocolate pops (3 pcs)',
          ingredients: 'Milk chocolate, white chocolate',
          tastingNotes: ['Creamy White Chocolate', 'Smooth Milk Chocolate', 'Playful & Sweet'],
          storageInstructions: 'Store in a cool, dry place away from direct sunlight (18°C - 22°C).',
          shelfLife: '3 Months',
          images: [{ id: 'img-lol', url: '/images/choclates/lollypop.jpeg', alt: 'Chocolate Lollypop', isDefault: true }],
          status: 'ACTIVE',
          featured: true,
        },
        {
          id: 'default-kunafa',
          name: 'Kunafa Chocolate',
          slug: 'kunafa-chocolate',
          sku: 'THALF-KUN-70',
          price: 70,
          weight: '25g (Mini bites)',
          description: 'Crispy Middle-Eastern style kunafa pastry and pistachio butter wrapped in luscious milk chocolate. Shipping: ₹80 (Kerala) | ₹100 (Out of Kerala).',
          shortDescription: 'Milk chocolate, pistachio, kunafa & butter (Mini bites 25g)',
          ingredients: 'Milk chocolate, pistachio, kunafa, butter',
          tastingNotes: ['Crispy Kunafa Pastry', 'Pistachio Butter', 'Milk Chocolate'],
          storageInstructions: 'Store in a cool, dry place away from direct sunlight (18°C - 22°C).',
          shelfLife: '2 Months',
          images: [{ id: 'img-kun', url: '/images/choclates/kunafa-pistachio.jpeg', alt: 'Kunafa Chocolate', isDefault: true }],
          status: 'ACTIVE',
          featured: true,
        },
        {
          id: 'default-caramel',
          name: 'Caramel Nuts',
          slug: 'caramel-nuts',
          sku: 'THALF-CAR-80',
          price: 80,
          weight: '5 pcs',
          description: 'Decadent milk chocolate bites filled with buttery caramel, roasted cashews, and roasted almonds. Shipping: ₹80 (Kerala) | ₹100 (Out of Kerala).',
          shortDescription: 'Milk chocolate, roasted cashew, roasted almond & caramel (5 pcs)',
          ingredients: 'Milk chocolate, roasted cashew, roasted almond, caramel',
          tastingNotes: ['Golden Butter Caramel', 'Roasted Cashew', 'Roasted Almond', 'Milk Chocolate'],
          storageInstructions: 'Store in a cool, dry place away from direct sunlight (18°C - 22°C).',
          shelfLife: '3 Months',
          images: [{ id: 'img-car', url: '/images/choclates/caramel-chocolate.jpeg', alt: 'Caramel Nuts', isDefault: true }],
          status: 'ACTIVE',
          featured: true,
        },
      ];
      products = DEFAULT_REAL_PRODUCTS as any;
      total = DEFAULT_REAL_PRODUCTS.length;
    }

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error(`Product with ID '${id}' not found`);
    }
    return product;
  }

  async getProductBySlug(slug: string) {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
      throw new Error(`Product with slug '${slug}' not found`);
    }
    return product;
  }

  async getProductBySlugOrId(identifier: string) {
    const product = await productRepository.findBySlugOrId(identifier);
    if (!product) {
      const DEFAULT_REAL_PRODUCTS: any[] = [
        {
          id: 'default-rock',
          name: 'Rock Chocolate',
          slug: 'rock-chocolate',
          sku: 'THALF-ROCK-70',
          price: 70,
          weight: '4 pcs',
          description: 'Crispy golden cornflakes tossed in velvety milk chocolate, handcrafted into delightful crunch rocks.',
          shortDescription: 'Milk chocolate & crunchy cornflakes (4 pcs)',
          ingredients: 'Milk chocolate, cornflakes',
          tastingNotes: ['Milk Chocolate', 'Crispy Cornflakes', 'Crunchy Texture'],
          storageInstructions: 'Store in a cool, dry place away from direct sunlight (18°C - 22°C).',
          shelfLife: '3 Months',
          images: [{ id: 'img-rock', url: '/images/choclates/rock-chocolate.jpeg', alt: 'Rock Chocolate', isDefault: true }],
          status: 'ACTIVE',
          featured: true,
        },
        {
          id: 'default-dates',
          name: 'Dates Chocolate',
          slug: 'dates-chocolate',
          sku: 'THALF-DATE-100',
          price: 100,
          weight: '4 pcs',
          description: 'Premium stuffed dates with roasted cashews & roasted almonds, enrobed in a rich blend of milk and dark chocolate.',
          shortDescription: 'Milk & dark chocolate dates with roasted cashew & almond (4 pcs)',
          ingredients: 'Milk chocolate, dark chocolate, dates, roasted cashew, roasted almond',
          tastingNotes: ['Rich Date Sweetness', 'Roasted Cashew', 'Roasted Almond', 'Milk & Dark Blend'],
          storageInstructions: 'Store in a cool, dry place away from direct sunlight (18°C - 22°C).',
          shelfLife: '3 Months',
          images: [{ id: 'img-dates', url: '/images/choclates/dates-chocolate.jpeg', alt: 'Dates Chocolate', isDefault: true }],
          status: 'ACTIVE',
          featured: true,
        },
        {
          id: 'default-lollypop',
          name: 'Chocolate Lollypop',
          slug: 'chocolate-lollypop',
          sku: 'THALF-LOL-50',
          price: 50,
          weight: '3 pcs',
          description: 'Handcrafted chocolate pops made with smooth milk chocolate and creamy white chocolate layers.',
          shortDescription: 'Milk chocolate & white chocolate pops (3 pcs)',
          ingredients: 'Milk chocolate, white chocolate',
          tastingNotes: ['Creamy White Chocolate', 'Smooth Milk Chocolate', 'Playful & Sweet'],
          storageInstructions: 'Store in a cool, dry place away from direct sunlight (18°C - 22°C).',
          shelfLife: '3 Months',
          images: [{ id: 'img-lol', url: '/images/choclates/lollypop.jpeg', alt: 'Chocolate Lollypop', isDefault: true }],
          status: 'ACTIVE',
          featured: true,
        },
        {
          id: 'default-kunafa',
          name: 'Kunafa Chocolate',
          slug: 'kunafa-chocolate',
          sku: 'THALF-KUN-70',
          price: 70,
          weight: '25g (Mini bites)',
          description: 'Crispy Middle-Eastern style kunafa pastry and pistachio butter wrapped in luscious milk chocolate. Shipping: ₹80 (Kerala) | ₹100 (Out of Kerala).',
          shortDescription: 'Milk chocolate, pistachio, kunafa & butter (Mini bites 25g)',
          ingredients: 'Milk chocolate, pistachio, kunafa, butter',
          tastingNotes: ['Crispy Kunafa Pastry', 'Pistachio Butter', 'Milk Chocolate'],
          storageInstructions: 'Store in a cool, dry place away from direct sunlight (18°C - 22°C).',
          shelfLife: '2 Months',
          images: [{ id: 'img-kun', url: '/images/choclates/kunafa-pistachio.jpeg', alt: 'Kunafa Chocolate', isDefault: true }],
          status: 'ACTIVE',
          featured: true,
        },
        {
          id: 'default-caramel',
          name: 'Caramel Nuts',
          slug: 'caramel-nuts',
          sku: 'THALF-CAR-80',
          price: 80,
          weight: '5 pcs',
          description: 'Decadent milk chocolate bites filled with buttery caramel, roasted cashews, and roasted almonds. Shipping: ₹80 (Kerala) | ₹100 (Out of Kerala).',
          shortDescription: 'Milk chocolate, roasted cashew, roasted almond & caramel (5 pcs)',
          ingredients: 'Milk chocolate, roasted cashew, roasted almond, caramel',
          tastingNotes: ['Golden Butter Caramel', 'Roasted Cashew', 'Roasted Almond', 'Milk Chocolate'],
          storageInstructions: 'Store in a cool, dry place away from direct sunlight (18°C - 22°C).',
          shelfLife: '3 Months',
          images: [{ id: 'img-car', url: '/images/choclates/caramel-chocolate.jpeg', alt: 'Caramel Nuts', isDefault: true }],
          status: 'ACTIVE',
          featured: true,
        },
      ];
      const match = DEFAULT_REAL_PRODUCTS.find((p) => p.slug === identifier || p.id === identifier);
      if (match) return match;
      throw new Error(`Product with identifier '${identifier}' not found`);
    }
    return product;
  }

  async createProduct(input: CreateProductInput, actorId?: string) {
    const validatedData = createProductSchema.parse(input);

    // 1. Check duplicate SKU
    const existingSku = await productRepository.findBySku(validatedData.sku);
    if (existingSku) {
      throw new Error(`Duplicate SKU error: Product SKU '${validatedData.sku}' already exists.`);
    }

    // 2. Check duplicate Slug
    const existingSlug = await productRepository.findBySlug(validatedData.slug);
    if (existingSlug) {
      throw new Error(`Duplicate slug error: Product slug '${validatedData.slug}' already exists.`);
    }

    // 3. Publishing validation if status is ACTIVE
    if (validatedData.status === 'ACTIVE') {
      ProductService.validatePublishingRequirements({
        name: validatedData.name,
        sku: validatedData.sku,
        price: validatedData.price,
        categoryId: validatedData.categoryId,
        images: validatedData.images,
        allowNoImages: true, // Allow product creation without Cloudinary images attached yet
      });
    }

    const newProduct = await productRepository.create(validatedData);

    if (actorId) {
      await auditService.log(prisma, {
        userId: actorId,
        action: 'CREATE_PRODUCT',
        entity: 'Product',
        entityId: newProduct.id,
        details: {
          name: newProduct.name,
          sku: newProduct.sku,
          price: Number(newProduct.price),
          status: newProduct.status,
        },
      });
    }

    return newProduct;
  }

  async updateProduct(id: string, input: UpdateProductInput, actorId?: string) {
    const validatedData = updateProductSchema.parse(input);

    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error(`Product with ID '${id}' not found.`);
    }

    // 1. Check duplicate SKU
    if (validatedData.sku && validatedData.sku !== existing.sku) {
      const duplicateSku = await productRepository.findBySku(validatedData.sku);
      if (duplicateSku && duplicateSku.id !== id) {
        throw new Error(`Duplicate SKU error: Product SKU '${validatedData.sku}' already exists.`);
      }
    }

    // 2. Check duplicate Slug
    if (validatedData.slug && validatedData.slug !== existing.slug) {
      const duplicateSlug = await productRepository.findBySlug(validatedData.slug);
      if (duplicateSlug && duplicateSlug.id !== id) {
        throw new Error(`Duplicate slug error: Product slug '${validatedData.slug}' already exists.`);
      }
    }

    // 3. Publishing validation if status is changing to ACTIVE
    const targetStatus = validatedData.status || existing.status;
    if (targetStatus === 'ACTIVE') {
      ProductService.validatePublishingRequirements({
        name: validatedData.name || existing.name,
        sku: validatedData.sku || existing.sku,
        price: validatedData.price !== undefined ? validatedData.price : Number(existing.price),
        categoryId: validatedData.categoryId || existing.categoryId,
        images: existing.images,
      });
    }

    const updatedProduct = await productRepository.update(id, validatedData);

    if (actorId) {
      await auditService.log(prisma, {
        userId: actorId,
        action: 'UPDATE_PRODUCT',
        entity: 'Product',
        entityId: id,
        details: {
          updatedFields: Object.keys(validatedData),
          status: updatedProduct.status,
        },
      });
    }

    return updatedProduct;
  }

  async deleteProduct(id: string, actorId?: string) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw new Error(`Product with ID '${id}' not found.`);
    }

    // Check if product has orders before deleting/archiving
    const hasOrders = await productRepository.hasAssociatedOrders(id);

    const archivedProduct = await productRepository.softDelete(id);

    if (actorId) {
      await auditService.log(prisma, {
        userId: actorId,
        action: 'ARCHIVE_PRODUCT',
        entity: 'Product',
        entityId: id,
        details: {
          name: existing.name,
          sku: existing.sku,
          hasAssociatedOrders: hasOrders,
        },
      });
    }

    return archivedProduct;
  }
}

export const productService = new ProductService();
