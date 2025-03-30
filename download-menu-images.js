const fs = require('fs');
const path = require('path');
const https = require('https');
const { v4: uuidv4 } = require('uuid');

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'images', 'menu');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
}

// Menu categories and their image URLs
const menuCategories = {
    appetizers: [
        'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800', // Samosa
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800', // Onion Bhaji
        'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800', // Chicken 65
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800'  // Paneer Pakora
    ],
    main_course: [
        'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800', // Butter Chicken
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800', // Paneer Tikka
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', // Chicken Biryani
        'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800'  // Dal Makhani
    ],
    desserts: [
        'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800', // Gulab Jamun
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800', // Rasmalai
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', // Kheer
        'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800'  // Ice Cream
    ],
    beverages: [
        'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800', // Mango Lassi
        'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=800', // Masala Chai
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', // Fresh Lime Soda
        'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800'  // Rose Lassi
    ],
    specials: [
        'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800', // Special Thali
        'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800', // Chef's Special
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800', // Festival Special
        'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800'  // Weekend Special
    ]
};

// Menu item descriptions
const menuDescriptions = {
    appetizers: [
        "Crispy pastry filled with spiced potatoes and peas, served with mint chutney",
        "Crispy onion fritters with Indian spices and herbs",
        "Spicy, crispy chicken pieces marinated in special spices",
        "Cottage cheese fritters with Indian spices and herbs"
    ],
    main_course: [
        "Tender chicken pieces in rich, creamy tomato sauce with Indian spices",
        "Grilled cottage cheese marinated in spiced yogurt",
        "Fragrant basmati rice cooked with tender chicken and aromatic spices",
        "Creamy black lentils slow-cooked with butter and spices"
    ],
    desserts: [
        "Sweet milk dumplings in sugar syrup, served warm",
        "Soft cottage cheese dumplings in sweet milk with cardamom",
        "Sweet rice pudding with nuts and cardamom",
        "Vanilla, chocolate, and mango flavors available"
    ],
    beverages: [
        "Sweet yogurt drink with fresh mango pulp",
        "Spiced Indian tea with milk and ginger",
        "Refreshing lime drink with mint and black salt",
        "Sweet yogurt drink with rose syrup and nuts"
    ],
    specials: [
        "Complete Indian meal with variety of dishes",
        "Chef's special creation with premium ingredients",
        "Special dishes prepared for festivals",
        "Exclusive weekend menu with unique combinations"
    ]
};

// Function to download image
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                response.resume();
                reject(new Error(`Request Failed With a Status Code: ${response.statusCode}`));
            }
        });
    });
}

// Function to sanitize filename
function sanitizeFilename(filename) {
    return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

// Main function to download all images
async function downloadAllImages() {
    const menuData = {
        categories: {},
        items: []
    };

    for (const [category, urls] of Object.entries(menuCategories)) {
        const categoryDir = path.join(imagesDir, category);
        if (!fs.existsSync(categoryDir)) {
            fs.mkdirSync(categoryDir, { recursive: true });
        }

        menuData.categories[category] = [];

        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const filename = `${category}_${i + 1}.jpg`;
            const filepath = path.join(categoryDir, filename);

            try {
                await downloadImage(url, filepath);
                menuData.categories[category].push({
                    id: uuidv4(),
                    name: `${category.charAt(0).toUpperCase() + category.slice(1)} Item ${i + 1}`,
                    description: menuDescriptions[category][i],
                    price: Math.floor(Math.random() * (50 - 10) + 10),
                    category: category,
                    image: `/images/menu/${category}/${filename}`,
                    available: true
                });
                console.log(`Downloaded: ${filename}`);
            } catch (error) {
                console.error(`Error downloading ${url}:`, error);
            }
        }
    }

    // Save menu data to JSON file
    fs.writeFileSync(path.join(__dirname, 'menu.json'), JSON.stringify(menuData, null, 2));
    console.log('Menu data saved to menu.json');
}

// Run the script
downloadAllImages().catch(console.error); 