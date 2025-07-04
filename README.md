# ImanPrime Backend API

A comprehensive Node.js backend API for ImanPrime real estate and design company, featuring authentication, property management, blog system, agent management, company information, and quote request handling.

## Features

### Core Functionality
- **Authentication System**: JWT-based admin authentication with secure password hashing
- **Property Management**: Full CRUD operations with image uploads and advanced filtering
- **Blog Management**: Publishing workflow with engagement features
- **Agent Management**: Detailed agent profiles with property assignments
- **Company Information**: Complete company profile with team, partners, and contact details
- **Quote Request System**: Interior & exterior design quote request handling

### Technical Features
- **Cloudinary Integration**: Image uploads and management
- **Database**: MongoDB with Mongoose ODM
- **Security**: Rate limiting, CORS, helmet protection
- **Validation**: Comprehensive input validation using express-validator
- **File Uploads**: Multi-file upload handling with image optimization
- **Pagination**: Built-in pagination for all list endpoints
- **Search**: Full-text search capabilities across models

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register admin user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Properties
- `GET /api/properties` - Get all properties (with filtering)
- `GET /api/properties/landing` - Get properties for landing page
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create property (Admin)
- `PUT /api/properties/:id` - Update property (Admin)
- `DELETE /api/properties/:id` - Delete property (Admin)

### Agents
- `GET /api/agents` - Get all agents (with filtering)
- `GET /api/agents/active` - Get active agents
- `GET /api/agents/:id` - Get single agent
- `POST /api/agents` - Create agent (Admin)
- `PUT /api/agents/:id` - Update agent (Admin)
- `DELETE /api/agents/:id` - Delete agent (Admin)

### Blogs
- `GET /api/blogs` - Get all blog posts (with filtering)
- `GET /api/blogs/featured` - Get featured blog posts
- `GET /api/blogs/:id` - Get single blog post
- `POST /api/blogs/:id/like` - Like blog post
- `POST /api/blogs` - Create blog post (Admin)
- `PUT /api/blogs/:id` - Update blog post (Admin)
- `DELETE /api/blogs/:id` - Delete blog post (Admin)

### Company
- `GET /api/company` - Get company information
- `GET /api/company/contacts` - Get company contacts
- `GET /api/company/team` - Get company team
- `GET /api/company/partners` - Get company partners
- `PUT /api/company` - Update company information (Admin)

### Quote Requests
- `POST /api/quotes` - Submit quote request (Public)
- `GET /api/quotes` - Get all quote requests (Admin)
- `GET /api/quotes/statistics` - Get quote statistics (Admin)
- `GET /api/quotes/:id` - Get single quote request (Admin)
- `PUT /api/quotes/:id` - Update quote request (Admin)
- `POST /api/quotes/:id/notes` - Add note to quote request (Admin)
- `DELETE /api/quotes/:id` - Delete quote request (Admin)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   - MongoDB connection string
   - JWT secret key
   - Cloudinary credentials

5. Seed the database with sample data:
   ```bash
   npm run seed
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/imanprime
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Default Admin Credentials

After running the seed command:
- **Email**: admin@imanprime.com
- **Password**: Admin123!

## Data Models

### Property
- Complete property information with images, floor plans, and certifications
- Agent assignment and categorization
- Virtual tour links and amenities
- Status management and view tracking

### Agent
- Enhanced agent profiles with images and WhatsApp numbers
- Specialization and certification tracking
- Working hours and availability
- Rating and review system
- Social media integration

### Blog
- Full blog management with publishing workflow
- SEO-friendly slugs and categorization
- Engagement tracking (views, likes)
- Featured content support

### Company
- Complete company profile with logo and branding
- Team member profiles with social links
- Partner information and logos
- Multiple contact methods and addresses
- Working hours and social media presence

### Quote Request
- Comprehensive quote request system
- Project type and budget range categorization
- Timeline and priority management
- Agent assignment and note tracking
- File attachment support

## Security Features

- JWT authentication with secure token handling
- Password hashing using bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- File upload restrictions and validation

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

### Project Structure
```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── utils/           # Utility functions
└── server.js        # Main server file
```

## License

MIT License - see LICENSE file for details.#   i m a n p r i m e _ b a c k e n d  
 