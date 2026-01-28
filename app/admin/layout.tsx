/**
 * Admin Layout
 * Wraps all admin pages with sidebar navigation
 *
 * Security: Access control is handled by middleware.ts
 * This layout only renders for authenticated admins
 */

import { Sidebar } from '@/components/admin/Sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
