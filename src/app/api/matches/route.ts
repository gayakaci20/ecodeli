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
            { package: {
              OR: [
                { title: { contains: search } },
                { user: {
                  OR: [
                    { name: { contains: search } },
                    { email: { contains: search } },
                  ],
                }},
              ],
            }},
            { ride: {
              OR: [
                { startLocation: { contains: search } },
                { endLocation: { contains: search } },
                { user: {
                  OR: [
                    { name: { contains: search } },
                    { email: { contains: search } },
                  ],
                }},
              ],
            }},
          ],
        } : {},
        // Status filter
        status ? { status } : {},
      ],
    };

    // Fetch matches with pagination
    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        include: {
          package: {
            select: {
              id: true,
              title: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          ride: {
            select: {
              id: true,
              startLocation: true,
              endLocation: true,
              departureTime: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.match.count({ where }),
    ]);

    return NextResponse.json({
      matches,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Matches fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newMatch = await prisma.match.create({
      data: {
        packageId: body.packageId,
        rideId: body.rideId,
        price: body.price ? parseFloat(body.price) : null,
        status: 'PROPOSED',
        proposedByUserId: body.proposedByUserId,
      },
      include: {
        package: {
          select: {
            title: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        ride: {
          select: {
            startLocation: true,
            endLocation: true,
            departureTime: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(newMatch, { status: 201 });
  } catch (error) {
    console.error('Match creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
} 