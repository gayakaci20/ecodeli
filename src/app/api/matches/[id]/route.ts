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
    
    // Check if match exists
    const existingMatch = await prisma.match.findUnique({
      where: { id },
      include: {
        payment: true,
      },
    });

    if (!existingMatch) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    // Delete the match and related payment if exists
    await prisma.$transaction([
      prisma.payment.deleteMany({
        where: { matchId: id },
      }),
      prisma.match.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Match deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete match' },
      { status: 500 }
    );
  }
} 