import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch recent packages
    const packages = await prisma.package.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Fetch recent rides
    const rides = await prisma.ride.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Transform packages into activities
    const packageActivities = packages.map((pkg) => ({
      id: `pkg-${pkg.id}`,
      type: 'PACKAGE',
      title: pkg.title,
      description: `Package from ${pkg.user.name || pkg.user.email}`,
      timestamp: pkg.createdAt,
      status: pkg.status,
      entityId: pkg.id,
    }));

    // Transform rides into activities
    const rideActivities = rides.map((ride) => ({
      id: `ride-${ride.id}`,
      type: 'RIDE',
      title: 'New Ride',
      description: `Ride by ${ride.user.name || ride.user.email}`,
      timestamp: ride.createdAt,
      status: ride.status,
      entityId: ride.id,
    }));

    // Combine and sort all activities
    const allActivities = [...packageActivities, ...rideActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Get only the 10 most recent activities

    return NextResponse.json(allActivities);
  } catch (error) {
    console.error('Activities fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
} 