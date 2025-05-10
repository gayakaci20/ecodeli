import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Construct the where clause based on filters
    const where = {
      AND: [
        // Search filter
        search ? {
          OR: [
            { startLocation: { contains: search } },
            { endLocation: { contains: search } },
            { vehicleType: { contains: search } },
            { user: {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
              ],
            }},
          ],
        } : {},
        // Status filter
        status ? { status } : {},
      ],
    };

    // Fetch rides with pagination
    const [rides, total] = await Promise.all([
      prisma.ride.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          departureTime: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.ride.count({ where }),
    ]);

    return NextResponse.json({
      rides,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Rides fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rides' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newRide = await prisma.ride.create({
      data: {
        userId: body.userId,
        startLocation: body.startLocation,
        endLocation: body.endLocation,
        startLat: body.startLat ? parseFloat(body.startLat) : null,
        startLng: body.startLng ? parseFloat(body.startLng) : null,
        endLat: body.endLat ? parseFloat(body.endLat) : null,
        endLng: body.endLng ? parseFloat(body.endLng) : null,
        departureTime: new Date(body.departureTime),
        estimatedArrivalTime: body.estimatedArrivalTime ? new Date(body.estimatedArrivalTime) : null,
        vehicleType: body.vehicleType,
        availableSeats: body.availableSeats ? parseInt(body.availableSeats) : null,
        maxPackageWeight: body.maxPackageWeight ? parseFloat(body.maxPackageWeight) : null,
        maxPackageSize: body.maxPackageSize,
        pricePerKg: body.pricePerKg ? parseFloat(body.pricePerKg) : null,
        pricePerSeat: body.pricePerSeat ? parseFloat(body.pricePerSeat) : null,
        notes: body.notes,
        status: 'AVAILABLE',
      },
    });

    return NextResponse.json(newRide, { status: 201 });
  } catch (error) {
    console.error('Ride creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create ride' },
      { status: 500 }
    );
  }
} 