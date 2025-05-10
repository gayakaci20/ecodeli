import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface User {
  name: string | null;
  email: string;
}

interface Package {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  user: User;
}

interface Ride {
  id: string;
  startLocation: string;
  endLocation: string;
  departureTime: Date;
  createdAt: Date;
  user: User;
}

interface Match {
  id: string;
  createdAt: Date;
  package: {
    title: string;
  };
  ride: {
    startLocation: string;
    endLocation: string;
    user: User;
  };
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  user: User;
  match: {
    package: {
      title: string;
    };
  };
}

interface ActivityItem {
  type: 'package' | 'ride' | 'match' | 'payment';
  data: Package | Ride | Match | Payment;
  createdAt: Date;
}

export async function GET() {
  try {
    const [recentActivity, pendingPackages, availableRides] = await Promise.all([
      // Recent Activity: Fetch latest events (packages, rides, matches, payments)
      Promise.all([
        prisma.package.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true } },
          },
        }),
        prisma.ride.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true } },
          },
        }),
        prisma.match.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            package: { select: { title: true } },
            ride: {
              select: {
                startLocation: true,
                endLocation: true,
                user: { select: { name: true, email: true } },
              },
            },
          },
        }),
        prisma.payment.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true } },
            match: {
              select: {
                package: { select: { title: true } },
              },
            },
          },
        }),
      ]),

      // Pending Packages
      prisma.package.findMany({
        where: { status: 'PENDING' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),

      // Available Rides
      prisma.ride.findMany({
        where: { status: 'AVAILABLE' },
        take: 5,
        orderBy: { departureTime: 'asc' },
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    // Combine and sort recent activity
    const [recentPackages, recentRides, recentMatches, recentPayments] = recentActivity;
    const combinedActivity: ActivityItem[] = [
      ...recentPackages.map((pkg: Package) => ({
        type: 'package' as const,
        data: pkg,
        createdAt: pkg.createdAt,
      })),
      ...recentRides.map((ride: Ride) => ({
        type: 'ride' as const,
        data: ride,
        createdAt: ride.createdAt,
      })),
      ...recentMatches.map((match: Match) => ({
        type: 'match' as const,
        data: match,
        createdAt: match.createdAt,
      })),
      ...recentPayments.map((payment: Payment) => ({
        type: 'payment' as const,
        data: payment,
        createdAt: payment.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
     .slice(0, 10);

    return NextResponse.json({
      recentActivity: combinedActivity,
      pendingPackages,
      availableRides,
    });
  } catch (error) {
    console.error('Dashboard activity fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard activity' },
      { status: 500 }
    );
  }
} 