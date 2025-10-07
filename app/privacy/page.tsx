"use client";

import Link from "next/link";
import { ArrowLeft, Shield, Info, Users, Lock, Eye } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen custom-gradient">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#FF1C8B] via-[#A259FF] to-[#6C38CC] bg-clip-text text-transparent tracking-wider drop-shadow-lg" style={{fontFamily:'Montserrat,Druk,sans-serif'}}>LUMOS</h1>
            </div>
            <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium" style={{fontFamily:'Poppins,sans-serif'}}>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4" style={{fontFamily:'Poppins,sans-serif'}}>
            Privacy Policy
          </h1>
          <p className="text-white/60 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
            Last updated: March 2025
          </p>
        </div>

        {/* Privacy Commitment */}
        <div className="bg-green-900/20 border border-green-600/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-green-400 font-bold mb-2" style={{fontFamily:'Poppins,sans-serif'}}>Our Privacy Commitment</h3>
              <p className="text-white/80 text-sm leading-relaxed" style={{fontFamily:'Poppins,sans-serif'}}>
                At Lumos AI, we are committed to protecting your privacy and ensuring the security of your personal information. This 
                Privacy Policy explains how we collect, use, protect, and share your information when you use our services.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Policy Content */}
        <div className="space-y-8">
          {/* 1. Information We Collect */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-6">
              <Info className="w-6 h-6 text-[#A259FF] flex-shrink-0 mt-1" />
              <h2 className="text-xl font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                1. Information We Collect
              </h2>
            </div>
            
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3" style={{fontFamily:'Poppins,sans-serif'}}>Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-white/80" style={{fontFamily:'Poppins,sans-serif'}}>
                  <li>Email address (for account creation and authentication)</li>
                  <li>Username and profile information</li>
                  <li>Communication preferences</li>
                  <li>Support and feedback communications</li>
                </ul>
              </div>

              {/* Usage Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3" style={{fontFamily:'Poppins,sans-serif'}}>Usage Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-white/80" style={{fontFamily:'Poppins,sans-serif'}}>
                  <li>Platform usage patterns and feature interactions</li>
                  <li>Search queries and trading preferences</li>
                  <li>Device information and browser type</li>
                  <li>IP address and general location data</li>
                  <li>Session duration and frequency of use</li>
                </ul>
              </div>

              {/* Technical Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3" style={{fontFamily:'Poppins,sans-serif'}}>Technical Information</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-white/80" style={{fontFamily:'Poppins,sans-serif'}}>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Log files and error reports</li>
                  <li>Performance and analytics data</li>
                  <li>API usage and integration data</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-6">
              <Users className="w-6 h-6 text-[#A259FF] flex-shrink-0 mt-1" />
              <h2 className="text-xl font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                2. How We Use Your Information
              </h2>
            </div>
            
            <p className="text-white/80 mb-4" style={{fontFamily:'Poppins,sans-serif'}}>
              We use the information we collect to:
            </p>

            <div className="space-y-6">
              {/* Provide and Improve Our Services */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3" style={{fontFamily:'Poppins,sans-serif'}}>Provide and Improve Our Services</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-white/80" style={{fontFamily:'Poppins,sans-serif'}}>
                  <li>Deliver personalized trading insights and analytics</li>
                  <li>Provide AI-powered chat assistance and recommendations</li>
                  <li>Customize your dashboard and user experience</li>
                  <li>Improve our algorithms and analytical capabilities</li>
                  <li>Develop new features and services</li>
                </ul>
              </div>

              {/* Communication and Support */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3" style={{fontFamily:'Poppins,sans-serif'}}>Communication and Support</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-white/80" style={{fontFamily:'Poppins,sans-serif'}}>
                  <li>Send important service updates and notifications</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Share educational content and market insights</li>
                  <li>Notify you about new features and improvements</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Data Security */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-6">
              <Lock className="w-6 h-6 text-[#A259FF] flex-shrink-0 mt-1" />
              <h2 className="text-xl font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                3. Data Security
              </h2>
            </div>
            
            <p className="text-white/80 mb-4" style={{fontFamily:'Poppins,sans-serif'}}>
              We implement industry-standard security measures to protect your personal information:
            </p>

            <ul className="list-disc list-inside space-y-2 ml-4 text-white/80 mb-6" style={{fontFamily:'Poppins,sans-serif'}}>
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Limited access to personal information on a need-to-know basis</li>
              <li>Secure data centers with physical and digital protections</li>
              <li>Regular backup and disaster recovery procedures</li>
            </ul>

            <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <p className="text-blue-400 font-semibold mb-2" style={{fontFamily:'Poppins,sans-serif'}}>Important:</p>
              <p className="text-white/80 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
                While we strive to protect your personal information, no method of transmission over the internet or 
                electronic storage is 100% secure. We cannot guarantee absolute security but are committed to protecting your data 
                using industry best practices.
              </p>
            </div>
          </section>

          {/* 4. Your Rights and Choices */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-6">
              <Eye className="w-6 h-6 text-[#A259FF] flex-shrink-0 mt-1" />
              <h2 className="text-xl font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                4. Your Rights and Choices
              </h2>
            </div>
            
            <p className="text-white/80 mb-6" style={{fontFamily:'Poppins,sans-serif'}}>
              You have the following rights regarding your personal information:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2" style={{fontFamily:'Poppins,sans-serif'}}>Access and Portability</h3>
                  <p className="text-white/70 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
                    Request a copy of your personal information and data portability.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2" style={{fontFamily:'Poppins,sans-serif'}}>Deletion</h3>
                  <p className="text-white/70 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
                    Request deletion of your personal information (subject to legal requirements).
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2" style={{fontFamily:'Poppins,sans-serif'}}>Correction</h3>
                  <p className="text-white/70 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
                    Update or correct inaccurate personal information.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2" style={{fontFamily:'Poppins,sans-serif'}}>Opt-out</h3>
                  <p className="text-white/70 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
                    Unsubscribe from marketing communications and notifications.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-semibold text-white mb-2" style={{fontFamily:'Poppins,sans-serif'}}>How to Exercise Your Rights</h3>
              <p className="text-white/70 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
                To exercise any of these rights, please contact us through our platform or support channels. We will respond to your 
                request within 30 days and may require verification of your identity.
              </p>
            </div>
          </section>

          {/* 5. Contact Us */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-6">
              <Info className="w-6 h-6 text-[#A259FF] flex-shrink-0 mt-1" />
              <h2 className="text-xl font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                5. Contact Us
              </h2>
            </div>
            
            <p className="text-white/80 mb-6" style={{fontFamily:'Poppins,sans-serif'}}>
              If you have any questions about this Privacy Policy or our privacy practices, please contact us:
            </p>

            <div className="space-y-4 text-white/80" style={{fontFamily:'Poppins,sans-serif'}}>
              <div>
                <span className="font-semibold text-white">Through our platform:</span> Use the support chat or contact form
              </div>
              <div>
                <span className="font-semibold text-white">Privacy inquiries:</span> Use our dedicated privacy contact form
              </div>
              <div>
                <span className="font-semibold text-white">Data protection officer:</span> Available for EU/UK residents
              </div>
            </div>

            <p className="text-white/70 text-sm mt-6" style={{fontFamily:'Poppins,sans-serif'}}>
              We will respond to your privacy-related inquiries within 30 days and work to resolve any concerns you may have about our 
              privacy practices.
            </p>
          </section>
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-12 pt-8 border-t border-white/10">
          <p className="text-white/60 text-sm mb-6" style={{fontFamily:'Poppins,sans-serif'}}>
            Your privacy is important to us. We are committed to protecting your personal information and being transparent about our data 
            practices.
          </p>
          <Link href="/">
            <button className="px-8 py-3 bg-gradient-to-r from-[#1fffc3] to-[#00d4aa] text-black font-bold rounded-xl hover:scale-105 transition-all duration-200" style={{fontFamily:'Poppins,sans-serif'}}>
              Return to Lumos AI
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}