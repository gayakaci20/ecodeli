import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      users,
      packages,
      rides,
      matches,
      payments,
      messages,
      notifications
    ] = await Promise.all([
      // Users - tous les champs pertinents
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          address: true,
          role: true,
          isVerified: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          image: true,
        },
      }),
      // Packages - tous les détails
      prisma.package.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          matches: {
            include: {
              ride: true,
            },
          },
        },
      }),
      // Rides - informations complètes
      prisma.ride.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          matches: {
            include: {
              package: true,
            },
          },
        },
      }),
      // Matches - relations complètes
      prisma.match.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          package: {
            include: {
              user: true,
            },
          },
          ride: {
            include: {
              user: true,
            },
          },
          payment: true,
        },
      }),
      // Payments - détails complets
      prisma.payment.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          match: {
            include: {
              package: true,
              ride: true,
            },
          },
        },
      }),
      // Messages - avec détails expéditeur et destinataire
      prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      // Notifications - informations complètes
      prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      users,
      packages,
      rides,
      matches,
      payments,
      messages,
      notifications,
    });
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
} 