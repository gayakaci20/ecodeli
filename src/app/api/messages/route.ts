import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const read = searchParams.get('read');

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Construct the where clause based on filters
    const where = {
      AND: [
        // Search filter
        search ? {
          OR: [
            { subject: { contains: search } },
            { content: { contains: search } },
            { sender: {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
              ],
            }},
            { recipient: {
              OR: [
                { name: { contains: search } },
                { email: { contains: search } },
              ],
            }},
          ],
        } : {},
        // Read status filter
        read !== null ? { read: read === 'true' } : {},
      ],
    };

    // Fetch messages with pagination
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: {
            select: {
              name: true,
              email: true,
            },
          },
          recipient: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.message.count({ where }),
    ]);

    return NextResponse.json({
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newMessage = await prisma.message.create({
      data: {
        senderId: body.senderId,
        recipientId: body.recipientId,
        subject: body.subject,
        content: body.content,
        read: false,
      },
      include: {
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
        recipient: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error('Message creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
} 