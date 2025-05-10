import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request
) {
  try {
    // Get ID from URL path directly
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    // The ID is the second-to-last segment in /api/payments/[id]/refund
    const id = pathParts[pathParts.length - 2];

    // Check if payment exists and is completed
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    if (existingPayment.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Only completed payments can be refunded' },
        { status: 400 }
      );
    }

    // TODO: Integrate with payment provider's refund API
    // For now, just update the status
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: 'REFUNDED',
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

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('Payment refund error:', error);
    return NextResponse.json(
      { error: 'Failed to refund payment' },
      { status: 500 }
    );
  }
} 