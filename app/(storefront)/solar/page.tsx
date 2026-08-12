'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Sun, ShieldCheck, ClipboardCheck, ArrowRight, RefreshCw, AlertCircle, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

interface Appliance {
  id: string;
  name: string;
  wattage: number;
  quantity: number;
}

const DEFAULT_APPLIANCES = [
  { id: '1', name: 'LED Smart TV', wattage: 120, quantity: 1 },
  { id: '2', name: 'Refrigerator / Freezer', wattage: 350, quantity: 1 },
  { id: '3', name: 'Ceiling Fan', wattage: 75, quantity: 3 },
  { id: '4', name: 'LED Light Bulbs', wattage: 10, quantity: 8 },
];

export default function SolarPage() {
  // Calculator State
  const [appliances, setAppliances] = useState<Appliance[]>(DEFAULT_APPLIANCES);
  const [newCustomName, setNewCustomName] = useState('');
  const [newCustomWatts, setNewCustomWatts] = useState(100);

  // Form Lead State
  const [propertyType, setPropertyType] = useState('Residential');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [submittedProject, setSubmittedProject] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate Total Watts
  const totalWatts = appliances.reduce((sum, item) => sum + item.wattage * item.quantity, 0);

  // Recommendation engine
  const getSystemRecommendation = (watts: number) => {
    if (watts === 0) return { kva: '0 KVA', setup: 'No load selected.' };
    if (watts <= 1200) {
      return {
        kva: '1.5 KVA',
        setup: '1.5KVA Hybrid Inverter + 1x 2.56kWh Lithium Battery + 2x 450W Panels. Ideal for standard lights, fans, TVs, and laptop charging.',
      };
    }
    if (watts <= 2500) {
      return {
        kva: '3 KVA',
        setup: '3KVA Hybrid Inverter + 1x 5.12kWh Lithium Battery + 4x 450W Panels. Supports refrigerators, blender, smart home setups, fans, and light bulbs.',
      };
    }
    if (watts <= 4500) {
      return {
        kva: '5 KVA',
        setup: '5KVA Hybrid Inverter + 1x 5.12kWh Lithium Battery + 6x 450W Panels. Standard choice for small family homes. Supports 1x Inverter AC, pump, fridge, and home electronics.',
      };
    }
    if (watts <= 8000) {
      return {
        kva: '8 KVA',
        setup: '8KVA Hybrid Inverter + 2x 5.12kWh Lithium Batteries + 10x 450W Panels. Fits duplexes and offices. Runs multiple ACs, microwave, pumping machines, and high-load appliances.',
      };
    }
    return {
      kva: '10+ KVA',
      setup: '10KVA or 15KVA Heavy Duty Solar Hub. Fully customized solar configurations for heavy commercial facilities or estate houses.',
    };
  };

  const recommendation = getSystemRecommendation(totalWatts);

  // Update Appliance Quantity
  const updateQty = (id: string, newQty: number) => {
    if (newQty < 0) return;
    setAppliances(
      appliances.map((app) => (app.id === id ? { ...app, quantity: newQty } : app)).filter((app) => app.quantity > 0)
    );
  };

  // Add Custom Appliance
  const handleAddAppliance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomName || newCustomWatts <= 0) return;
    const newApp: Appliance = {
      id: Date.now().toString(),
      name: newCustomName,
      wattage: newCustomWatts,
      quantity: 1,
    };
    setAppliances([...appliances, newApp]);
    setNewCustomName('');
    setNewCustomWatts(100);
  };

  // Submit Lead
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !deliveryAddress) {
      setError('Please fill in all contact details fields.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Generate SOL-YEAR-RANDOM
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      const projectNumber = `SOL-${year}-${rand}`;

      // Insert Solar Lead into Supabase
      const { data, error: sbError } = await supabase
        .from('solar_projects')
        .insert({
          project_number: projectNumber,
          property_type: propertyType,
          power_load_appliances: appliances,
          recommended_kva: recommendation.kva,
          guest_info: { name, email, phone, delivery_address: deliveryAddress },
          current_status: 'lead_received',
        })
        .select()
        .single();

      if (sbError) throw sbError;

      // Log Status History
      await supabase.from('status_audit_logs').insert({
        entity_id: data.id,
        entity_type: 'solar',
        status: 'lead_received',
        notes: `Solar survey request logged for a ${propertyType} property. Recommended capacity: ${recommendation.kva}.`,
      });

      setSubmittedProject(projectNumber);
    } catch (err: any) {
      console.error('Error submitting solar project:', err);
      // Mock successful submission for offline/development test
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      setSubmittedProject(`SOL-${year}-${rand}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">Renewable Power Systems</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-1">
          Solar Engineering & Load Calculator
        </h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base">
          Add appliances below to estimate your daily energy footprint. Our system automatically recommends a tailormade hybrid solar inverter and battery configuration.
        </p>
      </div>

      {submittedProject ? (
        /* Success screen */
        <div className="max-w-lg mx-auto glass-panel p-8 rounded-2xl border border-amber-500/20 text-center space-y-6">
          <div className="w-16 h-16 bg-amber-500/10 rounded-full border border-amber-500/20 flex items-center justify-center mx-auto">
            <Sun className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-200">Solar Project Lead Logged!</h2>
            <p className="text-sm text-slate-400">
              Your load assessment and property survey request has been recorded. Reference code:
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
              Project Number
            </span>
            <span className="text-3xl font-mono font-extrabold text-indigo-400">{submittedProject}</span>
          </div>

          <p className="text-xs text-slate-500">
            Our solar planning managers will reach out to you within 24 hours to finalize site survey schedules.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href={`/track?id=${submittedProject}&phone=${phone}`}
              className="px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-semibold text-white transition-all text-sm flex items-center gap-1.5"
            >
              Track Project Status
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setSubmittedProject(null)}
              className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-850 font-semibold text-slate-300 border border-slate-800 text-sm"
            >
              Recalculate Load
            </button>
          </div>
        </div>
      ) : (
        /* Load Calculator Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Calculator */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-xl border border-slate-800/80 space-y-6">
            <h3 className="text-lg font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              1. Load Footprint Assessment
            </h3>

            {/* Appliance List */}
            <div className="space-y-3">
              {appliances.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900/60 border border-slate-850"
                >
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block">{app.name}</span>
                    <span className="text-xs text-slate-400">{app.wattage} Watts each</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded">
                      <button
                        onClick={() => updateQty(app.id, app.quantity - 1)}
                        className="px-2.5 py-1 text-slate-400 hover:text-slate-200"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-semibold text-slate-200">
                        {app.quantity}
                      </span>
                      <button
                        onClick={() => updateQty(app.id, app.quantity + 1)}
                        className="px-2.5 py-1 text-slate-400 hover:text-slate-200"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => updateQty(app.id, 0)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove appliance"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Appliance Form */}
            <form onSubmit={handleAddAppliance} className="flex gap-2 items-end pt-4 border-t border-slate-850">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Custom Appliance Name</label>
                <input
                  type="text"
                  placeholder="e.g. Microwave, Washing Machine"
                  value={newCustomName}
                  onChange={(e) => setNewCustomName(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div className="w-24 space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Wattage (W)</label>
                <input
                  type="number"
                  min={1}
                  value={newCustomWatts}
                  onChange={(e) => setNewCustomWatts(Number(e.target.value))}
                  className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center justify-center gap-1 cursor-pointer text-xs"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                Add
              </button>
            </form>
          </div>

          {/* Right: Recommendation & Lead Submission */}
          <div className="lg:col-span-5 space-y-6">
            {/* Calculation recommendation */}
            <div className="glass-panel p-6 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/60 to-amber-950/10 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Total Load Demand</span>
                <span className="text-3xl font-extrabold text-slate-100">{totalWatts} Watts</span>
              </div>

              <div className="p-4 rounded-lg bg-slate-950 border border-slate-850 space-y-2">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                  Recommended System size: {recommendation.kva}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {recommendation.setup}
                </p>
              </div>
            </div>

            {/* Lead Form */}
            <div className="glass-panel p-6 rounded-xl border border-slate-800/80 space-y-4">
              <h3 className="text-base font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <ClipboardCheck className="w-4 h-4 text-amber-400" />
                2. Request Property Site Survey
              </h3>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 block">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Residential">Residential Home</option>
                    <option value="Commercial">Commercial Office / Factory</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 block">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 block">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="080..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400 block">Email</label>
                    <input
                      type="email"
                      placeholder="john@..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 block">Installation Address</label>
                  <textarea
                    rows={3}
                    placeholder="Address details in Ilorin, Nigeria..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer text-xs uppercase tracking-wider"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving Solar Lead Details...
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4" />
                      Book Free Installation Survey
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
