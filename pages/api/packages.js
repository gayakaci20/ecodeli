import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  try {
    console.log(`Handling ${req.method} request to /api/packages`);
    
    if (req.method === 'GET') {
      try {
        console.log('Fetching packages');
        const packages = await prisma.package.findMany({
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        console.log(`Found ${packages.length} packages`);
        return res.status(200).json(packages);
      } catch (error) {
        console.error('Packages fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch packages', details: error.message });
      }
    } else if (req.method === 'POST') {
      try {
        const data = req.body;
        console.log('Received package data:', JSON.stringify(data, null, 2));
        
        // Validate user ID is provided
        if (!data.userId) {
          console.error('Missing userId in package creation request');
          return res.status(400).json({ 
            error: 'userId is required', 
            details: 'A valid user ID must be provided'
          });
        }
        
        // Validate user ID format - reject IDs with user_ prefix
        if (typeof data.userId === 'string' && data.userId.startsWith('user_')) {
          console.error(`Invalid user ID format: ${data.userId}`);
          return res.status(400).json({
            error: 'Invalid userId format',
            details: 'The user ID format is invalid - cannot start with "user_" prefix'
          });
        }
        
        console.log(`Looking up user with ID: ${data.userId}`);
        // Validate that the user exists
        try {
          const userExists = await prisma.user.findUnique({
            where: { id: data.userId }
          });
          
          // If user doesn't exist, return error
          if (!userExists) {
            console.error(`User with ID ${data.userId} not found`);
            return res.status(400).json({ 
              error: 'Invalid userId', 
              details: `No user found with ID: ${data.userId}`
            });
          }
          
          console.log(`User found: ${userExists.email}`);
        } catch (userLookupError) {
          console.error('Error looking up user:', userLookupError);
          return res.status(500).json({ 
            error: 'User lookup failed', 
            details: userLookupError.message 
          });
        }

        // Prepare the data object
        const packageData = {
          userId: data.userId,
          title: data.title || 'Unnamed package',
          description: data.description || null,
          weight: data.weight ? parseFloat(data.weight) : null,
          dimensions: data.dimensions || null,
          pickupAddress: data.pickupAddress || '',
          deliveryAddress: data.deliveryAddress || '',
          pickupLat: data.pickupLat ? parseFloat(data.pickupLat) : null,
          pickupLng: data.pickupLng ? parseFloat(data.pickupLng) : null,
          deliveryLat: data.deliveryLat ? parseFloat(data.deliveryLat) : null,
          deliveryLng: data.deliveryLng ? parseFloat(data.deliveryLng) : null,
          imageUrl: data.imageUrl || null,
          status: 'PENDING',
        };
        
        console.log('Creating package with prepared data:', JSON.stringify(packageData, null, 2));

        // Create the package
        try {
          const newPackage = await prisma.package.create({
            data: packageData,
          });

          console.log('Package created successfully:', JSON.stringify(newPackage, null, 2));
          return res.status(201).json(newPackage);
        } catch (createError) {
          console.error('Package creation database error:', createError);
          return res.status(500).json({ 
            error: 'Failed to create package in database', 
            details: createError.message
          });
        }
      } catch (processError) {
        console.error('Error processing package data:', processError);
        return res.status(500).json({ 
          error: 'Failed to process package data', 
          details: processError.message
        });
      }
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (topLevelError) {
    console.error('Top-level error in packages API:', topLevelError);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: topLevelError.message 
    });
  }
} 