'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Package, Edit3, Trash2, CheckCircle2, XCircle, RefreshCw, Layers } from 'lucide-react';
import ConditionBadge, { ConditionType } from '@/components/ConditionBadge';
import { Product } from '@/components/ProductCard';

const INITIAL_MOCK_INVENTORY: Product[] = [
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
];

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // New Product Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Laptops');
  const [condition, setCondition] = useState<ConditionType>('NEW');
  const [price, setPrice] = useState(300000);
  const [stock, setStock] = useState(5);
  
  // Specs Form
  const [processor, setProcessor] = useState('');
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');
  const [batteryHealth, setBatteryHealth] = useState('100%');

  // Diagnostic Checklist
  const [screenPass, setScreenPass] = useState(true);
  const [keyboardPass, setKeyboardPass] = useState(true);
  const [thermalsPass, setThermalsPass] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        setProducts(data as Product[]);
      } else {
        setProducts(INITIAL_MOCK_INVENTORY);
      }
    } catch (err) {
      console.warn('Unable to query database products. Displaying fallbacks.');
      setProducts(INITIAL_MOCK_INVENTORY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleUpdateStock = async (productId: string, newStock: number) => {
    if (newStock < 0) return;
    try {
      const { error } = await supabase.from('products').update({ stock_quantity: newStock }).eq('id', productId);
      if (error) throw error;
      setProducts(products.map((p) => (p.id === productId ? { ...p, stock_quantity: newStock } : p)));
    } catch (err) {
      // Local state fallback update
      setProducts(products.map((p) => (p.id === productId ? { ...p, stock_quantity: newStock } : p)));
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProd = {
      title,
      slug,
      category,
      condition,
      price,
      stock_quantity: stock,
      specs: {
        processor,
        ram,
        storage,
        battery_health: condition !== 'NEW' ? batteryHealth : undefined,
      },
      testing_checklist: condition !== 'NEW' ? {
        screen: screenPass ? 'Pass' : 'Fail',
        keyboard: keyboardPass ? 'Pass' : 'Fail',
        thermals: thermalsPass ? 'Pass' : 'Fail',
      } : undefined,
      images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80'],
      is_active: true,
    };

    try {
      const { data, error } = await supabase.from('products').insert(newProd).select().single();
      if (error) throw error;
      setProducts([data as Product, ...products]);
      alert('Product created successfully in database!');
    } catch (err) {
      console.warn('Database failed. Adding locally to mock view.', err);
      const localMock: Product = {
        id: Date.now().toString(),
        ...newProd,
      };
      setProducts([localMock, ...products]);
    }

    // Reset Form
    setTitle('');
    setProcessor('');
    setRam('');
    setStorage('');
    setBatteryHealth('100%');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header buttons */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <h3 className="font-bold text-base text-slate-200 flex items-center gap-1.5">
          <Package className="w-5 h-5 text-indigo-400" />
          Storefront Inventory Manager
        </h3>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 font-semibold text-white rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product Listing
          </button>
          <button
            onClick={loadProducts}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <div className="glass-panel p-6 rounded-xl border border-indigo-500/20 space-y-4 animate-fadeIn">
          <h4 className="font-bold text-sm text-slate-200">Create New Catalog Listing</h4>
          <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-slate-400 block">Product Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dell Latitude 7490 (Core i5, 8GB RAM)"
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
              >
                <option value="Laptops">Laptops</option>
                <option value="Accessories">Accessories</option>
                <option value="Solar Inverters">Solar Inverters</option>
                <option value="Batteries">Batteries</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ConditionType)}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
              >
                <option value="NEW">Brand New</option>
                <option value="UK_USED_GRADE_A">UK Used - Grade A</option>
                <option value="UK_USED_GRADE_B">UK Used - Grade B</option>
                <option value="SECOND_HAND">Local Second Hand</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block">Price (₦)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block">In-Stock Quantity</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
              />
            </div>

            {/* Specifications */}
            <div className="sm:col-span-3 pt-3 border-t border-slate-850 space-y-2">
              <h5 className="font-bold text-[10px] uppercase text-indigo-400 tracking-wider">Specifications</h5>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 block">Processor</label>
                  <input
                    type="text"
                    value={processor}
                    onChange={(e) => setProcessor(e.target.value)}
                    placeholder="Intel i7 11th Gen"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 block">Memory RAM</label>
                  <input
                    type="text"
                    value={ram}
                    onChange={(e) => setRam(e.target.value)}
                    placeholder="16GB"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 block">Storage</label>
                  <input
                    type="text"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    placeholder="512GB SSD"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
                {condition !== 'NEW' && (
                  <div className="space-y-1">
                    <label className="text-slate-400 block">Battery Health</label>
                    <input
                      type="text"
                      value={batteryHealth}
                      onChange={(e) => setBatteryHealth(e.target.value)}
                      placeholder="92%"
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Checklist */}
            {condition !== 'NEW' && (
              <div className="sm:col-span-3 pt-3 border-t border-slate-850 space-y-2">
                <h5 className="font-bold text-[10px] uppercase text-indigo-400 tracking-wider">Quality Inspection Checklist</h5>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={screenPass}
                      onChange={(e) => setScreenPass(e.target.checked)}
                      className="accent-indigo-500"
                    />
                    Screen Pass
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={keyboardPass}
                      onChange={(e) => setKeyboardPass(e.target.checked)}
                      className="accent-indigo-500"
                    />
                    Keyboard Pass
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={thermalsPass}
                      onChange={(e) => setThermalsPass(e.target.checked)}
                      className="accent-indigo-500"
                    />
                    Thermals Pass
                  </label>
                </div>
              </div>
            )}

            <div className="sm:col-span-3 flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded bg-slate-900 border border-slate-800 text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded font-bold cursor-pointer"
              >
                Insert to Inventory
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inventory table */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
            Loading catalog details...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Product Info</th>
                  <th className="p-4">Condition</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-center">Adjust Stock</th>
                  <th className="p-4">Fulfillment Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-350">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-slate-200 block text-sm">{prod.title}</span>
                      <span className="text-[10px] text-slate-500">{prod.category} • slug: {prod.slug}</span>
                    </td>
                    <td className="p-4">
                      <ConditionBadge condition={prod.condition} className="py-0.5 text-[9px]" />
                    </td>
                    <td className="p-4 font-bold text-slate-200">
                      ₦{prod.price.toLocaleString('en-NG')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleUpdateStock(prod.id, prod.stock_quantity - 1)}
                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-slate-200">
                          {prod.stock_quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateStock(prod.id, prod.stock_quantity + 1)}
                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      {prod.stock_quantity > 0 ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Sold Out
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
