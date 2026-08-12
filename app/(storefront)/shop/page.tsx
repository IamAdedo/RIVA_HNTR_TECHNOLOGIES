'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, Search, SlidersHorizontal, AlertCircle, RefreshCw } from 'lucide-react';
import ProductCard, { Product } from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { ConditionType } from '@/components/ConditionBadge';
import { DEPARTMENTS, DepartmentSlug, departmentOf } from '@/lib/siteConfig';

// Storefront departments keep computers separate from solar (see lib/siteConfig).
type DeptFilter = 'all' | DepartmentSlug;

const BACKUP_PRODUCTS: Product[] = [
  {
    id: 'b1',
    title: 'MacBook Pro 16" Apple M2 Pro (16GB, 512GB SSD)',
    slug: 'macbook-pro-16-m2-pro',
    category: 'Laptops',
    condition: 'UK_USED_GRADE_A',
    price: 1250000,
    stock_quantity: 4,
    specs: { processor: 'Apple M2 Pro', ram: '16GB', storage: '512GB SSD', battery_health: '94%' },
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80'],
  },
  {
    id: 'b2',
    title: 'Dell XPS 15 9520 (Intel i7 12th Gen, 16GB, 512GB)',
    slug: 'dell-xps-15-9520',
    category: 'Laptops',
    condition: 'UK_USED_GRADE_B',
    price: 780000,
    stock_quantity: 2,
    specs: { processor: 'Intel Core i7', ram: '16GB', storage: '512GB SSD', battery_health: '86%' },
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80'],
  },
  {
    id: 'b3',
    title: 'HP Pavilion 15 (Ryzen 5, 8GB, 256GB SSD)',
    slug: 'hp-pavilion-15-ryzen',
    category: 'Laptops',
    condition: 'NEW',
    price: 490000,
    stock_quantity: 6,
    specs: { processor: 'AMD Ryzen 5', ram: '8GB', storage: '256GB SSD' },
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80'],
  },
  {
    id: 'b4',
    title: 'Lenovo ThinkPad T14 Gen 2 (Intel i5, 16GB, 256GB)',
    slug: 'lenovo-thinkpad-t14-gen-2',
    category: 'Laptops',
    condition: 'UK_USED_GRADE_A',
    price: 360000,
    stock_quantity: 5,
    specs: { processor: 'Intel Core i5', ram: '16GB', storage: '256GB SSD', battery_health: '90%' },
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80'],
  },
  {
    id: 'b5',
    title: '5KVA Solar Hybrid Inverter Pure Sine Wave',
    slug: '5kva-solar-hybrid-inverter',
    category: 'Solar Inverters',
    condition: 'NEW',
    price: 450000,
    stock_quantity: 12,
    images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=400&q=80'],
  },
  {
    id: 'b6',
    title: 'Lithium Iron Phosphate Battery (LiFePO4) 48V 100Ah',
    slug: 'lifepo4-battery-48v-100ah',
    category: 'Batteries',
    condition: 'NEW',
    price: 950000,
    stock_quantity: 8,
    images: ['https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=400&q=80'],
  },
];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState<DeptFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(1500000);

  // Preselect the department from the `?dept=` query (e.g. links from the nav).
  useEffect(() => {
    const dept = new URLSearchParams(window.location.search).get('dept');
    if (dept === 'computers' || dept === 'solar') {
      setDepartment(dept);
    }
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const { data, error: sbError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true);

        if (sbError) throw sbError;

        if (data && data.length > 0) {
          setProducts(data as Product[]);
        } else {
          // If Supabase table is empty or doesn't exist yet, load backup
          setProducts(BACKUP_PRODUCTS);
        }
      } catch (err: any) {
        console.error('Error fetching products from database. Loading fallbacks.', err);
        setProducts(BACKUP_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const departmentTabs: { label: string; value: DeptFilter }[] = [
    { label: 'All Departments', value: 'all' },
    { label: DEPARTMENTS.computers.label, value: 'computers' },
    { label: DEPARTMENTS.solar.label, value: 'solar' },
  ];

  const changeDepartment = (value: DeptFilter) => {
    setDepartment(value);
    setSelectedCategory('All'); // avoid a stale category from the other department
  };

  // Products in the selected department drive both the grid and the category list.
  const departmentProducts = products.filter(
    (prod) => department === 'all' || departmentOf(prod.category) === department
  );

  // Category options reflect what actually exists in the current department.
  const categories = ['All', ...Array.from(new Set(departmentProducts.map((p) => p.category)))];
  const conditions = [
    { label: 'All Conditions', value: 'All' },
    { label: 'Brand New', value: 'NEW' },
    { label: 'UK Used - Grade A', value: 'UK_USED_GRADE_A' },
    { label: 'UK Used - Grade B', value: 'UK_USED_GRADE_B' },
    { label: 'Local Second Hand', value: 'SECOND_HAND' },
  ];

  // Filtering Logic (scoped to the selected department)
  const filteredProducts = departmentProducts.filter((prod) => {
    const matchesSearch = prod.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || prod.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesCondition =
      selectedCondition === 'All' || prod.condition === selectedCondition;
    const matchesPrice = prod.price <= maxPrice;

    return matchesSearch && matchesCategory && matchesCondition && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Page Title */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">Catalog</span>
          <h1 className="text-3xl font-extrabold text-slate-100 mt-1">Shop Equipment & Accessories</h1>
          <p className="text-sm text-slate-400 mt-1">
            {department === 'computers'
              ? 'Laptops, desktops and computer accessories.'
              : department === 'solar'
              ? 'Solar inverters, batteries, panels and accessories.'
              : 'Computers & accessories and solar equipment — all in one place.'}
          </p>
        </div>

        {/* Department tabs — keep computers separate from solar */}
        <div className="flex flex-wrap gap-2">
          {departmentTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => changeDepartment(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                department === tab.value
                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                  : 'text-slate-300 border-slate-800 hover:bg-slate-900 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Filters (Sidebar) + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="glass-panel p-6 rounded-xl border border-slate-800/80 space-y-6 h-fit lg:sticky lg:top-24">
          <div className="flex items-center gap-2 font-bold text-slate-200 border-b border-slate-800 pb-3">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            Filters
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block">Search Products</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block">Category</label>
            <div className="flex flex-col gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left text-sm py-1.5 px-2.5 rounded transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-500/10 text-indigo-300 font-semibold border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 block">Condition</label>
            <div className="flex flex-col gap-1">
              {conditions.map((cond) => (
                <button
                  key={cond.value}
                  onClick={() => setSelectedCondition(cond.value)}
                  className={`text-left text-sm py-1.5 px-2.5 rounded transition-all ${
                    selectedCondition === cond.value
                      ? 'bg-indigo-500/10 text-indigo-300 font-semibold border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  {cond.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-400">
              <span>Max Price</span>
              <span className="text-indigo-400 font-bold">
                ₦{maxPrice.toLocaleString('en-NG')}
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={1500000}
              step={10000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 rounded-lg appearance-none h-1.5"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-slate-400 text-sm">Loading catalog items...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="glass-panel text-center py-20 rounded-xl border border-slate-850">
              <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-350">No products found</h3>
              <p className="text-slate-400 text-sm mt-1">
                Try loosening your filters or typing another search keyword.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
