'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Laptop, ShieldAlert, Cpu, Sun } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';

export default function Header() {
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: 'Shop Laptops', href: '/shop', icon: Cpu },
    { name: 'Repairs & Servicing', href: '/repairs', icon: Laptop },
    { name: 'Solar Energy', href: '/solar', icon: Sun },
    { name: 'Track Order', href: '/track', icon: ShieldAlert },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 hover:opacity-90 transition-opacity">
              <Laptop className="w-6 h-6 text-indigo-400" />
              <span>RIVA HNTR</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-4">
            {/* Admin Area */}
            <Link
              href="/admin/dashboard"
              className="hidden sm:inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all hover:border-slate-600"
            >
              Staff Portal
            </Link>

            {/* Cart Link */}
            <Link
              href="/cart"
              className="relative flex items-center p-2 rounded-full text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {mounted && totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white border-2 border-slate-900 animate-pulse">
                  {totalCartItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
