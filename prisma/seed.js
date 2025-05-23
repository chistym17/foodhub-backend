const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const restaurants = [
  {
    name: "Spice Garden",
    country: "INDIA",
    menuItems: [
      {
        name: "Butter Chicken",
        description: "Tender chicken in a rich, creamy tomato-based curry",
        price: 12.99
      },
      {
        name: "Biryani",
        description: "Fragrant basmati rice cooked with spices and vegetables",
        price: 10.99
      },
      {
        name: "Tandoori Roti",
        description: "Freshly baked whole wheat flatbread",
        price: 2.99
      },
      {
        name: "Paneer Butter Masala",
        description: "Cottage cheese cubes in a rich, creamy tomato gravy",
        price: 11.99
      },
      {
        name: "Chicken Tikka Masala",
        description: "Grilled chicken in a spiced curry sauce",
        price: 13.99
      },
      {
        name: "Vegetable Samosa",
        description: "Crispy pastry filled with spiced potatoes and peas",
        price: 4.99
      },
      {
        name: "Mango Lassi",
        description: "Sweet yogurt drink with fresh mango",
        price: 3.99
      },
      {
        name: "Gulab Jamun",
        description: "Sweet milk dumplings in rose-flavored syrup",
        price: 4.99
      }
    ]
  },
  {
    name: "Tandoori House",
    country: "INDIA",
    menuItems: [
      {
        name: "Tandoori Platter",
        description: "Assortment of grilled meats and vegetables",
        price: 24.99
      },
      {
        name: "Garlic Naan",
        description: "Buttery flatbread with garlic and herbs",
        price: 3.99
      },
      {
        name: "Lamb Rogan Josh",
        description: "Tender lamb in aromatic curry sauce",
        price: 15.99
      },
      {
        name: "Chicken Malai Tikka",
        description: "Creamy marinated chicken skewers",
        price: 12.99
      },
      {
        name: "Dal Makhani",
        description: "Creamy black lentils slow-cooked overnight",
        price: 8.99
      },
      {
        name: "Vegetable Biryani",
        description: "Fragrant rice with mixed vegetables and spices",
        price: 11.99
      },
      {
        name: "Raita",
        description: "Cooling yogurt with cucumber and mint",
        price: 3.99
      },
      {
        name: "Kheer",
        description: "Traditional rice pudding with nuts and saffron",
        price: 4.99
      }
    ]
  },
  {
    name: "Burger Palace",
    country: "AMERICA",
    menuItems: [
      {
        name: "Classic Cheeseburger",
        description: "Angus beef patty with cheese and special sauce",
        price: 8.99
      },
      {
        name: "Truffle Fries",
        description: "Crispy fries with truffle oil and parmesan",
        price: 5.99
      },
      {
        name: "Double Bacon Burger",
        description: "Two beef patties with crispy bacon and cheese",
        price: 12.99
      },
      {
        name: "Veggie Burger",
        description: "Plant-based patty with fresh vegetables",
        price: 9.99
      },
      {
        name: "Onion Rings",
        description: "Crispy beer-battered onion rings",
        price: 4.99
      },
      {
        name: "Chicken Wings",
        description: "Spicy buffalo wings with blue cheese dip",
        price: 10.99
      },
      {
        name: "Chocolate Milkshake",
        description: "Rich chocolate shake with whipped cream",
        price: 4.99
      },
      {
        name: "Apple Pie",
        description: "Warm apple pie with vanilla ice cream",
        price: 5.99
      }
    ]
  },
  {
    name: "Pizza Express",
    country: "AMERICA",
    menuItems: [
      {
        name: "Margherita Pizza",
        description: "Fresh tomatoes, mozzarella, and basil",
        price: 11.99
      },
      {
        name: "Pepperoni Pizza",
        description: "Classic pepperoni with extra cheese",
        price: 13.99
      },
      {
        name: "BBQ Chicken Pizza",
        description: "Grilled chicken with BBQ sauce and red onions",
        price: 14.99
      },
      {
        name: "Vegetarian Supreme",
        description: "Loaded with fresh vegetables and cheese",
        price: 13.99
      },
      {
        name: "Garlic Knots",
        description: "Freshly baked garlic bread knots",
        price: 4.99
      },
      {
        name: "Caesar Salad",
        description: "Fresh romaine with parmesan and croutons",
        price: 6.99
      },
      {
        name: "Tiramisu",
        description: "Classic Italian dessert with coffee and mascarpone",
        price: 5.99
      },
      {
        name: "Soda",
        description: "Choice of soft drinks",
        price: 2.99
      }
    ]
  },
  {
    name: "Royal Indian",
    country: "INDIA",
    menuItems: [
      {
        name: "Paneer Tikka",
        description: "Grilled cottage cheese with spices",
        price: 9.99
      },
      {
        name: "Dal Makhani",
        description: "Creamy black lentils",
        price: 7.99
      },
      {
        name: "Butter Naan",
        description: "Buttery flatbread from the tandoor",
        price: 3.99
      },
      {
        name: "Chicken Curry",
        description: "Traditional chicken curry with spices",
        price: 11.99
      },
      {
        name: "Vegetable Pulao",
        description: "Fragrant rice with mixed vegetables",
        price: 8.99
      },
      {
        name: "Papadum",
        description: "Crispy lentil wafers with chutney",
        price: 2.99
      },
      {
        name: "Masala Chai",
        description: "Spiced Indian tea with milk",
        price: 2.99
      },
      {
        name: "Rasmalai",
        description: "Sweet cheese dumplings in milk",
        price: 4.99
      }
    ]
  },
  {
    name: "BBQ House",
    country: "AMERICA",
    menuItems: [
      {
        name: "Ribs Platter",
        description: "Slow-cooked ribs with BBQ sauce",
        price: 22.99
      },
      {
        name: "Mac & Cheese",
        description: "Creamy macaroni with three cheeses",
        price: 6.99
      },
      {
        name: "Pulled Pork Sandwich",
        description: "Slow-cooked pork with coleslaw",
        price: 10.99
      },
      {
        name: "BBQ Chicken",
        description: "Half chicken with choice of sauce",
        price: 14.99
      },
      {
        name: "Cornbread",
        description: "Freshly baked sweet cornbread",
        price: 3.99
      },
      {
        name: "Baked Beans",
        description: "Sweet and smoky baked beans",
        price: 4.99
      },
      {
        name: "Key Lime Pie",
        description: "Tangy lime pie with graham cracker crust",
        price: 5.99
      },
      {
        name: "Sweet Tea",
        description: "Southern-style sweetened iced tea",
        price: 2.99
      }
    ]
  },
  {
    name: "Dosa Corner",
    country: "INDIA",
    menuItems: [
      {
        name: "Masala Dosa",
        description: "Crispy crepe with spiced potato filling",
        price: 8.99
      },
      {
        name: "Idli Sambar",
        description: "Steamed rice cakes with lentil soup",
        price: 6.99
      },
      {
        name: "Vada Sambar",
        description: "Crispy lentil donuts with sambar",
        price: 5.99
      },
      {
        name: "Uttapam",
        description: "Thick dosa with vegetables",
        price: 7.99
      },
      {
        name: "Filter Coffee",
        description: "Strong South Indian coffee",
        price: 2.99
      },
      {
        name: "Coconut Chutney",
        description: "Fresh coconut and mint chutney",
        price: 1.99
      },
      {
        name: "Sambar",
        description: "Spiced lentil and vegetable soup",
        price: 3.99
      },
      {
        name: "Payasam",
        description: "Sweet rice pudding with nuts",
        price: 4.99
      }
    ]
  },
  {
    name: "Steak House",
    country: "AMERICA",
    menuItems: [
      {
        name: "Ribeye Steak",
        description: "Premium cut with garlic butter",
        price: 29.99
      },
      {
        name: "Loaded Baked Potato",
        description: "With cheese, bacon, and sour cream",
        price: 5.99
      },
      {
        name: "Filet Mignon",
        description: "Tender beef tenderloin with wine sauce",
        price: 34.99
      },
      {
        name: "New York Strip",
        description: "Classic strip steak with herb butter",
        price: 27.99
      },
      {
        name: "Caesar Salad",
        description: "Fresh romaine with parmesan and croutons",
        price: 7.99
      },
      {
        name: "Mashed Potatoes",
        description: "Creamy mashed potatoes with gravy",
        price: 4.99
      },
      {
        name: "Chocolate Cake",
        description: "Rich chocolate layer cake",
        price: 6.99
      },
      {
        name: "House Wine",
        description: "Glass of house red or white wine",
        price: 7.99
      }
    ]
  },
  {
    name: "Curry Leaf",
    country: "INDIA",
    menuItems: [
      {
        name: "Chicken Curry",
        description: "Spicy chicken curry with rice",
        price: 11.99
      },
      {
        name: "Gulab Jamun",
        description: "Sweet milk dumplings in syrup",
        price: 4.99
      },
      {
        name: "Palak Paneer",
        description: "Cottage cheese in spinach gravy",
        price: 10.99
      },
      {
        name: "Jeera Rice",
        description: "Basmati rice with cumin seeds",
        price: 4.99
      },
      {
        name: "Chicken Tikka",
        description: "Grilled chicken with spices",
        price: 12.99
      },
      {
        name: "Naan Bread",
        description: "Freshly baked flatbread",
        price: 3.99
      },
      {
        name: "Mango Chutney",
        description: "Sweet and tangy mango relish",
        price: 2.99
      },
      {
        name: "Masala Chai",
        description: "Spiced Indian tea",
        price: 2.99
      }
    ]
  },
  {
    name: "Burger & Wings",
    country: "AMERICA",
    menuItems: [
      {
        name: "Buffalo Wings",
        description: "Spicy chicken wings with blue cheese dip",
        price: 12.99
      },
      {
        name: "Mushroom Swiss Burger",
        description: "With sautéed mushrooms and Swiss cheese",
        price: 10.99
      },
      {
        name: "Chicken Tenders",
        description: "Crispy chicken tenders with dipping sauce",
        price: 9.99
      },
      {
        name: "French Fries",
        description: "Crispy golden fries with seasoning",
        price: 3.99
      },
      {
        name: "Onion Rings",
        description: "Beer-battered onion rings",
        price: 4.99
      },
      {
        name: "Chocolate Milkshake",
        description: "Thick chocolate shake with whipped cream",
        price: 4.99
      },
      {
        name: "Chicken Sandwich",
        description: "Grilled chicken with lettuce and mayo",
        price: 8.99
      },
      {
        name: "Soft Serve Ice Cream",
        description: "Vanilla or chocolate soft serve",
        price: 3.99
      }
    ]
  }
];

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();

  // Insert restaurants first
  for (const restaurant of restaurants) {
    const { menuItems, ...restaurantData } = restaurant;
    
    // Create restaurant first
    const createdRestaurant = await prisma.restaurant.create({
      data: restaurantData
    });

    console.log(`✅ Created restaurant: ${createdRestaurant.name}`);

    // Then create menu items for this restaurant
    for (const menuItem of menuItems) {
      await prisma.menuItem.create({
        data: {
          ...menuItem,
          restaurantId: createdRestaurant.id
        }
      });
      console.log(`  - Added menu item: ${menuItem.name}`);
    }
  }

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 