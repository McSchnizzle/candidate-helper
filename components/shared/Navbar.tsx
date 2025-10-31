/**
 * Navbar Component
 * Main navigation for the application
 */

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link
              href="/"
              className="flex items-center text-xl font-bold text-gray-900 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-md"
            >
              Cindy from Cinder
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/practice">Try Practice Session</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
