'use client';

import React from 'react';
import Link from 'next/link';
import { Laptop, Sun, Wrench, ShieldCheck, ArrowRight, Star } from 'lucide-react';
import ProductCard, { Product } from '@/components/ProductCard';

const FEATURED_MOCK_PRODUCTS: Product[] = [
  {
    id: 'f1',
    title: 'MacBook Pro 16" Apple M2 Pro (16GB, 512GB SSD)',
    slug: 'macbook-pro-16-m2-pro',
    category: 'Laptops',
    condition: 'UK_USED_GRADE_A',
    price: 1250000,
    stock_quantity: 4,
    specs: {
      processor: 'Apple M2 Pro',
      ram: '16GB',
      storage: '512GB SSD',
      battery_health: '94%',
    },
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'],
  },
  {
    id: 'f2',
    title: 'Dell XPS 15 9520 (Intel i7 12th Gen, 16GB, 512GB)',
    slug: 'dell-xps-15-9520',
    category: 'Laptops',
    condition: 'UK_USED_GRADE_B',
    price: 780000,
    stock_quantity: 2,
    specs: {
      processor: 'Intel Core i7',
      ram: '16GB',
      storage: '512GB SSD',
      battery_health: '86%',
    },
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80'],
  },
  {
    id: 'f3',
    title: 'HP Pavilion 15 (Ryzen 5, 8GB, 256GB SSD)',
    slug: 'hp-pavilion-15-ryzen',
    category: 'Laptops',
    condition: 'NEW',
    price: 490000,
    stock_quantity: 6,
    specs: {
      processor: 'AMD Ryzen 5',
      ram: '8GB',
      storage: '256GB SSD',
    },
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80'],
  },
  {
    id: 'f4',
    title: '5KVA Solar Hybrid Inverter Pure Sine Wave',
    slug: '5kva-solar-hybrid-inverter',
    category: 'Solar Inverters',
    condition: 'NEW',
    price: 450000,
    stock_quantity: 12,
    images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=400&q=80'],
  },
];

export default function Home() {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 px-4 pt-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        <div className="max-w-5xl text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
            <Star className="w-3.5 h-3.5 fill-indigo-300" />
            Ilorin’s Premier Computer & Solar Engineering Firm
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            High-Performance{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
              Laptops
            </span>{' '}
            & Professional{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-300">
              Solar Energy
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400">
            Get grade-A certified UK-used laptops, brand new accessories, expert logic board repairs, and complete solar system surveys and installations—all backed by our verified quality guarantee.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop?dept=computers"
              className="px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-semibold text-white shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              Shop Computers
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/solar"
              className="px-6 py-3 rounded-lg bg-slate-900 hover:bg-slate-850 font-semibold text-slate-200 border border-slate-800 hover:border-slate-750 transition-all flex items-center justify-center gap-2"
            >
              Calculate Solar Load
              <Sun className="w-4 h-4 text-amber-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold">What We Offer</h2>
          <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
            Professional engineering and tech retail services, tailored to your exact productivity and energy requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Laptop Catalog Service */}
          <div className="glass-card p-6 rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Laptop className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Certified Laptops</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Brand new and Grade-A UK Used laptops tested on a 4-point diagnostic rig. Includes battery health reports and structural certifications.
              </p>
            </div>
            <Link
              href="/shop?dept=computers"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-4 group"
            >
              Enter Store
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Repair Service */}
          <div className="glass-card p-6 rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Hardware Repairs</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Component-level logic board repairs, screen replacements, and battery upgrades. Real-time ticket tracking from diagnosis to pickup.
              </p>
            </div>
            <Link
              href="/repairs"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-4 group"
            >
              Book Repair Service
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Solar Engineering Service */}
          <div className="glass-card p-6 rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Sun className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Solar Installations</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Custom off-grid and hybrid inverter configurations. Input your active appliances to calculate power demands and schedule site survey leads.
              </p>
            </div>
            <Link
              href="/solar"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 mt-4 group"
            >
              Get Solar Quote
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Deals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">Hot Deals</span>
            <h2 className="text-2xl sm:text-4xl font-bold mt-1">Featured Equipment</h2>
          </div>
          <Link
            href="/shop"
            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 group"
          >
            View all products
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_MOCK_PRODUCTS.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* Quality Guarantees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl p-8 sm:p-12 border border-slate-800/80 bg-gradient-to-r from-slate-900/60 to-indigo-950/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-lg">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                Verified Quality
              </div>
              <p className="text-sm text-slate-400">
                Every UK used laptop goes through standard stress tests on processor, RAM, and thermals before catalog listing.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                <Wrench className="w-5 h-5 text-emerald-400" />
                Original Spares
              </div>
              <p className="text-sm text-slate-400">
                We only source OEM screens, batteries, and solar materials. Rest easy with replacement parts that last.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
                <Sun className="w-5 h-5 text-amber-400" />
                Engineering Excellence
              </div>
              <p className="text-sm text-slate-400">
                Our solar hybrid installations are fully mapped to property demands to prevent premature battery degradation or inverter overloads.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
