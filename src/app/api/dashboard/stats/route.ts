import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalUsers,
      totalPackages,
      totalRides,
      totalMatches,
      pendingPackages,
      availableRides,
      completedDeliveries,
      totalRevenue
    ] = await Promise.all([
      // Count total users
      prisma.user.count(),

      // Count total packages
      prisma.package.count(),

      // Count total rides
      prisma.ride.count(),

      // Count total matches
      prisma.match.count(),

      // Count pending packages
      prisma.package.count({
        where: { status: 'PENDING' }
      }),

      // Count available rides
      prisma.ride.count({
        where: { status: 'AVAILABLE' }
      }),

      // Count completed deliveries
      prisma.match.count({
        where: { status: 'CONFIRMED' }
      }),

      // Count total revenue
      prisma.payment.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'COMPLETED'
        }
      })
    ]);

    return NextResponse.json({
      totalUsers,
      totalPackages,
      totalRides,
      totalMatches,
      pendingPackages,
      availableRides,
      completedDeliveries,
      totalRevenue: totalRevenue._sum.amount || 0
    });
  } catch (error) {
    console.error('Dashboard stats fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 