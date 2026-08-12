'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, UserCheck, Key, BarChart3, Package, Wrench, Sun, LogOut, Lock } from 'lucide-react';

export type UserRole = 'super_admin' | 'sales_manager' | 'repair_tech' | 'solar_manager' | 'customer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  // Simulated Admin Session State
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    setMounted(true);
    // Load from local storage
    const saved = localStorage.getItem('riva_simulated_role') as UserRole;
    if (saved) {
      setSimulatedRole(saved);
    }
  }, []);

  const handleSelectRole = (role: UserRole) => {
    localStorage.setItem('riva_simulated_role', role);
    setSimulatedRole(role);
    
    // Redirect to the correct sub-route based on selected role
    if (role === 'super_admin' || role === 'sales_manager') {
      router.push('/admin/dashboard');
    } else if (role === 'repair_tech') {
      router.push('/admin/repairs');
    } else if (role === 'solar_manager') {
      router.push('/admin/solar');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('riva_simulated_role');
    setSimulatedRole(null);
    router.push('/admin');
  };

  if (!mounted) return <div className="text-center py-20 text-slate-400">Loading admin workspace...</div>;

  // 1. If not logged in / simulated, show Role Simulator Entrance
  if (!simulatedRole) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 space-y-8 min-h-[70vh] flex flex-col justify-center">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-full border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <Key className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Staff Entrance & Role Simulator</h1>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Choose a staff access level below to enter the admin workspace and simulate the Role-Based Access Control (RBAC).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleSelectRole('super_admin')}
            className="p-5 text-left rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 transition-all flex items-start gap-4 cursor-pointer hover:bg-slate-900/60"
          >
            <div className="p-2 rounded bg-indigo-500/10 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-200 block">Super Admin</span>
              <span className="text-xs text-slate-500 block mt-0.5">Revenues, logs, all access.</span>
            </div>
          </button>

          <button
            onClick={() => handleSelectRole('sales_manager')}
            className="p-5 text-left rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 transition-all flex items-start gap-4 cursor-pointer hover:bg-slate-900/60"
          >
            <div className="p-2 rounded bg-blue-500/10 text-blue-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-200 block">Sales Manager</span>
              <span className="text-xs text-slate-500 block mt-0.5">Edit inventory, products, orders.</span>
            </div>
          </button>

          <button
            onClick={() => handleSelectRole('repair_tech')}
            className="p-5 text-left rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 transition-all flex items-start gap-4 cursor-pointer hover:bg-slate-900/60"
          >
            <div className="p-2 rounded bg-emerald-500/10 text-emerald-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-200 block">Repair Tech</span>
              <span className="text-xs text-slate-500 block mt-0.5">Kanban tickets, diagnostics.</span>
            </div>
          </button>

          <button
            onClick={() => handleSelectRole('solar_manager')}
            className="p-5 text-left rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 transition-all flex items-start gap-4 cursor-pointer hover:bg-slate-900/60"
          >
            <div className="p-2 rounded bg-amber-500/10 text-amber-400">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-200 block">Solar Manager</span>
              <span className="text-xs text-slate-500 block mt-0.5">Leads, surveys, quotas.</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // 2. Perform Route Level RBAC Verification based on Active Role
  const hasAccess = () => {
    if (simulatedRole === 'super_admin') return true;
    if (simulatedRole === 'sales_manager') {
      return pathname.startsWith('/admin/dashboard') || pathname.startsWith('/admin/inventory');
    }
    if (simulatedRole === 'repair_tech') {
      return pathname.startsWith('/admin/repairs');
    }
    if (simulatedRole === 'solar_manager') {
      return pathname.startsWith('/admin/solar');
    }
    return false;
  };

  const getRoleLabel = (role: UserRole) => {
    return role.replace(/_/g, ' ').toUpperCase();
  };

  // Sidebar Links
  const sidebarLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3, roles: ['super_admin', 'sales_manager'] },
    { name: 'Inventory', href: '/admin/inventory', icon: Package, roles: ['super_admin', 'sales_manager'] },
    { name: 'Repair Kanban', href: '/admin/repairs', icon: Wrench, roles: ['super_admin', 'repair_tech'] },
    { name: 'Solar Lead Hub', href: '/admin/solar', icon: Sun, roles: ['super_admin', 'solar_manager'] },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Banner Simulator Control */}
      <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
          <UserCheck className="w-4 h-4" />
          <span>Simulated Active Session:</span>
          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-200 rounded font-bold">
            {getRoleLabel(simulatedRole)}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              localStorage.removeItem('riva_simulated_role');
              setSimulatedRole(null);
            }}
            className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-350 hover:bg-slate-800 hover:text-slate-200 transition-colors text-xs font-medium cursor-pointer"
          >
            Change Simulated Role
          </button>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 glass-panel p-5 rounded-xl border border-slate-850 space-y-4">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
            Navigation Console
          </span>

          <nav className="flex flex-col gap-1.5">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const allowed = link.roles.includes(simulatedRole);
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={allowed ? link.href : '#'}
                  onClick={(e) => {
                    if (!allowed) {
                      e.preventDefault();
                      alert(`Access Denied! Your active role (${getRoleLabel(simulatedRole)}) does not have permission to view the ${link.name} dashboard.`);
                    }
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-all border ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/35 font-semibold'
                      : allowed
                      ? 'text-slate-350 hover:bg-slate-900 hover:text-slate-200 border-transparent'
                      : 'text-slate-600 border-transparent cursor-not-allowed opacity-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </span>
                  {!allowed && <Lock className="w-3.5 h-3.5 text-slate-650" />}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Box with RBAC Shield */}
        <main className="lg:col-span-9">
          {hasAccess() ? (
            children
          ) : (
            <div className="glass-panel p-12 rounded-xl border border-rose-500/10 text-center space-y-4">
              <Lock className="w-16 h-16 text-rose-500 mx-auto" />
              <h2 className="text-xl font-bold">Access Denied!</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Your simulated role <span className="font-semibold text-slate-200">{getRoleLabel(simulatedRole)}</span> does not possess clearance to access path: <span className="font-mono text-xs bg-slate-900 px-2 py-0.5 rounded text-indigo-400">{pathname}</span>.
              </p>
              <div className="pt-2">
                <Link
                  href={
                    simulatedRole === 'repair_tech'
                      ? '/admin/repairs'
                      : simulatedRole === 'solar_manager'
                      ? '/admin/solar'
                      : '/admin/dashboard'
                  }
                  className="inline-block px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold text-xs transition-colors"
                >
                  Return to Allowed Console
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
