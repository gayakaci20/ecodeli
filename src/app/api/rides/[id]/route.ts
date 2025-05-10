import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request
) {
  try {
    // Get ID from URL path directly
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    // Check if ride exists
    const existingRide = await prisma.ride.findUnique({
      where: { id },
      include: {
        matches: true,
      },
    });

    if (!existingRide) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      );
    }

    // Delete the ride and all related matches
    await prisma.$transaction([
      prisma.match.deleteMany({
        where: { rideId: id },
      }),
      prisma.ride.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ message: 'Ride deleted successfully' });
  } catch (error) {
    console.error('Ride deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete ride' },
      { status: 500 }
    );
  }
} 