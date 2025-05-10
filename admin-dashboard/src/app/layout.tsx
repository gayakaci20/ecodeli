import './globals.css'
import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import Link from 'next/link'
const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
})
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ecodeli Admin Dashboard',
  description: 'Admin dashboard for ecodeli',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar */}
          <div className="w-64 bg-sky-700 text-white">
            <div className="p-4 mt-6 font-bold text-xl text-center">ecodei Admin</div>
            <nav className="mt-6">
              <Link href="/" className="block py-2.5 px-6 hover:bg-sky-500 rounded-md transition-all duration-300 ease-in-out hover:text-white">Dashboard</Link>
              <Link href="/users" className="block py-2.5 px-6 hover:bg-sky-500 rounded-md transition-all duration-300 ease-in-out hover:text-white">Users</Link>
              <Link href="/packages" className="block py-2.5 px-6 hover:bg-sky-500 rounded-md transition-all duration-300 ease-in-out hover:text-white">Packages</Link>
              <Link href="/rides" className="block py-2.5 px-6 hover:bg-sky-500 rounded-md transition-all duration-300 ease-in-out hover:text-white">Rides</Link>
              <Link href="/matches" className="block py-2.5 px-6 hover:bg-sky-500 rounded-md transition-all duration-300 ease-in-out hover:text-white">Matches</Link>
              <Link href="/payments" className="block py-2.5 px-6 hover:bg-sky-500 rounded-md transition-all duration-300 ease-in-out hover:text-white">Payments</Link>
              <Link href="/messages" className="block py-2.5 px-6 hover:bg-sky-500 rounded-md transition-all duration-300 ease-in-out hover:text-white">Messages</Link>
              <Link href="/notifications" className="block py-2.5 px-6 hover:bg-sky-500 rounded-md transition-all duration-300 ease-in-out hover:text-white">Notifications</Link>
            </nav>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="bg-white rounded-lg shadow p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
