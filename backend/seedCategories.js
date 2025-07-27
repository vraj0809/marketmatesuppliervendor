const mongoose = require('mongoose');
const Category = require('./models/Category');

const categories = [
  { name: 'Electronics' },
  { name: 'Clothing' },
  { name: 'Home & Kitchen' },
  { name: 'Books' },
  { name: 'Sports' },
  { name: 'Toys' },
];

async function seedCategories() {
  try {
    await mongoose.connect('mongodb+srv://notreal6655:8MVs0wvX3yTcwzwS@cluster0.dahtmsu.mongodb.net/market-mate?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    for (const category of categories) {
      const exists = await Category.findOne({ name: category.name });
      if (!exists) {
        await Category.create(category);
        console.log(`Category created: ${category.name}`);
      } else {
        console.log(`Category already exists: ${category.name}`);
      }
    }

    console.log('Category seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
