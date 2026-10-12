import { Route, Routes } from 'react-router-dom';
import { SiteLayout } from './components/Layout';
import { GuestOnly, RequireAuth } from './components/RouteGuards';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import SourcingCountries from './pages/SourcingCountries';
import TradeFairs from './pages/TradeFairs';
import Resources from './pages/Resources';
import HowItWorks from './pages/HowItWorks';
import Faq from './pages/Faq';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import { CookiePolicy, PrivacyPolicy, RefundPolicy, Terms } from './pages/legal/Policies';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        {/* Public website */}
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="products" element={<Products />} />
        <Route path="sourcing-countries" element={<SourcingCountries />} />
        <Route path="trade-fairs" element={<TradeFairs />} />
        <Route path="resources" element={<Resources />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="faq" element={<Faq />} />
        <Route path="contact" element={<Contact />} />
        <Route path="pricing" element={<Pricing />} />

        {/* Policies */}
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="refund-policy" element={<RefundPolicy />} />
        <Route path="cookie-policy" element={<CookiePolicy />} />

        {/* Auth */}
        <Route element={<GuestOnly />}>
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
        <Route path="verify-email" element={<VerifyEmail />} />

        {/* Account */}
        <Route element={<RequireAuth />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="billing" element={<Billing />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
