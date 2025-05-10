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
            { transactionId: { contains: search } },
            { paymentMethod: { contains: search } },
            { user: {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
              ],
            }},
            { match: {
              package: {
                title: { contains: search },
              },
            }},
          ],
        } : {},
        // Status filter
        status ? { status } : {},
      ],
    };

    // Fetch payments with pagination
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          match: {
            select: {
              package: {
                select: {
                  title: true,
                },
              },
              ride: {
                select: {
                  startLocation: true,
                  endLocation: true,
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
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Payments fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newPayment = await prisma.payment.create({
      data: {
        userId: body.userId,
        matchId: body.matchId,
        amount: parseFloat(body.amount),
        currency: body.currency || 'EUR',
        status: 'PENDING',
        paymentMethod: body.paymentMethod,
        transactionId: body.transactionId,
        paymentIntentId: body.paymentIntentId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        match: {
          select: {
            package: {
              select: {
                title: true,
              },
            },
            ride: {
              select: {
                startLocation: true,
                endLocation: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
} 