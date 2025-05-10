import Image from "next/image";
import { PrismaClient } from '@/generated/prisma';
import { format } from 'date-fns';
import Link from "next/link";
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
})
const prisma = new PrismaClient();

export default async function Home() {
  const users = await prisma.user.findMany();
  const packages = await prisma.package.findMany();
  const rides = await prisma.ride.findMany();
  const matches = await prisma.match.findMany({
    include: {
      package: true,
      ride: true,
    },
  });
  return (
    <main>
      <h1 className="text-2xl font-bold mb-6 text-black">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-500 text-sm font-medium uppercase mb-2 text-black">Users</h2>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-gray-900">{users.length}</div>
            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">
              <Link href="/users">View</Link>
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-500 text-sm font-medium uppercase mb-2 text-black">Packages</h2>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-gray-900">{packages.length}</div>
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
              <Link href="/packages">View</Link>
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-500 text-sm font-medium uppercase mb-2 text-black">Rides</h2>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-gray-900">{rides.length}</div>
            <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full">
              <Link href="/rides">View</Link>
            </span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-500 text-sm font-medium uppercase mb-2 text-black">Matches</h2>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-gray-900">{matches.length}</div>
            <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded-full">
              <Link href="/matches">View</Link>
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium mb-4 text-black">Recent Activity</h2>
        <div className="text-gray-500 text-center py-4">
          {matches.map((match) => (
            <div key={match.id}>
              {match.package.title} - {match.ride.status}
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 text-black">Pending Packages</h2>
          <div className="text-gray-500 text-center py-4">
            {packages.map((pkg) => (
              <div key={pkg.id}>
                {pkg.title} - {pkg.status}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4 text-black">Available Rides</h2>
          <div className="text-gray-500 text-center py-4">
            {rides.map((ride) => (
              <div key={ride.id}>
                {ride.status}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
