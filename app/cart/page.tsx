'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cartStore';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, Plus, Minus, Cpu } from 'lucide-react';
import ConditionBadge from '@/components/ConditionBadge';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Format price in Naira
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading shopping cart state...
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-200">Your Shopping Cart is Empty</h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            You haven&apos;t added any laptops or computer accessories to your shopping cart yet.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-semibold text-white transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">Purchase Flow</span>
        <h1 className="text-3xl font-extrabold text-slate-100 mt-1">Shopping Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass-panel p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row gap-4 items-center justify-between"
            >
              {/* Product Info Left */}
              <div className="flex items-center gap-4 flex-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.images[0] || 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=150&q=80'}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-lg bg-slate-900 border border-slate-800"
                />
                <div className="space-y-1">
                  <ConditionBadge condition={item.condition} className="py-0.5 text-[9px]" />
                  <h3 className="font-bold text-sm text-slate-200 line-clamp-1">
                    {item.title}
                  </h3>
                  {item.specs && (
                    <div className="text-[10px] text-slate-500 flex gap-2">
                      {item.specs.processor && <span>{item.specs.processor}</span>}
                      {item.specs.ram && <span>• {item.specs.ram} RAM</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Controls Right */}
              <div className="flex items-center gap-6 justify-between w-full sm:w-auto">
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs font-semibold text-slate-200">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Total</span>
                  <span className="font-bold text-sm text-indigo-400">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </button>

            <Link
              href="/shop"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Add More Products
            </Link>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-xl border border-slate-800/80 space-y-6">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">
            Summary Details
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Subtotal:</span>
              <span className="text-slate-200 font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">VAT & Taxes (included):</span>
              <span className="text-slate-400 font-medium">₦0</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Fulfillment Type:</span>
              <span className="text-slate-400 font-medium">In-store pickup / Delivery</span>
            </div>

            <div className="border-t border-slate-850 pt-3 flex justify-between font-bold text-base">
              <span className="text-slate-350">Subtotal</span>
              <span className="text-indigo-400">{formatPrice(subtotal)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-lg hover:shadow-indigo-500/20 transition-all text-sm uppercase tracking-wider"
          >
            Checkout Securely
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
