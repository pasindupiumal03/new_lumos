"use client";

import Link from "next/link";
import { ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";

export default function TermsOfService() {
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
            Terms of Service
          </h1>
          <p className="text-white/60 text-sm" style={{fontFamily:'Poppins,sans-serif'}}>
            Last updated: March 2025
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-yellow-400 font-bold mb-2" style={{fontFamily:'Poppins,sans-serif'}}>Important Notice</h3>
              <p className="text-white/80 text-sm leading-relaxed" style={{fontFamily:'Poppins,sans-serif'}}>
                Lumos AI provides trading tools and analytics for educational and informational purposes. Cryptocurrency trading 
                involves substantial risk and may not be suitable for all investors. Please trade responsibly and never invest more than 
                you can afford to lose.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Content */}
        <div className="space-y-8">
          {/* 1. Acceptance of Terms */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-[#A259FF] flex-shrink-0 mt-1" />
              <h2 className="text-xl font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                1. Acceptance of Terms
              </h2>
            </div>
            <div className="space-y-4 text-white/80" style={{fontFamily:'Poppins,sans-serif'}}>
              <p>
                By accessing and using Lumos AI ("the Platform"), you accept and agree to be bound by the terms and 
                provisions of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
              <p>
                These Terms of Service ("Terms") govern your use of our website, mobile application, and services (collectively, 
                the "Service") operated by Lumos AI.
              </p>
            </div>
          </section>

          {/* 2. Description of Service */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-[#A259FF] flex-shrink-0 mt-1" />
              <h2 className="text-xl font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                2. Description of Service
              </h2>
            </div>
            <div className="space-y-4 text-white/80" style={{fontFamily:'Poppins,sans-serif'}}>
              <p>Lumos AI is a comprehensive Web3 trading platform that provides:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Real-time cryptocurrency market analysis and sentiment tracking</li>
                <li>AI-powered chat assistance for trading insights</li>
                <li>News sentiment analysis and social media monitoring</li>
                <li>Ethereum and Solana ecosystem tracking tools</li>
                <li>Educational resources and market intelligence</li>
                <li>Community-driven insights and analytics</li>
              </ul>
              <p>
                Our services are designed to assist users in making informed trading decisions but do not constitute financial 
                advice or investment recommendations.
              </p>
            </div>
          </section>

          {/* 3. User Responsibilities */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-[#A259FF] flex-shrink-0 mt-1" />
              <h2 className="text-xl font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                3. User Responsibilities
              </h2>
            </div>
            <div className="space-y-4 text-white/80" style={{fontFamily:'Poppins,sans-serif'}}>
              <p>By using our Service, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete information when creating an account</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the Service only for lawful purposes and in accordance with these Terms</li>
                <li>Not attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Not use the Service to engage in any fraudulent, abusive, or illegal activities</li>
                <li>Comply with all applicable laws and regulations in your jurisdiction</li>
                <li>Take full responsibility for your trading decisions and their consequences</li>
              </ul>
            </div>
          </section>

          {/* 4. Risk Disclosure */}
          <section className="bg-red-900/20 border border-red-600/30 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <h2 className="text-xl font-bold text-red-400" style={{fontFamily:'Poppins,sans-serif'}}>
                4. Risk Disclosure
              </h2>
            </div>
            <div className="space-y-4 text-white/80" style={{fontFamily:'Poppins,sans-serif'}}>
              <p className="font-semibold text-red-400">
                IMPORTANT: Cryptocurrency trading involves substantial risk of loss.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cryptocurrency markets are highly volatile and unpredictable</li>
                <li>Past performance does not guarantee future results</li>
                <li>You may lose some or all of your invested capital</li>
                <li>Our tools and analysis are for informational purposes only</li>
                <li>We do not provide financial, investment, or trading advice</li>
                <li>You should consult with qualified professionals before making investment decisions</li>
                <li>Never invest more than you can afford to lose</li>
              </ul>
            </div>
          </section>

          {/* 5. Intellectual Property */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-[#A259FF] flex-shrink-0 mt-1" />
              <h2 className="text-xl font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                5. Intellectual Property
              </h2>
            </div>
            <div className="space-y-4 text-white/80" style={{fontFamily:'Poppins,sans-serif'}}>
              <p>
                The Service and its original content, features, and functionality are and will remain the exclusive property of 
                Lumos AI and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, 
                republish, download, store, or transmit any of the material on our Service without our prior written consent.
              </p>
            </div>
          </section>

          {/* 6. Limitation of Liability */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-[#A259FF] flex-shrink-0 mt-1" />
              <h2 className="text-xl font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                6. Limitation of Liability
              </h2>
            </div>
            <div className="space-y-4 text-white/80" style={{fontFamily:'Poppins,sans-serif'}}>
              <p>
                In no event shall Lumos AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for 
                any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, 
                data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
              <p>
                Our total liability to you for all claims arising from or relating to the Service shall not exceed the amount you 
                paid us in the twelve (12) months preceding the claim.
              </p>
            </div>
          </section>

          {/* 7. Contact Information */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-[#A259FF] flex-shrink-0 mt-1" />
              <h2 className="text-xl font-bold text-white" style={{fontFamily:'Poppins,sans-serif'}}>
                7. Contact Information
              </h2>
            </div>
            <div className="space-y-4 text-white/80" style={{fontFamily:'Poppins,sans-serif'}}>
              <p>
                If you have any questions about these Terms of Service, please contact us through our platform or community 
                channels.
              </p>
              <p>
                For urgent matters or legal inquiries, please use the contact information provided on our website.
              </p>
            </div>
          </section>
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-12 pt-8 border-t border-white/10">
          <p className="text-white/60 text-sm mb-6" style={{fontFamily:'Poppins,sans-serif'}}>
            By using Lumos AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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