'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Eye, ArrowRight } from 'lucide-react';
import ConditionBadge, { ConditionType } from './ConditionBadge';
import { useCartStore } from '@/lib/store/cartStore';

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  condition: ConditionType;
  price: number;
  stock_quantity: number;
  specs?: {
    ram?: string;
    storage?: string;
    processor?: string;
    battery_health?: string;
  } | null;
  images: string[];
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  // Format price in Naira
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const hasStock = product.stock_quantity > 0;
  const mainImage = product.images[0] || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product as any, 1);
  };

  return (
    <div className="glass-card flex flex-col justify-between h-full rounded-xl overflow-hidden group">
      {/* Product Image and Condition Badge */}
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 z-10">
          <ConditionBadge condition={product.condition} />
        </div>
        {!hasStock && (
          <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center backdrop-blur-[2px]">
            <span className="px-3 py-1.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            {product.category}
          </span>
          <h3 className="font-semibold text-base text-slate-200 mt-1 line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {product.title}
          </h3>

          {/* Quick Specs */}
          {product.specs && (
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-slate-400">
              {product.specs.processor && (
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]">
                  {product.specs.processor}
                </span>
              )}
              {product.specs.ram && (
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]">
                  {product.specs.ram} RAM
                </span>
              )}
              {product.specs.storage && (
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]">
                  {product.specs.storage} SSD
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price & Cart Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-900">
          <div>
            <span className="text-[10px] text-slate-500 block">Price</span>
            <span className="font-bold text-lg text-indigo-400">{formatPrice(product.price)}</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/shop/${product.slug}`}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-400 hover:text-slate-200 transition-all"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={!hasStock}
              className={`flex items-center justify-center p-2 rounded-lg transition-all ${
                hasStock
                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg hover:shadow-indigo-500/20'
                  : 'bg-slate-800 text-slate-600 border border-slate-900 cursor-not-allowed'
              }`}
              title="Add to cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
