import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { Hero } from './components/Hero.jsx';
import { MenuSection } from './components/MenuSection.jsx';
import { OutletLocator } from './components/OutletLocator.jsx';
import { AboutSection } from './components/AboutSection.jsx';
import { TeamSection } from './components/TeamSection.jsx';
import { ContactSection } from './components/ContactSection.jsx';
import { FeaturesSection } from './components/FeaturesSection.jsx';
import { TestimonialsSection } from './components/TestimonialsSection.jsx';
import { NewsletterSection } from './components/NewsletterSection.jsx';
import { Footer } from './components/Footer.jsx';
import { BackToTop } from './components/BackToTop.jsx';
import { OrderModal } from './components/OrderModal.jsx';
import { OrderStatusModal } from './components/OrderStatusModal.jsx';
import { InfoModal } from './components/InfoModal.jsx';
import { AdminPortal } from './components/admin/AdminPortal.jsx';
import { api } from './services/api.js';

export default function App() {
  const [viewMode, setViewMode] = useState('customer');

  // Customer Modals
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState('');

  const [selectedItemForOrder, setSelectedItemForOrder] = useState(null);
  const [selectedOutletForOrder, setSelectedOutletForOrder] = useState(null);

  const [infoModalData, setInfoModalData] = useState({
    isOpen: false,
    title: '',
    content: ''
  });

  // Verify backend connectivity on load
  useEffect(() => {
    api.checkHealth().then((health) => {
      console.log('[Kopi Sewu Management System] API connected:', health);
    });
  }, []);

  const handleOpenOrder = (item, outlet) => {
    setSelectedItemForOrder(item || null);
    setSelectedOutletForOrder(outlet || null);
    setIsOrderModalOpen(true);
  };

  const handleOpenTrackOrder = (orderId) => {
    if (orderId) setActiveTrackingOrderId(orderId);
    setIsTrackModalOpen(true);
  };

  const handleOpenInfo = (title, content) => {
    setInfoModalData({ isOpen: true, title, content });
  };

  // If in Admin Mode, render the full admin management portal
  if (viewMode === 'admin') {
    return (
      <AdminPortal onBackToCustomerSite={() => setViewMode('customer')} />
    );
  }

  // Customer Facing Storefront
  return (
    <div className="font-sans bg-white text-[#1F2937] min-h-screen flex flex-col antialiased selection:bg-[#CAD2C5] selection:text-[#1B4332]">
      {/* Navigation */}
      <Navbar
        onOpenOrderModal={() => handleOpenOrder()}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
        onOpenAdminPortal={() => setViewMode('admin')}
      />

      {/* Hero Section with Sliding Background */}
      <Hero />

      {/* Menu Section */}
      <MenuSection onSelectItemForOrder={(item) => handleOpenOrder(item)} />

      {/* Outlets Locator Section */}
      <OutletLocator onSelectOutletForOrder={(outlet) => handleOpenOrder(undefined, outlet)} />

      {/* About & Story Section (Includes Team Section as in original design) */}
      <div id="about" className="bg-white text-neutral-800 border-t border-[#E5E7EB]">
        <AboutSection />
        <div className="container mx-auto px-6 pb-20">
          <TeamSection />
        </div>
      </div>

      {/* Contact Section */}
      <ContactSection />

      {/* Features Section (Why Choose Us) */}
      <FeaturesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Footer */}
      <Footer
        onOpenOrderModal={() => handleOpenOrder()}
        onOpenTrackOrder={() => handleOpenTrackOrder()}
        onOpenAdminPortal={() => setViewMode('admin')}
        onOpenInfoModal={handleOpenInfo}
      />

      {/* Floating Back to Top Button */}
      <BackToTop />

      {/* Order Online Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        preSelectedItem={selectedItemForOrder}
        preSelectedOutlet={selectedOutletForOrder}
        onOrderSuccessViewStatus={(orderId) => {
          setIsOrderModalOpen(false);
          handleOpenTrackOrder(orderId);
        }}
      />

      {/* Order Status Tracking Modal */}
      <OrderStatusModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        initialOrderId={activeTrackingOrderId}
      />

      {/* Footer Policy & Information Modal */}
      <InfoModal
        isOpen={infoModalData.isOpen}
        onClose={() => setInfoModalData((prev) => ({ ...prev, isOpen: false }))}
        title={infoModalData.title}
        content={infoModalData.content}
      />
    </div>
  );
}
