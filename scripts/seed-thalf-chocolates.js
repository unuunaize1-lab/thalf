const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedRealProducts() {
  console.log('🍫 Seeding THALF Real Chocolate Products...');

  // Ensure default Category exists
  let category = await prisma.category.findFirst({
    where: { name: 'Artisanal Chocolates' },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'Artisanal Chocolates',
        slug: 'artisanal-chocolates',
        description: 'Handcrafted luxury chocolates made with pure cocoa and premium ingredients.',
      },
    });
    console.log('✅ Created category: Artisanal Chocolates');
  }

  const products = [
    {
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
      image: '/images/choclates/rock-chocolate.jpeg',
    },
    {
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
      image: '/images/choclates/dates-chocolate.jpeg',
    },
    {
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
      image: '/images/choclates/lollypop.jpeg',
    },
    {
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
      image: '/images/choclates/kunafa-pistachio.jpeg',
    },
    {
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
      image: '/images/choclates/caramel-chocolate.jpeg',
    },
  ];

  for (const item of products) {
    const existing = await prisma.product.findUnique({
      where: { slug: item.slug },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          sku: item.sku,
          price: item.price,
          weight: item.weight,
          description: item.description,
          shortDescription: item.shortDescription,
          ingredients: item.ingredients,
          tastingNotes: item.tastingNotes,
          storageInstructions: item.storageInstructions,
          shelfLife: item.shelfLife,
          status: 'ACTIVE',
          featured: true,
          categoryId: category.id,
        },
      });

      // Update image
      await prisma.productImage.deleteMany({
        where: { productId: existing.id },
      });
      await prisma.productImage.create({
        data: {
          productId: existing.id,
          url: item.image,
          alt: item.name,
          isDefault: true,
          order: 0,
        },
      });

      console.log(`✨ Updated product: ${item.name} (₹${item.price})`);
    } else {
      const newProd = await prisma.product.create({
        data: {
          name: item.name,
          slug: item.slug,
          sku: item.sku,
          price: item.price,
          weight: item.weight,
          description: item.description,
          shortDescription: item.shortDescription,
          ingredients: item.ingredients,
          tastingNotes: item.tastingNotes,
          storageInstructions: item.storageInstructions,
          shelfLife: item.shelfLife,
          status: 'ACTIVE',
          featured: true,
          categoryId: category.id,
          images: {
            create: [
              {
                url: item.image,
                alt: item.name,
                isDefault: true,
                order: 0,
              },
            ],
          },
          inventory: {
            create: {
              stockQuantity: 100,
              reservedStock: 0,
            },
          },
        },
      });
      console.log(`🎉 Created product: ${item.name} (₹${item.price})`);
    }
  }

  console.log('✅ All 5 THALF real products successfully seeded!');
}

seedRealProducts()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
