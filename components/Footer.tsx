import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Laptop } from 'lucide-react';
import { siteConfig } from '@/lib/siteConfig';

export default function Footer() {
  const { address, contact } = siteConfig;
  const waNumber = contact.whatsapp.replace(/\D/g, '');
  const fullAddress = `${address.street}, ${address.locality}, ${address.region}, ${address.countryName}`;
  return (
    <footer className="bg-slate-950/80 border-t border-slate-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-400">
              <Laptop className="w-6 h-6" />
              <span>RIVA HNTR</span>
            </Link>
            <p className="text-sm text-slate-400">
              High-performance laptop sales (New, UK Used, Second Hand), expert repair services, and premium solar engineering solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/shop" className="hover:text-indigo-400 transition-colors">
                  Laptop Shop
                </Link>
              </li>
              <li>
                <Link href="/repairs" className="hover:text-indigo-400 transition-colors">
                  Repair & Servicing
                </Link>
              </li>
              <li>
                <Link href="/solar" className="hover:text-indigo-400 transition-colors">
                  Solar Energy Setup
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Customer Care</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/track" className="hover:text-indigo-400 transition-colors">
                  Track Order / Ticket
                </Link>
              </li>
              <li>
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-indigo-400 mt-0.5" />
                <span>{contact.telephone}</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-indigo-400 mt-0.5" />
                <span>{contact.email}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 mt-0.5" />
                <span>{fullAddress}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-8 pt-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} RIVA HNTR Technologies. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/admin/dashboard" className="hover:text-indigo-400 transition-colors">
              Staff Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
