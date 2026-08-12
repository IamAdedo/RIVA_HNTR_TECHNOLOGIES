'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, ArrowRight } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const savedRole = localStorage.getItem('riva_simulated_role');
    if (savedRole) {
      if (savedRole === 'super_admin' || savedRole === 'sales_manager') {
        router.push('/admin/dashboard');
      } else if (savedRole === 'repair_tech') {
        router.push('/admin/repairs');
      } else if (savedRole === 'solar_manager') {
        router.push('/admin/solar');
      }
    }
  }, [router]);

  return (
    <div className="glass-panel p-8 rounded-xl border border-slate-800 text-center space-y-4">
      <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
      <h3 className="text-lg font-bold text-slate-200">Entering Staff Workspace</h3>
      <p className="text-slate-400 text-xs">
        Select your simulated access level in the control panel to display the dashboard.
      </p>
    </div>
  );
}
