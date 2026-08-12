'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart3, TrendingUp, Laptop, Sun, Wrench, RefreshCw, AlertTriangle, ShieldCheck, ClipboardList } from 'lucide-react';

interface Order {
  id: string;
  tracking_number: string;
  total_amount: number;
  payment_gateway: string;
  payment_reference: string | null;
  fulfillment_type: string;
  current_status: string;
  created_at: string;
  guest_info?: {
    name: string;
    email: string;
    phone: string;
    delivery_address: string;
    items?: any[];
  };
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    tracking_number: 'ORD-2026-8910',
    total_amount: 1250000,
    payment_gateway: 'paystack',
    payment_reference: 'pstk_902384029',
    fulfillment_type: 'delivery',
    current_status: 'payment_verified',
    created_at: '2026-08-11T12:00:00Z',
    guest_info: {
      name: 'Adekunle Alao',
      email: 'alao@gmail.com',
      phone: '08023940192',
      delivery_address: '42 Taiwo Road, Ilorin',
      items: [{ id: 'b1', title: 'MacBook Pro 16" Apple M2 Pro', price: 1250000, quantity: 1 }],
    },
  },
  {
    id: 'o2',
    tracking_number: 'ORD-2026-0951',
    total_amount: 450000,
    payment_gateway: 'monnify',
    payment_reference: 'MNFY-REF-1092830',
    fulfillment_type: 'pickup',
    current_status: 'pending_payment',
    created_at: '2026-08-11T10:30:00Z',
    guest_info: {
      name: 'Funmi Nelson',
      email: 'funmi@live.com',
      phone: '09012839281',
      delivery_address: 'In-store Pickup Ilorin',
      items: [{ id: 'b5', title: '5KVA Solar Hybrid Inverter', price: 450000, quantity: 1 }],
    },
  },
];

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        setOrders(data as Order[]);
      } else {
        setOrders(MOCK_ORDERS);
      }
    } catch (err) {
      console.warn('Could not query database orders. Loading mock logs.');
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, trackingNumber: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      
      const { error } = await supabase
        .from('orders')
        .update({ current_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Log status transition
      await supabase.from('status_audit_logs').insert({
        entity_id: orderId,
        entity_type: 'order',
        status: newStatus,
        notes: `Order status manually overrode by sales manager to ${newStatus.toUpperCase().replace(/_/g, ' ')}.`,
      });

      // Update state local
      setOrders(orders.map((ord) => (ord.id === orderId ? { ...ord, current_status: newStatus } : ord)));
      alert(`Order ${trackingNumber} updated to ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      console.error(err);
      // Local state fallback update for mockup demo
      setOrders(orders.map((ord) => (ord.id === orderId ? { ...ord, current_status: newStatus } : ord)));
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalRevenue = orders
    .filter((ord) => ord.current_status !== 'pending_payment' && ord.current_status !== 'cancelled')
    .reduce((sum, ord) => sum + Number(ord.total_amount), 0);

  return (
    <div className="space-y-8">
      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-slate-850 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Certified Revenue</span>
            <span className="text-xl font-extrabold text-indigo-400 mt-1">{formatPrice(totalRevenue)}</span>
          </div>
          <TrendingUp className="w-8 h-8 text-indigo-500/20" />
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-850 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Active Laptops Sold</span>
            <span className="text-xl font-extrabold text-blue-400 mt-1">
              {orders.filter((o) => o.current_status === 'payment_verified').length} units
            </span>
          </div>
          <Laptop className="w-8 h-8 text-blue-500/20" />
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-850 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Solar Leads</span>
            <span className="text-xl font-extrabold text-amber-400 mt-1">18 Leads</span>
          </div>
          <Sun className="w-8 h-8 text-amber-500/20" />
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-850 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Devices in Shop</span>
            <span className="text-xl font-extrabold text-emerald-400 mt-1">9 Tickets</span>
          </div>
          <Wrench className="w-8 h-8 text-emerald-500/20" />
        </div>
      </div>

      {/* Orders List */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
          <h3 className="font-bold text-base text-slate-200 flex items-center gap-1.5">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            Customer Product Orders
          </h3>
          <button
            onClick={loadOrders}
            className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
            Loading invoices...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Tracking Code</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment Info</th>
                  <th className="p-4">Fulfillment</th>
                  <th className="p-4">Status & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-900/30 transition-colors">
                    {/* ID */}
                    <td className="p-4 font-mono font-bold text-slate-200">
                      {order.tracking_number}
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      {order.guest_info ? (
                        <div>
                          <span className="font-semibold text-slate-200 block">{order.guest_info.name}</span>
                          <span className="text-[10px] text-slate-500">{order.guest_info.phone} • {order.guest_info.email}</span>
                          {order.guest_info.items && (
                            <span className="text-[10px] text-indigo-400 block mt-1">
                              Item: {order.guest_info.items[0]?.title} x{order.guest_info.items[0]?.quantity}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">Guest Checkout</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="p-4 font-bold text-slate-200">
                      {formatPrice(order.total_amount)}
                    </td>

                    {/* Gateway */}
                    <td className="p-4">
                      <span className="uppercase text-[9px] font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 block w-fit">
                        {order.payment_gateway}
                      </span>
                      {order.payment_reference ? (
                        <span className="text-[9px] font-mono text-slate-500 block mt-1 line-clamp-1 max-w-[120px]">
                          Ref: {order.payment_reference}
                        </span>
                      ) : (
                        <span className="text-[9px] text-amber-500 font-semibold block mt-1">
                          Unpaid
                        </span>
                      )}
                    </td>

                    {/* fulfillment */}
                    <td className="p-4 capitalize text-slate-400">
                      {order.fulfillment_type}
                    </td>

                    {/* Status Select */}
                    <td className="p-4">
                      {updatingId === order.id ? (
                        <span className="flex items-center gap-1 text-[10px] text-indigo-400">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                        </span>
                      ) : (
                        <select
                          value={order.current_status}
                          onChange={(e) => handleStatusChange(order.id, order.tracking_number, e.target.value)}
                          className="bg-slate-905 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
                        >
                          <option value="pending_payment">Pending Payment</option>
                          <option value="payment_verified">Payment Verified</option>
                          <option value="processing">Processing Order</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="ready_for_pickup">Ready for Pickup</option>
                          <option value="completed">Fulfillment Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
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
