'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquareCode } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';

export default function WhatsAppWidget() {
  const pathname = usePathname();
  const storeMessage = useCartStore((state) => state.whatsAppMessage);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+2348000000000';

  useEffect(() => {
    let message = 'Hi, I have a question about your products and services.';

    if (storeMessage) {
      message = storeMessage;
    } else if (pathname.includes('/shop/')) {
      // PDP default message, but usually the page will set storeMessage
      message = `Hi, I am interested in a laptop listed on your store at ${window.location.href}`;
    } else if (pathname.includes('/track')) {
      message = 'Hi, I need help regarding my order or service tracking status.';
    } else if (pathname.includes('/solar')) {
      message = 'Hi, I would like to schedule a site survey for a solar installation.';
    } else if (pathname.includes('/repairs')) {
      message = 'Hi, I would like to make an inquiry regarding my laptop repair/servicing.';
    }

    const encodedText = encodeURIComponent(message);
    setWhatsappUrl(`https://wa.me/${phoneNumber.replace('+', '')}?text=${encodedText}`);
  }, [pathname, storeMessage, phoneNumber]);

  // Don't show in admin portal
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 hover:rotate-6 border border-emerald-400/20 group"
      aria-label="Contact on WhatsApp"
    >
      {/* Outer Pulse */}
      <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping group-hover:animate-none" />
      <MessageSquareCode className="w-7 h-7 relative z-10" />
    </a>
  );
}
