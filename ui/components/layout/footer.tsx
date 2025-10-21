"use client";

import React from "react";
import { FooterBackgroundGradient, TextHoverEffect } from "@/components/ui/text-hover-effect";

export default function Footer() {
  return (
    <footer className="relative w-full bg-black text-gray-300 py-16 overflow-hidden mt-auto">
      {/* Nền gradient */}
      <FooterBackgroundGradient />

      <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Cột 1 - About Us */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">About Us</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-[#3ca2fa] transition-colors">Company History</li>
            <li className="hover:text-[#3ca2fa] transition-colors">Meet the Team</li>
            <li className="hover:text-[#3ca2fa] transition-colors">Employee Handbook</li>
            <li className="hover:text-[#3ca2fa] transition-colors">Careers</li>
          </ul>
        </div>

        {/* Cột 2 - Helpful Links */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">Helpful Links</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-[#3ca2fa] transition-colors">FAQs</li>
            <li className="hover:text-[#3ca2fa] transition-colors">Support</li>
            <li className="hover:text-[#3ca2fa] transition-colors">Live Chat</li>
          </ul>
        </div>

        {/* Cột 3 - Contact Us */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">Contact Us</h3>
          <ul className="space-y-2 text-sm">
            <li className="hover:text-[#3ca2fa] transition-colors">hello@admin.com</li>
            <li className="hover:text-[#3ca2fa] transition-colors">0367525400</li>
            <li className="hover:text-[#3ca2fa] transition-colors">DN, Viet Nam</li>
          </ul>
        </div>

        {/* Cột 4 - About */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-3">About OceanFin</h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            OceanFin is a modern React and Next.js based UI component library.
          </p>
        </div>
      </div>

      {/* Logo / Hiệu ứng chữ OceanFin */}
      <div className="relative z-10 flex flex-col items-center justify-center mt-8">
        <div className="w-full max-w-[600px] h-[150px]">
            <TextHoverEffect text="OceanFin" duration={0.4} />
        </div>
        <p className="text-gray-400 text-sm mt-4">
            © {new Date().getFullYear()} OceanFin. All rights reserved.
        </p>
     </div>

    </footer>
  );
}
