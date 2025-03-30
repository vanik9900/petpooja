const https = require('https');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Menu data with image URLs and AI-generated descriptions
const menuData = {
    "main-course": [
        {
            name: "AI-Enhanced Butter Chicken",
            description: "Our signature dish featuring tender chicken marinated in a blend of aromatic spices and simmered in a rich, creamy tomato sauce. Enhanced with AI-optimized spice ratios for perfect balance.",
            price: "₹450",
            category: "main-course",
            image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        },
        {
            name: "Smart Paneer Tikka",
            description: "Cubes of fresh paneer marinated in a yogurt-based spice blend, cooked in a tandoor. AI-monitored temperature ensures perfect char and tenderness.",
            price: "₹380",
            category: "main-course",
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        },
        {
            name: "Data-Driven Chicken Biryani",
            description: "Fragrant basmati rice cooked with tender chicken pieces, infused with aromatic spices. AI-analyzed customer preferences ensure perfect spice levels.",
            price: "₹420",
            category: "main-course",
            image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        },
        {
            name: "Algorithmic Dal Makhani",
            description: "Creamy black lentils slow-cooked overnight with butter and cream. AI-controlled simmering ensures perfect consistency and flavor development.",
            price: "₹350",
            category: "main-course",
            image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        },
        {
            name: "Neural Network Naan",
            description: "Freshly baked Indian bread with a perfect balance of crisp and soft textures. AI-monitored baking ensures consistent quality.",
            price: "₹80",
            category: "main-course",
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        }
    ],
    "starters": [
        {
            name: "AI-Optimized Samosa",
            description: "Crispy pastry filled with spiced potatoes and peas. AI-analyzed customer feedback ensures the perfect crunch-to-filling ratio.",
            price: "₹120",
            category: "starters",
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        },
        {
            name: "Smart Onion Bhaji",
            description: "Crispy onion fritters with a perfect blend of spices. AI-controlled frying ensures consistent golden color and crunch.",
            price: "₹100",
            category: "starters",
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        },
        {
            name: "Data-Driven Chicken Wings",
            description: "Tender chicken wings marinated in a special blend of spices. AI-optimized marination time ensures maximum flavor absorption.",
            price: "₹280",
            category: "starters",
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        }
    ],
    "desserts": [
        {
            name: "AI-Enhanced Gulab Jamun",
            description: "Soft, melt-in-mouth milk dumplings in sugar syrup. AI-controlled temperature ensures perfect texture and sweetness.",
            price: "₹150",
            category: "desserts",
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        },
        {
            name: "Smart Rasmalai",
            description: "Cottage cheese dumplings soaked in sweetened milk. AI-monitored soaking time ensures perfect softness and flavor absorption.",
            price: "₹160",
            category: "desserts",
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        },
        {
            name: "Neural Network Ice Cream",
            description: "AI-crafted ice cream with perfect balance of creaminess and sweetness. Custom flavors based on customer preferences.",
            price: "₹180",
            category: "desserts",
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        }
    ],
    "beverages": [
        {
            name: "AI-Optimized Mango Lassi",
            description: "Smooth yogurt drink with fresh mango pulp. AI-controlled blending ensures perfect consistency and sweetness.",
            price: "₹120",
            category: "beverages",
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        },
        {
            name: "Smart Masala Chai",
            description: "Traditional Indian tea with a perfect blend of spices. AI-analyzed brewing time ensures optimal flavor extraction.",
            price: "₹80",
            category: "beverages",
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        },
        {
            name: "Data-Driven Fresh Juice",
            description: "AI-selected combination of seasonal fruits for maximum nutritional value and taste. Perfect blend of sweetness and freshness.",
            price: "₹150",
            category: "beverages",
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        }
    ],
    "specials": [
        {
            name: "AI Chef's Special Thali",
            description: "A curated selection of our best dishes, personalized based on AI analysis of your preferences. Includes rice, dal, curry, and dessert.",
            price: "₹550",
            category: "specials",
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        },
        {
            name: "Smart Family Platter",
            description: "Perfectly portioned platter for 4, featuring AI-selected combination of crowd favorites. Includes variety of starters, main course, and desserts.",
            price: "₹1200",
            category: "specials",
            image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        }
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
function sanitizeFilename(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

// Main function to download all images
async function downloadAllImages() {
    const imagesDir = path.join(__dirname, 'images', 'menu');
    
    // Ensure the directory exists
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Create a menu.json file with all the data
    const menuJsonPath = path.join(__dirname, 'menu.json');
    fs.writeFileSync(menuJsonPath, JSON.stringify(menuData, null, 2));

    for (const [category, items] of Object.entries(menuData)) {
        for (const item of items) {
            try {
                const sanitizedName = sanitizeFilename(item.name);
                const fileExt = '.jpg';
                const fileName = `${sanitizedName}-${uuidv4()}${fileExt}`;
                const filePath = path.join(imagesDir, fileName);

                console.log(`Downloading ${item.name}...`);
                await downloadImage(item.image, filePath);
                console.log(`Successfully downloaded ${item.name}`);
            } catch (error) {
                console.error(`Error downloading ${item.name}:`, error.message);
            }
        }
    }
}

// Run the download function
downloadAllImages().then(() => {
    console.log('All images downloaded successfully!');
}).catch(error => {
    console.error('Error downloading images:', error);
}); 