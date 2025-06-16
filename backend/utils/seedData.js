import mongoose from 'mongoose';
import User from '../models/User.js';
import Agent from '../models/Agent.js';
import Property from '../models/Property.js';
import Blog from '../models/Blog.js';
import Company from '../models/Company.js';
import QuoteRequest from '../models/QuoteRequest.js';
import connectDatabase from './database.js';

// Seed admin user
const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      const admin = new User({
        username: 'admin',
        email: 'admin@imanprime.com',
        password: 'Admin123!',
        role: 'admin'
      });
      
      await admin.save();
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: admin@imanprime.com');
      console.log('🔑 Password: Admin123!');
      return admin;
    } else {
      console.log('ℹ️  Admin user already exists');
      return existingAdmin;
    }
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    throw error;
  }
};

// Seed company information
const seedCompany = async (adminId) => {
  try {
    const existingCompany = await Company.findOne({ isActive: true });
    
    if (!existingCompany) {
      const companyData = {
        name: 'ImanPrime',
        logo: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
        about: {
          story: [
            {
              title: 'Our Beginning',
              content: 'Founded with a vision to transform spaces and create exceptional real estate experiences, ImanPrime has been at the forefront of innovative design and property development.'
            },
            {
              title: 'Our Growth',
              content: 'Over the years, we have expanded our services to include comprehensive interior and exterior design solutions, working with clients to bring their dream spaces to life.'
            }
          ],
          values: [
            {
              name: 'Excellence',
              description: 'We strive for excellence in every project, ensuring the highest quality standards and attention to detail.'
            },
            {
              name: 'Innovation',
              description: 'We embrace innovative design solutions and cutting-edge technologies to create unique and functional spaces.'
            },
            {
              name: 'Integrity',
              description: 'We conduct business with honesty, transparency, and ethical practices in all our interactions.'
            },
            {
              name: 'Client Focus',
              description: 'Our clients are at the center of everything we do, and we are committed to exceeding their expectations.'
            }
          ],
          vision: 'To be the leading real estate and design company, creating exceptional spaces that inspire and enhance the lives of our clients.',
          mission: 'We are dedicated to providing comprehensive real estate and design services that combine creativity, functionality, and sustainability to deliver outstanding results for our clients.'
        },
        team: [
          {
            name: 'Sarah Johnson',
            image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
            position: 'CEO & Founder',
            phone: '+1 (555) 123-4567',
            socialLinks: {
              linkedin: 'https://linkedin.com/in/sarahjohnson',
              twitter: 'https://twitter.com/sarahjohnson'
            }
          },
          {
            name: 'Michael Chen',
            image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
            position: 'Head of Design',
            phone: '+1 (555) 234-5678',
            socialLinks: {
              linkedin: 'https://linkedin.com/in/michaelchen',
              instagram: 'https://instagram.com/michaelchen'
            }
          },
          {
            name: 'Emily Rodriguez',
            image: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg',
            position: 'Senior Project Manager',
            phone: '+1 (555) 345-6789',
            socialLinks: {
              linkedin: 'https://linkedin.com/in/emilyrodriguez'
            }
          }
        ],
        partners: [
          {
            name: 'Premium Materials Co.',
            logo: 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg',
            website: 'https://premiummaterials.com'
          },
          {
            name: 'Elite Contractors',
            logo: 'https://images.pexels.com/photos/280230/pexels-photo-280230.jpeg',
            website: 'https://elitecontractors.com'
          }
        ],
        contacts: {
          addresses: [
            {
              type: 'main',
              address: '123 Design Avenue',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA'
            },
            {
              type: 'branch',
              address: '456 Creative Street',
              city: 'Los Angeles',
              state: 'CA',
              zipCode: '90210',
              country: 'USA'
            }
          ],
          phoneNumbers: [
            {
              type: 'main',
              number: '+1 (555) 123-4567',
              label: 'Main Office'
            },
            {
              type: 'sales',
              number: '+1 (555) 234-5678',
              label: 'Sales Department'
            },
            {
              type: 'support',
              number: '+1 (555) 345-6789',
              label: 'Customer Support'
            }
          ],
          emails: [
            {
              type: 'general',
              email: 'info@imanprime.com',
              label: 'General Inquiries'
            },
            {
              type: 'sales',
              email: 'sales@imanprime.com',
              label: 'Sales Team'
            },
            {
              type: 'support',
              email: 'support@imanprime.com',
              label: 'Customer Support'
            }
          ],
          workingHours: {
            monday: { open: '9:00 AM', close: '6:00 PM' },
            tuesday: { open: '9:00 AM', close: '6:00 PM' },
            wednesday: { open: '9:00 AM', close: '6:00 PM' },
            thursday: { open: '9:00 AM', close: '6:00 PM' },
            friday: { open: '9:00 AM', close: '6:00 PM' },
            saturday: { open: '10:00 AM', close: '4:00 PM' },
            sunday: { open: 'Closed', close: 'Closed' }
          }
        },
        socialMedia: {
          facebook: 'https://facebook.com/imanprime',
          twitter: 'https://twitter.com/imanprime',
          instagram: 'https://instagram.com/imanprime',
          linkedin: 'https://linkedin.com/company/imanprime',
          youtube: 'https://youtube.com/imanprime'
        },
        updatedBy: adminId
      };

      const company = new Company(companyData);
      await company.save();
      console.log('✅ Company information created successfully');
      return company;
    } else {
      console.log('ℹ️  Company information already exists');
      return existingCompany;
    }
  } catch (error) {
    console.error('❌ Error seeding company:', error);
    throw error;
  }
};

// Seed sample agents with enhanced features
const seedAgents = async (adminId) => {
  try {
    const existingAgents = await Agent.countDocuments();
    
    if (existingAgents === 0) {
      const sampleAgents = [
        {
          name: 'John Smith',
          email: 'john.smith@imanprime.com',
          phone: '+1 (555) 123-4567',
          whatsappNumber: '+1 (555) 123-4567',
          image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
          bio: 'Experienced real estate agent with over 10 years in residential properties and interior design consultation.',
          specialization: 'residential',
          experience: 10,
          languages: ['English', 'Spanish'],
          certifications: [
            {
              name: 'Certified Real Estate Professional',
              issuedBy: 'National Association of Realtors',
              issuedDate: new Date('2020-01-15')
            }
          ],
          socialMedia: {
            linkedin: 'https://linkedin.com/in/johnsmith',
            instagram: 'https://instagram.com/johnsmith_realtor'
          },
          workingHours: {
            monday: { start: '9:00 AM', end: '6:00 PM', available: true },
            tuesday: { start: '9:00 AM', end: '6:00 PM', available: true },
            wednesday: { start: '9:00 AM', end: '6:00 PM', available: true },
            thursday: { start: '9:00 AM', end: '6:00 PM', available: true },
            friday: { start: '9:00 AM', end: '6:00 PM', available: true },
            saturday: { start: '10:00 AM', end: '4:00 PM', available: true },
            sunday: { start: '', end: '', available: false }
          },
          rating: { average: 4.8, totalReviews: 45 },
          createdBy: adminId
        },
        {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@imanprime.com',
          phone: '+1 (555) 234-5678',
          whatsappNumber: '+1 (555) 234-5678',
          image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
          bio: 'Luxury property specialist and interior design expert helping clients create their dream spaces.',
          specialization: 'luxury',
          experience: 8,
          languages: ['English', 'French'],
          certifications: [
            {
              name: 'Luxury Home Marketing Specialist',
              issuedBy: 'Institute for Luxury Home Marketing',
              issuedDate: new Date('2021-03-20')
            },
            {
              name: 'Interior Design Certification',
              issuedBy: 'American Society of Interior Designers',
              issuedDate: new Date('2019-06-10')
            }
          ],
          socialMedia: {
            linkedin: 'https://linkedin.com/in/sarahjohnson',
            instagram: 'https://instagram.com/sarah_luxury_homes'
          },
          workingHours: {
            monday: { start: '8:00 AM', end: '7:00 PM', available: true },
            tuesday: { start: '8:00 AM', end: '7:00 PM', available: true },
            wednesday: { start: '8:00 AM', end: '7:00 PM', available: true },
            thursday: { start: '8:00 AM', end: '7:00 PM', available: true },
            friday: { start: '8:00 AM', end: '7:00 PM', available: true },
            saturday: { start: '9:00 AM', end: '5:00 PM', available: true },
            sunday: { start: '', end: '', available: false }
          },
          rating: { average: 4.9, totalReviews: 62 },
          createdBy: adminId
        },
        {
          name: 'Mike Davis',
          email: 'mike.davis@imanprime.com',
          phone: '+1 (555) 345-6789',
          whatsappNumber: '+1 (555) 345-6789',
          image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg',
          bio: 'Commercial real estate expert and exterior design specialist with focus on investment properties.',
          specialization: 'commercial',
          experience: 12,
          languages: ['English'],
          certifications: [
            {
              name: 'Commercial Real Estate License',
              issuedBy: 'Commercial Real Estate Institute',
              issuedDate: new Date('2018-09-15')
            }
          ],
          socialMedia: {
            linkedin: 'https://linkedin.com/in/mikedavis',
            website: 'https://mikedavis-commercial.com'
          },
          workingHours: {
            monday: { start: '9:00 AM', end: '6:00 PM', available: true },
            tuesday: { start: '9:00 AM', end: '6:00 PM', available: true },
            wednesday: { start: '9:00 AM', end: '6:00 PM', available: true },
            thursday: { start: '9:00 AM', end: '6:00 PM', available: true },
            friday: { start: '9:00 AM', end: '6:00 PM', available: true },
            saturday: { start: '', end: '', available: false },
            sunday: { start: '', end: '', available: false }
          },
          rating: { average: 4.7, totalReviews: 38 },
          createdBy: adminId
        }
      ];

      const agents = await Agent.insertMany(sampleAgents);
      console.log(`✅ ${agents.length} sample agents created`);
      return agents;
    } else {
      console.log('ℹ️  Agents already exist');
      return await Agent.find().limit(3);
    }
  } catch (error) {
    console.error('❌ Error seeding agents:', error);
    throw error;
  }
};

// Seed sample properties (keeping existing logic)
const seedProperties = async (adminId, agents) => {
  try {
    const existingProperties = await Property.countDocuments();
    
    if (existingProperties === 0) {
      const sampleProperties = [
        {
          title: 'Modern Downtown Apartment',
          description: 'Beautiful modern apartment in the heart of downtown with stunning city views and contemporary interior design.',
          location: 'Downtown District, City Center',
          price: 350000,
          bedrooms: 2,
          bathrooms: 2,
          parking: true,
          image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
          images: [
            'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg',
            'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'
          ],
          amenities: ['Gym', 'Pool', 'Concierge', 'Rooftop Deck'],
          status: 'active',
          area: '1200 sq ft',
          agent: agents[0]._id,
          category: 'residential',
          virtual_tour: 'https://example.com/virtual-tour-1',
          floor_plans: [
            {
              name: 'Main Floor Plan',
              image: 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg'
            }
          ],
          property_certifications: ['Energy Star Certified', 'LEED Gold'],
          featured: true,
          createdBy: adminId
        },
        {
          title: 'Luxury Villa with Ocean View',
          description: 'Stunning luxury villa with panoramic ocean views, private beach access, and exquisite interior and exterior design.',
          location: 'Coastal Heights, Oceanside',
          price: 1500000,
          bedrooms: 5,
          bathrooms: 4,
          parking: true,
          image: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg',
          images: [
            'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
            'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg'
          ],
          amenities: ['Private Beach', 'Pool', 'Garden', 'Wine Cellar'],
          status: 'active',
          area: '4500 sq ft',
          agent: agents[1]._id,
          category: 'luxury',
          virtual_tour: 'https://example.com/virtual-tour-2',
          floor_plans: [
            {
              name: 'Ground Floor',
              image: 'https://images.pexels.com/photos/210617/pexels-photo-210617.jpeg'
            },
            {
              name: 'Second Floor',
              image: 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg'
            }
          ],
          property_certifications: ['Luxury Home Certified', 'Smart Home Ready'],
          featured: true,
          createdBy: adminId
        },
        {
          title: 'Commercial Office Building',
          description: 'Prime commercial office building in the business district with excellent rental potential and modern exterior design.',
          location: 'Business District, Financial Center',
          price: 2500000,
          bedrooms: 0,
          bathrooms: 8,
          parking: true,
          image: 'https://images.pexels.com/photos/290595/pexels-photo-290595.jpeg',
          images: [
            'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg',
            'https://images.pexels.com/photos/280230/pexels-photo-280230.jpeg'
          ],
          amenities: ['Elevator', 'Conference Rooms', 'Parking Garage', '24/7 Security'],
          status: 'active',
          area: '15000 sq ft',
          agent: agents[2]._id,
          category: 'commercial',
          virtual_tour: 'https://example.com/virtual-tour-3',
          floor_plans: [
            {
              name: 'Floor 1-5 Layout',
              image: 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg'
            }
          ],
          property_certifications: ['Commercial Grade A', 'Fire Safety Certified'],
          createdBy: adminId
        }
      ];

      const properties = await Property.insertMany(sampleProperties);
      console.log(`✅ ${properties.length} sample properties created`);
      return properties;
    } else {
      console.log('ℹ️  Properties already exist');
      return await Property.find().limit(3);
    }
  } catch (error) {
    console.error('❌ Error seeding properties:', error);
    throw error;
  }
};

// Seed sample blog posts (keeping existing logic)
const seedBlogs = async (adminId) => {
  try {
    const existingBlogs = await Blog.countDocuments();
    
    if (existingBlogs === 0) {
      const sampleBlogs = [
        {
          title: '10 Interior Design Tips for Modern Homes',
          content: 'Creating a modern interior design requires careful attention to detail, color schemes, and functionality. Here are 10 essential tips to help you achieve a contemporary look that combines style with practicality...',
          excerpt: 'Essential interior design tips and advice for creating modern, functional living spaces.',
          image: 'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg',
          author: 'Interior Design Expert',
          tags: ['interior-design', 'modern-homes', 'tips', 'decoration'],
          category: 'Interior Design',
          status: 'published',
          featured: true,
          createdBy: adminId
        },
        {
          title: 'Exterior Design Trends 2024',
          content: 'The exterior design landscape continues to evolve in 2024. Here are the key trends shaping outdoor spaces and building facades...',
          excerpt: 'Analysis of current exterior design trends and predictions for 2024.',
          image: 'https://images.pexels.com/photos/210617/pexels-photo-210617.jpeg',
          author: 'Exterior Design Specialist',
          tags: ['exterior-design', '2024-trends', 'architecture', 'landscaping'],
          category: 'Exterior Design',
          status: 'published',
          createdBy: adminId
        },
        {
          title: 'Real Estate Investment Guide',
          content: 'Real estate investment can be a lucrative venture when approached strategically. Here are proven strategies for successful property investment...',
          excerpt: 'Comprehensive guide to real estate investment strategies and market analysis.',
          image: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
          author: 'Investment Advisor',
          tags: ['real-estate', 'investment', 'property-market', 'finance'],
          category: 'Investment',
          status: 'published',
          createdBy: adminId
        }
      ];

      const blogs = await Blog.insertMany(sampleBlogs);
      console.log(`✅ ${blogs.length} sample blog posts created`);
      return blogs;
    } else {
      console.log('ℹ️  Blog posts already exist');
      return await Blog.find().limit(3);
    }
  } catch (error) {
    console.error('❌ Error seeding blogs:', error);
    throw error;
  }
};

// Seed sample quote requests
const seedQuoteRequests = async (agents) => {
  try {
    const existingQuotes = await QuoteRequest.countDocuments();
    
    if (existingQuotes === 0) {
      const sampleQuotes = [
        {
          fullName: 'Alice Johnson',
          email: 'alice.johnson@email.com',
          phoneNumber: '+1 (555) 987-6543',
          projectType: 'interior-design',
          budgetRange: '25k-50k',
          timeline: '3-6-months',
          projectDescription: 'Looking to redesign my living room and kitchen with a modern aesthetic. Need help with color schemes, furniture selection, and lighting.',
          propertyType: 'residential',
          propertySize: '1800 sq ft',
          preferredContactMethod: 'email',
          status: 'new',
          priority: 'medium'
        },
        {
          fullName: 'Robert Chen',
          email: 'robert.chen@email.com',
          phoneNumber: '+1 (555) 876-5432',
          projectType: 'exterior-design',
          budgetRange: '50k-100k',
          timeline: '6-12-months',
          projectDescription: 'Complete exterior renovation including landscaping, facade update, and outdoor living space creation.',
          propertyType: 'residential',
          propertySize: '3200 sq ft',
          preferredContactMethod: 'phone',
          status: 'contacted',
          priority: 'high',
          assignedTo: agents[1]._id
        },
        {
          fullName: 'Maria Rodriguez',
          email: 'maria.rodriguez@email.com',
          phoneNumber: '+1 (555) 765-4321',
          projectType: 'both-interior-exterior',
          budgetRange: '100k-250k',
          timeline: '1-3-months',
          projectDescription: 'New construction home needs complete interior and exterior design. Looking for luxury finishes and smart home integration.',
          propertyType: 'residential',
          propertySize: '4500 sq ft',
          preferredContactMethod: 'whatsapp',
          status: 'in-progress',
          priority: 'urgent',
          assignedTo: agents[0]._id,
          estimatedQuoteAmount: 175000
        }
      ];

      const quotes = await QuoteRequest.insertMany(sampleQuotes);
      console.log(`✅ ${quotes.length} sample quote requests created`);
      return quotes;
    } else {
      console.log('ℹ️  Quote requests already exist');
      return await QuoteRequest.find().limit(3);
    }
  } catch (error) {
    console.error('❌ Error seeding quote requests:', error);
    throw error;
  }
};

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDatabase();
    
    console.log('🌱 Starting database seeding...');
    
    const admin = await seedAdmin();
    const company = await seedCompany(admin._id);
    const agents = await seedAgents(admin._id);
    const properties = await seedProperties(admin._id, agents);
    const blogs = await seedBlogs(admin._id);
    const quotes = await seedQuoteRequests(agents);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n=== ADMIN CREDENTIALS ===');
    console.log('📧 Email: admin@imanprime.com');
    console.log('🔑 Password: Admin123!');
    console.log('========================\n');
    
    console.log('📊 Seeded Data Summary:');
    console.log(`👤 Admin Users: 1`);
    console.log(`🏢 Company Info: 1`);
    console.log(`👨‍💼 Agents: ${agents.length}`);
    console.log(`🏠 Properties: ${properties.length}`);
    console.log(`📝 Blog Posts: ${blogs.length}`);
    console.log(`💬 Quote Requests: ${quotes.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;