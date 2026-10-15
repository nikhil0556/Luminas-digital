import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { CreatorProvider } from './context/CreatorContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { EbookReaderModal } from './components/EbookReaderModal';
import { PromptPreviewModal } from './components/PromptPreviewModal';
import { ExitIntentModal } from './components/ExitIntentModal';
import { ToastContainer } from './components/ToastContainer';
import { CustomerChatbot } from './components/CustomerChatbot';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { EbooksPage } from './pages/EbooksPage';
import { AiPromptsPage } from './pages/AiPromptsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccessPage } from './pages/AccessPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FaqPage } from './pages/FaqPage';
import { PolicyPage } from './pages/PolicyPage';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { CreatorDashboardPage } from './pages/CreatorDashboardPage';
import { BecomeCreatorPage } from './pages/BecomeCreatorPage';
import { CreatorProfilePage } from './pages/CreatorProfilePage';
import { SearchPage } from './pages/SearchPage';
import { AuthPage } from './pages/AuthPage';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { SocialProofToast } from './components/SocialProofToast';
import { OwnerRouteGuard } from './components/OwnerRouteGuard';
import { AmbientWindCanvas } from './components/AmbientWindCanvas';
import { BlowingScrollObserver } from './components/BlowingScrollObserver';

const AppContent: React.FC = () => {
  const { activePage, settings } = useStore();

  React.useEffect(() => {
    const theme = settings?.accentTheme || 'indigo';
    document.documentElement.setAttribute('data-theme', theme);
  }, [settings?.accentTheme]);

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'search':
        return <SearchPage />;
      case 'login':
        return <AuthPage initialMode="login" />;
      case 'signup':
        return <AuthPage initialMode="signup" />;
      case 'forgot-password':
        return <AuthPage initialMode="forgot" />;
      case 'auth':
        return <AuthPage initialMode="login" />;
      case 'ebooks':
        return <EbooksPage />;
      case 'ai-prompts':
        return <AiPromptsPage />;
      case 'product-detail':
        return <ProductDetailPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'access':
        return <AccessPage />;
      case 'dashboard':
        return <CustomerDashboardPage />;
      case 'creator-dashboard':
        return <CreatorDashboardPage />;
      case 'creator-profile':
        return <CreatorProfilePage />;
      case 'become-creator':
        return <BecomeCreatorPage />;
      case 'sell':
        return <BecomeCreatorPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'faq':
        return <FaqPage />;
      case 'policy':
        return <PolicyPage />;
      case 'admin':
      case 'control-panel':
        return (
          <OwnerRouteGuard panelTitle="Store Admin Dashboard">
            <AdminPage />
          </OwnerRouteGuard>
        );
      case 'settings':
      case 'store-config':
        return (
          <OwnerRouteGuard panelTitle="Store Configuration & Settings">
            <SettingsPage />
          </OwnerRouteGuard>
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white relative">
      {/* Ambient Wind Breeze Canvas (blowing particles reacting to scroll) */}
      <AmbientWindCanvas />

      {/* Global Scroll Observer (triggers wind blowing animations whenever sections are reached) */}
      <BlowingScrollObserver />

      {/* Top Navigation */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1">
        {renderActivePage()}
      </main>

      {/* Bottom Footer */}
      <Footer />

      {/* Global Interactive Overlays */}
      <CartDrawer />
      <EbookReaderModal />
      <PromptPreviewModal />
      <ExitIntentModal />
      <ToastContainer />
      <CustomerChatbot />
      <AuthModal />
      <CheckoutModal />
      <SocialProofToast />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CreatorProvider>
          <AppContent />
        </CreatorProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
