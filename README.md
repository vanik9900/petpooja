# Smart Kitchen Website

A modern, responsive website for a smart kitchen company featuring a beautiful UI and full backend functionality.

## Features

- Responsive design that works on all devices
- Dynamic product showcase
- Contact form with email notifications
- Smooth animations and transitions
- Mobile-friendly navigation
- Modern UI with hover effects
- Backend API with MongoDB integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-kitchen-website
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/smart-kitchen
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
ADMIN_EMAIL=admin@smartkitchen.com
PORT=5000
```

4. Create the uploads directory:
```bash
mkdir -p public/uploads
```

## Running the Application

1. Start the backend server:
```bash
npm run dev
```

2. Open `index.html` in your web browser or serve it using a local server.

## Project Structure

```
smart-kitchen-website/
├── public/
│   └── uploads/         # Product images
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # Frontend JavaScript
├── server.js           # Backend server
├── package.json        # Project dependencies
└── .env               # Environment variables
```

## API Endpoints

- `GET /api/products` - Get all products
- `POST /api/products` - Add a new product
- `POST /api/contact` - Submit contact form

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 