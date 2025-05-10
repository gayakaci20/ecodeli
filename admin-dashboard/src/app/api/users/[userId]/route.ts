import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@/generated/prisma'; // Assuming Role might be part of update

interface RouteContext {
  params: Promise<{ // Changed to reflect that params is a Promise
    userId: string;
  }>;
}

// PUT request to update a user
export async function PUT(request: NextRequest, { params: paramsPromise }: RouteContext) { // Destructure as paramsPromise
  const params = await paramsPromise; // Await the promise
  const { userId } = params;
  try {
    const body = await request.json();
    // Add validation for body content here (e.g., using Zod)
    // For example, ensure role is a valid Role enum if passed
    
    const { firstName, lastName, email, role, isVerified, phoneNumber, address } = body;

    // Ensure role is valid if provided
    if (role && !Object.values(Role).includes(role as Role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        email,
        role: role as Role, // Cast role to Role type
        isVerified,
        phoneNumber,
        address,
        // Add any other fields that can be updated
      },
    });
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error(`Error updating user ${userId}:`, error);
    if (error.code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update user', details: error.message }, { status: 500 });
  }
}

// DELETE request to delete a user
export async function DELETE(request: NextRequest, { params: paramsPromise }: RouteContext) { // Destructure as paramsPromise
  const params = await paramsPromise; // Await the promise
  const { userId } = params;
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 }); // Or 204 No Content
  } catch (error: any) {
    console.error(`Error deleting user ${userId}:`, error);
    if (error.code === 'P2025') { // Prisma error code for record not found
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete user', details: error.message }, { status: 500 });
  }
} 