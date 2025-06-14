// HealthVorsv Database Seeder - v2
// Run this script once to populate the 'foods' table with a comprehensive list of Indian foods.
// Usage: node seed.js

const sqlite3 = require('sqlite3').verbose();
const DB_FILE = 'evolvefit.db';

// A comprehensive list of Indian foods with approximate nutritional values.
const initialFoodData = [
    // Breads
    { name: 'Roti / Chapati', category: 'Breads', caloriesPer100g: 297, proteinG: 11, carbsG: 56, fatsG: 4, servingType: 'piece', typicalWeight: 35 },
    { name: 'Naan (Plain)', category: 'Breads', caloriesPer100g: 315, proteinG: 9, carbsG: 50, fatsG: 9, servingType: 'piece', typicalWeight: 90 },
    { name: 'Butter Naan', category: 'Breads', caloriesPer100g: 360, proteinG: 10, carbsG: 52, fatsG: 13, servingType: 'piece', typicalWeight: 95 },
    { name: 'Garlic Naan', category: 'Breads', caloriesPer100g: 380, proteinG: 10, carbsG: 55, fatsG: 14, servingType: 'piece', typicalWeight: 100 },
    { name: 'Tandoori Roti', category: 'Breads', caloriesPer100g: 300, proteinG: 12, carbsG: 58, fatsG: 2, servingType: 'piece', typicalWeight: 40 },
    { name: 'Rumali Roti', category: 'Breads', caloriesPer100g: 280, proteinG: 9, carbsG: 60, fatsG: 1, servingType: 'piece', typicalWeight: 50 },
    { name: 'Paratha (Plain)', category: 'Breads', caloriesPer100g: 330, proteinG: 7, carbsG: 45, fatsG: 14, servingType: 'piece', typicalWeight: 60 },
    { name: 'Aloo Paratha', category: 'Breads', caloriesPer100g: 250, proteinG: 6, carbsG: 36, fatsG: 9, servingType: 'piece', typicalWeight: 120 },
    { name: 'Gobi Paratha', category: 'Breads', caloriesPer100g: 220, proteinG: 7, carbsG: 32, fatsG: 8, servingType: 'piece', typicalWeight: 120 },
    { name: 'Mooli Paratha', category: 'Breads', caloriesPer100g: 200, proteinG: 6, carbsG: 28, fatsG: 7, servingType: 'piece', typicalWeight: 120 },
    { name: 'Lachha Paratha', category: 'Breads', caloriesPer100g: 350, proteinG: 7, carbsG: 42, fatsG: 18, servingType: 'piece', typicalWeight: 70 },
    { name: 'Puri', category: 'Breads', caloriesPer100g: 350, proteinG: 6, carbsG: 40, fatsG: 19, servingType: 'piece', typicalWeight: 25 },
    { name: 'Bhatura', category: 'Breads', caloriesPer100g: 340, proteinG: 8, carbsG: 50, fatsG: 12, servingType: 'piece', typicalWeight: 80 },
    { name: 'Thepla', category: 'Breads', caloriesPer100g: 320, proteinG: 9, carbsG: 40, fatsG: 14, servingType: 'piece', typicalWeight: 45 },
    { name: 'Makki di Roti', category: 'Breads', caloriesPer100g: 350, proteinG: 8, carbsG: 65, fatsG: 7, servingType: 'piece', typicalWeight: 70 },
    { name: 'Missi Roti', category: 'Breads', caloriesPer100g: 310, proteinG: 13, carbsG: 50, fatsG: 6, servingType: 'piece', typicalWeight: 60 },

    // Rice Dishes
    { name: 'Plain Rice (Cooked)', category: 'Rice', caloriesPer100g: 130, proteinG: 2.7, carbsG: 28, fatsG: 0.3, servingType: 'gram' },
    { name: 'Brown Rice (Cooked)', category: 'Rice', caloriesPer100g: 111, proteinG: 2.6, carbsG: 23, fatsG: 0.9, servingType: 'gram' },
    { name: 'Jeera Rice', category: 'Rice', caloriesPer100g: 160, proteinG: 3, carbsG: 30, fatsG: 3, servingType: 'gram' },
    { name: 'Ghee Rice', category: 'Rice', caloriesPer100g: 190, proteinG: 3, carbsG: 28, fatsG: 8, servingType: 'gram' },
    { name: 'Vegetable Pulao', category: 'Rice', caloriesPer100g: 150, proteinG: 4, carbsG: 26, fatsG: 3, servingType: 'gram' },
    { name: 'Vegetable Biryani', category: 'Rice', caloriesPer100g: 180, proteinG: 5, carbsG: 25, fatsG: 7, servingType: 'gram' },
    { name: 'Hyderabadi Veg Biryani', category: 'Rice', caloriesPer100g: 200, proteinG: 6, carbsG: 28, fatsG: 8, servingType: 'gram' },
    { name: 'Chicken Biryani', category: 'Rice', caloriesPer100g: 220, proteinG: 15, carbsG: 22, fatsG: 8, servingType: 'gram' },
    { name: 'Mutton Biryani', category: 'Rice', caloriesPer100g: 250, proteinG: 16, carbsG: 24, fatsG: 10, servingType: 'gram' },
    { name: 'Egg Biryani', category: 'Rice', caloriesPer100g: 195, proteinG: 10, carbsG: 23, fatsG: 7, servingType: 'gram' },
    { name: 'Lemon Rice', category: 'Rice', caloriesPer100g: 170, proteinG: 3, carbsG: 32, fatsG: 4, servingType: 'gram' },
    { name: 'Curd Rice', category: 'Rice', caloriesPer100g: 140, proteinG: 4, carbsG: 22, fatsG: 4, servingType: 'gram' },
    { name: 'Tamarind Rice (Pulihora)', category: 'Rice', caloriesPer100g: 190, proteinG: 3, carbsG: 35, fatsG: 5, servingType: 'gram' },
    { name: 'Bisi Bele Bath', category: 'Rice', caloriesPer100g: 165, proteinG: 6, carbsG: 25, fatsG: 4, servingType: 'gram' },
    { name: 'Coconut Rice', category: 'Rice', caloriesPer100g: 200, proteinG: 3, carbsG: 30, fatsG: 8, servingType: 'gram' },
    { name: 'Khichdi', category: 'Rice', caloriesPer100g: 120, proteinG: 5, carbsG: 20, fatsG: 2, servingType: 'gram' },
    
    // Lentils (Dal)
    { name: 'Dal Tadka (Toor Dal)', category: 'Lentils', caloriesPer100g: 115, proteinG: 7, carbsG: 18, fatsG: 2, servingType: 'gram' },
    { name: 'Dal Fry', category: 'Lentils', caloriesPer100g: 130, proteinG: 8, carbsG: 19, fatsG: 3, servingType: 'gram' },
    { name: 'Dal Makhani', category: 'Lentils', caloriesPer100g: 160, proteinG: 9, carbsG: 17, fatsG: 6, servingType: 'gram' },
    { name: 'Chana Masala (Chickpeas)', category: 'Lentils', caloriesPer100g: 140, proteinG: 8, carbsG: 20, fatsG: 3, servingType: 'gram' },
    { name: 'Rajma Masala (Kidney Beans)', category: 'Lentils', caloriesPer100g: 135, proteinG: 8, carbsG: 22, fatsG: 2, servingType: 'gram' },
    { name: 'Sambar', category: 'Lentils', caloriesPer100g: 90, proteinG: 4, carbsG: 15, fatsG: 1.5, servingType: 'gram' },
    { name: 'Moong Dal', category: 'Lentils', caloriesPer100g: 105, proteinG: 7, carbsG: 18, fatsG: 0.5, servingType: 'gram' },
    { name: 'Masoor Dal', category: 'Lentils', caloriesPer100g: 110, proteinG: 9, carbsG: 19, fatsG: 0.4, servingType: 'gram' },
    { name: 'Lobia Masala (Black Eyed Peas)', category: 'Lentils', caloriesPer100g: 128, proteinG: 8, carbsG: 21, fatsG: 1, servingType: 'gram' },
    
    // Vegetarian Curries
    { name: 'Paneer Butter Masala', category: 'Vegetarian', caloriesPer100g: 180, proteinG: 10, carbsG: 8, fatsG: 12, servingType: 'gram' },
    { name: 'Palak Paneer', category: 'Vegetarian', caloriesPer100g: 150, proteinG: 12, carbsG: 6, fatsG: 9, servingType: 'gram' },
    { name: 'Shahi Paneer', category: 'Vegetarian', caloriesPer100g: 200, proteinG: 11, carbsG: 9, fatsG: 14, servingType: 'gram' },
    { name: 'Kadai Paneer', category: 'Vegetarian', caloriesPer100g: 170, proteinG: 12, carbsG: 7, fatsG: 11, servingType: 'gram' },
    { name: 'Mutter Paneer', category: 'Vegetarian', caloriesPer100g: 160, proteinG: 10, carbsG: 10, fatsG: 9, servingType: 'gram' },
    { name: 'Paneer Bhurji', category: 'Vegetarian', caloriesPer100g: 250, proteinG: 18, carbsG: 5, fatsG: 18, servingType: 'gram' },
    { name: 'Malai Kofta', category: 'Vegetarian', caloriesPer100g: 220, proteinG: 7, carbsG: 12, fatsG: 16, servingType: 'gram' },
    { name: 'Aloo Gobi', category: 'Vegetarian', caloriesPer100g: 98, proteinG: 3, carbsG: 12, fatsG: 4, servingType: 'gram' },
    { name: 'Aloo Matar', category: 'Vegetarian', caloriesPer100g: 110, proteinG: 4, carbsG: 15, fatsG: 4, servingType: 'gram' },
    { name: 'Dum Aloo', category: 'Vegetarian', caloriesPer100g: 140, proteinG: 3, carbsG: 18, fatsG: 6, servingType: 'gram' },
    { name: 'Baingan Bharta', category: 'Vegetarian', caloriesPer100g: 80, proteinG: 2, carbsG: 10, fatsG: 4, servingType: 'gram' },
    { name: 'Bhindi Masala (Okra)', category: 'Vegetarian', caloriesPer100g: 110, proteinG: 2, carbsG: 9, fatsG: 7, servingType: 'gram' },
    { name: 'Mixed Vegetable Korma', category: 'Vegetarian', caloriesPer100g: 140, proteinG: 4, carbsG: 10, fatsG: 9, servingType: 'gram' },
    { name: 'Veg Kolhapuri', category: 'Vegetarian', caloriesPer100g: 155, proteinG: 5, carbsG: 12, fatsG: 9, servingType: 'gram' },
    { name: 'Sarson ka Saag', category: 'Vegetarian', caloriesPer100g: 130, proteinG: 6, carbsG: 10, fatsG: 8, servingType: 'gram' },
    { name: 'Avial', category: 'Vegetarian', caloriesPer100g: 120, proteinG: 3, carbsG: 10, fatsG: 7, servingType: 'gram' },
    
    // Non-Vegetarian Curries
    { name: 'Butter Chicken (Murgh Makhani)', category: 'Non-Vegetarian', caloriesPer100g: 240, proteinG: 18, carbsG: 5, fatsG: 16, servingType: 'gram' },
    { name: 'Chicken Tikka Masala', category: 'Non-Vegetarian', caloriesPer100g: 200, proteinG: 20, carbsG: 6, fatsG: 11, servingType: 'gram' },
    { name: 'Chicken Curry (Home style)', category: 'Non-Vegetarian', caloriesPer100g: 190, proteinG: 20, carbsG: 4, fatsG: 10, servingType: 'gram' },
    { name: 'Kadai Chicken', category: 'Non-Vegetarian', caloriesPer100g: 210, proteinG: 22, carbsG: 3, fatsG: 12, servingType: 'gram' },
    { name: 'Chicken Chettinad', category: 'Non-Vegetarian', caloriesPer100g: 230, proteinG: 24, carbsG: 5, fatsG: 13, servingType: 'gram' },
    { name: 'Chilli Chicken (Gravy)', category: 'Non-Vegetarian', caloriesPer100g: 180, proteinG: 16, carbsG: 10, fatsG: 8, servingType: 'gram' },
    { name: 'Mutton Rogan Josh', category: 'Non-Vegetarian', caloriesPer100g: 230, proteinG: 18, carbsG: 4, fatsG: 16, servingType: 'gram' },
    { name: 'Mutton Korma', category: 'Non-Vegetarian', caloriesPer100g: 260, proteinG: 20, carbsG: 5, fatsG: 18, servingType: 'gram' },
    { name: 'Keema Matar', category: 'Non-Vegetarian', caloriesPer100g: 200, proteinG: 15, carbsG: 8, fatsG: 12, servingType: 'gram' },
    { name: 'Goan Fish Curry', category: 'Non-Vegetarian', caloriesPer100g: 180, proteinG: 18, carbsG: 3, fatsG: 11, servingType: 'gram' },
    { name: 'Prawn Masala', category: 'Non-Vegetarian', caloriesPer100g: 170, proteinG: 20, carbsG: 5, fatsG: 8, servingType: 'gram' },
    { name: 'Egg Curry', category: 'Non-Vegetarian', caloriesPer100g: 160, proteinG: 12, carbsG: 5, fatsG: 10, servingType: 'gram' },
    { name: 'Egg Bhurji', category: 'Non-Vegetarian', caloriesPer100g: 200, proteinG: 14, carbsG: 3, fatsG: 15, servingType: 'gram' },
    
    // Dry/Grilled Non-Veg
    { name: 'Tandoori Chicken', category: 'Non-Vegetarian', caloriesPer100g: 220, proteinG: 28, carbsG: 2, fatsG: 11, servingType: 'gram' },
    { name: 'Chicken 65', category: 'Non-Vegetarian', caloriesPer100g: 280, proteinG: 25, carbsG: 10, fatsG: 15, servingType: 'gram' },
    { name: 'Fish Fry', category: 'Non-Vegetarian', caloriesPer100g: 250, proteinG: 22, carbsG: 8, fatsG: 14, servingType: 'gram' },
    { name: 'Chicken Kebab', category: 'Non-Vegetarian', caloriesPer100g: 180, proteinG: 25, carbsG: 3, fatsG: 8, servingType: 'gram' },
    { name: 'Boiled Egg', category: 'Non-Vegetarian', caloriesPer100g: 155, proteinG: 13, carbsG: 1.1, fatsG: 11, servingType: 'piece', typicalWeight: 50 },
    { name: 'Omelette (2 eggs)', category: 'Non-Vegetarian', caloriesPer100g: 190, proteinG: 14, carbsG: 2, fatsG: 14, servingType: 'piece', typicalWeight: 120 },

    // South Indian
    { name: 'Idli', category: 'South Indian', caloriesPer100g: 132, proteinG: 4, carbsG: 28, fatsG: 0.5, servingType: 'piece', typicalWeight: 50 },
    { name: 'Dosa (Plain)', category: 'South Indian', caloriesPer100g: 168, proteinG: 4, carbsG: 35, fatsG: 1.5, servingType: 'piece', typicalWeight: 80 },
    { name: 'Masala Dosa', category: 'South Indian', caloriesPer100g: 180, proteinG: 4, carbsG: 29, fatsG: 5, servingType: 'piece', typicalWeight: 150 },
    { name: 'Rava Dosa', category: 'South Indian', caloriesPer100g: 200, proteinG: 5, carbsG: 38, fatsG: 3, servingType: 'piece', typicalWeight: 70 },
    { name: 'Pesarattu', category: 'South Indian', caloriesPer100g: 150, proteinG: 9, carbsG: 25, fatsG: 2, servingType: 'piece', typicalWeight: 90 },
    { name: 'Uttapam (Onion)', category: 'South Indian', caloriesPer100g: 150, proteinG: 5, carbsG: 25, fatsG: 3, servingType: 'piece', typicalWeight: 120 },
    { name: 'Vada (Medu Vada)', category: 'Snacks', caloriesPer100g: 334, proteinG: 10, carbsG: 40, fatsG: 15, servingType: 'piece', typicalWeight: 70 },
    { name: 'Pongal (Ven Pongal)', category: 'South Indian', caloriesPer100g: 140, proteinG: 5, carbsG: 20, fatsG: 4, servingType: 'gram' },
    { name: 'Appam', category: 'South Indian', caloriesPer100g: 120, proteinG: 3, carbsG: 25, fatsG: 1, servingType: 'piece', typicalWeight: 60 },
    { name: 'Puttu', category: 'South Indian', caloriesPer100g: 145, proteinG: 3, carbsG: 32, fatsG: 1, servingType: 'gram' },
    { name: 'Idiyappam', category: 'South Indian', caloriesPer100g: 110, proteinG: 2, carbsG: 25, fatsG: 0.2, servingType: 'gram' },
    
    // Snacks
    { name: 'Samosa (Vegetable)', category: 'Snacks', caloriesPer100g: 262, proteinG: 5, carbsG: 30, fatsG: 14, servingType: 'piece', typicalWeight: 60 },
    { name: 'Onion Pakora / Bhaji', category: 'Snacks', caloriesPer100g: 350, proteinG: 6, carbsG: 35, fatsG: 20, servingType: 'gram' },
    { name: 'Paneer Pakora', category: 'Snacks', caloriesPer100g: 300, proteinG: 12, carbsG: 20, fatsG: 19, servingType: 'gram' },
    { name: 'Dhokla', category: 'Snacks', caloriesPer100g: 160, proteinG: 8, carbsG: 25, fatsG: 3, servingType: 'gram' },
    { name: 'Khandvi', category: 'Snacks', caloriesPer100g: 190, proteinG: 7, carbsG: 22, fatsG: 8, servingType: 'gram' },
    { name: 'Kachori', category: 'Snacks', caloriesPer100g: 320, proteinG: 6, carbsG: 40, fatsG: 15, servingType: 'piece', typicalWeight: 50 },
    { name: 'Bhel Puri', category: 'Snacks', caloriesPer100g: 180, proteinG: 4, carbsG: 35, fatsG: 3, servingType: 'gram' },
    { name: 'Sev Puri', category: 'Snacks', caloriesPer100g: 220, proteinG: 5, carbsG: 30, fatsG: 9, servingType: 'gram' },
    { name: 'Pani Puri / Golgappa', category: 'Snacks', caloriesPer100g: 270, proteinG: 6, carbsG: 50, fatsG: 5, servingType: 'piece', typicalWeight: 15 },
    { name: 'Aloo Tikki', category: 'Snacks', caloriesPer100g: 190, proteinG: 4, carbsG: 30, fatsG: 6, servingType: 'piece', typicalWeight: 70 },
    { name: 'Vada Pav', category: 'Snacks', caloriesPer100g: 290, proteinG: 7, carbsG: 45, fatsG: 9, servingType: 'piece', typicalWeight: 130 },
    { name: 'Dabeli', category: 'Snacks', caloriesPer100g: 250, proteinG: 5, carbsG: 40, fatsG: 8, servingType: 'piece', typicalWeight: 120 },
    
    // Desserts
    { name: 'Gulab Jamun', category: 'Dessert', caloriesPer100g: 380, proteinG: 4, carbsG: 55, fatsG: 16, servingType: 'piece', typicalWeight: 40 },
    { name: 'Rasgulla', category: 'Dessert', caloriesPer100g: 186, proteinG: 6, carbsG: 40, fatsG: 0.2, servingType: 'piece', typicalWeight: 30 },
    { name: 'Jalebi', category: 'Dessert', caloriesPer100g: 450, proteinG: 3, carbsG: 70, fatsG: 18, servingType: 'gram' },
    { name: 'Kheer (Rice Payasam)', category: 'Dessert', caloriesPer100g: 130, proteinG: 4, carbsG: 22, fatsG: 3, servingType: 'gram' },
    { name: 'Gajar ka Halwa (Carrot)', category: 'Dessert', caloriesPer100g: 190, proteinG: 3, carbsG: 25, fatsG: 9, servingType: 'gram' },
    { name: 'Sooji Halwa', category: 'Dessert', caloriesPer100g: 250, proteinG: 4, carbsG: 40, fatsG: 8, servingType: 'gram' },
    { name: 'Rasmalai', category: 'Dessert', caloriesPer100g: 250, proteinG: 9, carbsG: 30, fatsG: 10, servingType: 'piece', typicalWeight: 50 },
    { name: 'Ladoo (Besan)', category: 'Dessert', caloriesPer100g: 430, proteinG: 8, carbsG: 55, fatsG: 20, servingType: 'piece', typicalWeight: 30 },
    { name: 'Barfi (Kaju Katli)', category: 'Dessert', caloriesPer100g: 500, proteinG: 10, carbsG: 50, fatsG: 28, servingType: 'piece', typicalWeight: 15 },
    { name: 'Mysore Pak', category: 'Dessert', caloriesPer100g: 450, proteinG: 4, carbsG: 60, fatsG: 22, servingType: 'piece', typicalWeight: 40 },
    { name: 'Shrikhand', category: 'Dessert', caloriesPer100g: 180, proteinG: 5, carbsG: 25, fatsG: 7, servingType: 'gram' },
    { name: 'Phirni', category: 'Dessert', caloriesPer100g: 140, proteinG: 3, carbsG: 25, fatsG: 3, servingType: 'gram' },
    { name: 'Kulfi', category: 'Dessert', caloriesPer100g: 200, proteinG: 6, carbsG: 25, fatsG: 9, servingType: 'gram' },
    
    // Condiments & Miscellaneous
    { name: 'Mixed Vegetable Salad', category: 'Sides', caloriesPer100g: 45, proteinG: 2, carbsG: 8, fatsG: 0.5, servingType: 'gram' },
    { name: 'Raita (Cucumber)', category: 'Sides', caloriesPer100g: 60, proteinG: 3, carbsG: 5, fatsG: 3, servingType: 'gram' },
    { name: 'Mint Chutney', category: 'Sides', caloriesPer100g: 30, proteinG: 1, carbsG: 6, fatsG: 0.2, servingType: 'gram' },
    { name: 'Tamarind Chutney', category: 'Sides', caloriesPer100g: 100, proteinG: 0.5, carbsG: 25, fatsG: 0.1, servingType: 'gram' },
    { name: 'Mixed Pickle', category: 'Sides', caloriesPer100g: 150, proteinG: 1, carbsG: 5, fatsG: 14, servingType: 'gram' },
    { name: 'Papad (Roasted)', category: 'Sides', caloriesPer100g: 380, proteinG: 22, carbsG: 60, fatsG: 1, servingType: 'piece', typicalWeight: 12 },
    { name: 'Papad (Fried)', category: 'Sides', caloriesPer100g: 500, proteinG: 22, carbsG: 58, fatsG: 22, servingType: 'piece', typicalWeight: 15 },
    
    // Beverages
    { name: 'Lassi (Sweet)', category: 'Beverages', caloriesPer100g: 110, proteinG: 4, carbsG: 15, fatsG: 4, servingType: 'gram' },
    { name: 'Mango Lassi', category: 'Beverages', caloriesPer100g: 130, proteinG: 4, carbsG: 20, fatsG: 4, servingType: 'gram' },
    { name: 'Masala Chai', category: 'Beverages', caloriesPer100g: 40, proteinG: 1, carbsG: 6, fatsG: 1.5, servingType: 'gram' },
    { name: 'Filter Coffee', category: 'Beverages', caloriesPer100g: 50, proteinG: 1, carbsG: 8, fatsG: 1.5, servingType: 'gram' },
    { name: 'Jaljeera', category: 'Beverages', caloriesPer100g: 20, proteinG: 0.5, carbsG: 5, fatsG: 0, servingType: 'gram' },
];


const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        return console.error("Error opening database", err.message);
    }
    console.log('Connected to the SQLite database for seeding.');
});

db.serialize(() => {
    const stmt = db.prepare(`INSERT INTO foods (name, category, unit, calories, proteinG, carbsG, fatsG) VALUES (?, ?, ?, ?, ?, ?, ?)`);

    // Use a transaction for bulk inserts for better performance
    db.run("BEGIN TRANSACTION");
    let insertedCount = 0;
    initialFoodData.forEach(food => {
        // Construct the 'unit' string based on servingType
        const unit = food.servingType === 'piece' 
            ? `1 piece (${food.typicalWeight}g)` 
            : '100g';

        // Run the insert statement
        stmt.run(food.name, food.category, unit, food.caloriesPer100g, food.proteinG, food.carbsG, food.fatsG, function(err) {
            // We check for error code 19 (SQLITE_CONSTRAINT) which means the food item (due to UNIQUE constraint) already exists.
            // This makes the script safe to run multiple times without causing errors.
            if (err && err.errno !== 19) { 
                console.error('Error inserting food:', food.name, err.message);
            } else if (!err) {
                insertedCount++;
            }
        });
    });
    db.run("COMMIT");

    stmt.finalize((err) => {
        if (err) {
            console.error("Error finalizing statement:", err.message);
        }
        console.log(`Seeding complete. Inserted ${insertedCount} new food items.`);
    });
});

db.close((err) => {
    if (err) {
        return console.error("Error closing database:", err.message);
    }
    console.log('Closed the database connection.');
});
