import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PackageStatus } from '@/generated/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status') as PackageStatus | null;

    // Construct the where clause based on filters
    const where = {
      AND: [
        // Search filter
        search ? {
          OR: [
            { title: { contains: search } },
            { pickupAddress: { contains: search } },
            { deliveryAddress: { contains: search } },
          ],
        } : {},
        // Status filter
        status ? { status } : {},
      ],
    };

    const packages = await prisma.package.findMany({
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
        createdAt: 'desc',
      },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Packages fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
} 