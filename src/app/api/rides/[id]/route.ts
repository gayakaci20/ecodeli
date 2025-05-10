import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

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