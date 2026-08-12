'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ShoppingCart, ShieldAlert, Cpu, Heart, Check, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/lib/store/cartStore';
import ConditionBadge, { ConditionType } from '@/components/ConditionBadge';
import InspectionChecklist from '@/components/InspectionChecklist';
import { Product } from '@/components/ProductCard';

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
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'],
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
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80'],
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
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'],
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
    images: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80'],
  },
  {
    id: 'b5',
    title: '5KVA Solar Hybrid Inverter Pure Sine Wave',
    slug: '5kva-solar-hybrid-inverter',
    category: 'Solar Inverters',
    condition: 'NEW',
    price: 450000,
    stock_quantity: 12,
    images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=80'],
  },
  {
    id: 'b6',
    title: 'Lithium Iron Phosphate Battery (LiFePO4) 48V 100Ah',
    slug: 'lifepo4-battery-48v-100ah',
    category: 'Batteries',
    condition: 'NEW',
    price: 950000,
    stock_quantity: 8,
    images: ['https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=600&q=80'],
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  const addToCart = useCartStore((state) => state.addToCart);
  const setWhatsAppMessage = useCartStore((state) => state.setWhatsAppMessage);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const { data, error: sbError } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (sbError) throw sbError;

        if (data) {
          setProduct(data as Product);
        } else {
          // Check mock backup
          const backup = BACKUP_PRODUCTS.find((p) => p.slug === slug);
          setProduct(backup || null);
        }
      } catch (err) {
        const backup = BACKUP_PRODUCTS.find((p) => p.slug === slug);
        setProduct(backup || null);
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  // Sync WhatsApp Widget Dynamic Message
  useEffect(() => {
    if (product) {
      const pageUrl = window.location.href;
      setWhatsAppMessage(
        `Hi, I am interested in the "${product.title}" (${product.condition.replace(/_/g, ' ')}) listed at ${formatPrice(product.price)} on your store. URL: ${pageUrl}`
      );
    }
    // Cleanup on page switch
    return () => {
      setWhatsAppMessage('');
    };
  }, [product, setWhatsAppMessage]);

  // Format price in Naira
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-slate-400 text-sm">Retrieving product catalog specs...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="text-slate-400">The product you are trying to view does not exist or has been archived.</p>
        <Link href="/shop" className="inline-flex items-center gap-1 text-indigo-400 font-semibold hover:underline">
          <ChevronLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>
    );
  }

  const hasStock = product.stock_quantity > 0;
  const mainImage = product.images[0] || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80';

  const handleAddToCart = () => {
    addToCart(product as any, qty);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Back to Shop Navigation */}
      <div>
        <Link href="/shop" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Laptop Shop
        </Link>
      </div>

      {/* Main product display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left Col: Images & Inspection Checklist */}
        <div className="space-y-6">
          {/* Main Image View */}
          <div className="aspect-video w-full rounded-2xl bg-slate-900 overflow-hidden border border-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Diagnostic Inspection Checklist for UK Used and Second Hand Laptops */}
          <InspectionChecklist
            condition={product.condition}
            specs={product.specs}
            testingChecklist={(product as any).testing_checklist}
          />
        </div>

        {/* Right Col: Product Info, Price, Cart Actions */}
        <div className="space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <ConditionBadge condition={product.condition} />
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400">
                {product.category}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100 leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Specs Table */}
          {product.specs && (
            <div className="glass-panel p-5 rounded-xl border border-slate-850 space-y-3">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Technical Specifications
              </h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                {product.specs.processor && (
                  <>
                    <span className="text-slate-400">Processor:</span>
                    <span className="text-slate-200 font-medium text-right">{product.specs.processor}</span>
                  </>
                )}
                {product.specs.ram && (
                  <>
                    <span className="text-slate-400">Memory (RAM):</span>
                    <span className="text-slate-200 font-medium text-right">{product.specs.ram}</span>
                  </>
                )}
                {product.specs.storage && (
                  <>
                    <span className="text-slate-400">Storage (SSD):</span>
                    <span className="text-slate-200 font-medium text-right">{product.specs.storage}</span>
                  </>
                )}
                {product.specs.battery_health && (
                  <>
                    <span className="text-slate-400">Battery Health Capacity:</span>
                    <span className="text-emerald-400 font-semibold text-right">{product.specs.battery_health}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Price & Action */}
          <div className="space-y-4 pt-6 border-t border-slate-900">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-extrabold text-indigo-400">
                {formatPrice(product.price)}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                hasStock ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {hasStock ? `${product.stock_quantity} unit(s) left` : 'Out of stock'}
              </span>
            </div>

            {hasStock && (
              <div className="flex gap-4 items-center">
                {/* Quantity picker */}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg">
                  <button
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-slate-200">{qty}</span>
                  <button
                    onClick={() => setQty((prev) => Math.min(product.stock_quantity, prev + 1))}
                    className="px-3 py-2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-grow flex items-center justify-center gap-2 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-lg hover:shadow-indigo-500/20 transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Shopping Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
