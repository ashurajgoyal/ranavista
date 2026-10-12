import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { LotusMark } from '../components/Logo';

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <LotusMark className="size-20" />
      <p className="mt-6 font-display text-7xl font-semibold text-brand-600">404</p>
      <span className="mt-5 block h-px w-14 bg-accent-500" />
      <h1 className="mt-5 text-3xl font-semibold">This page has wandered off</h1>
      <p className="mt-3 max-w-md text-muted">The page you’re looking for doesn’t exist or has moved. Try one of these instead.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700">
          Go to homepage <ArrowRight className="size-4" />
        </Link>
        <Link to="/products" className="inline-flex items-center gap-2 rounded-md border border-brand-600 px-6 py-3 text-sm font-medium text-brand-600 hover:bg-brand-600 hover:text-white">
          <Search className="size-4" /> Browse products
        </Link>
      </div>
    </div>
  );
}
