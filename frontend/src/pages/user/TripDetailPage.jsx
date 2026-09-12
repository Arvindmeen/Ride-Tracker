import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, MapPin, CheckCircle2, ShieldCheck, Share2,
  FileText, Download, Star, Phone, MessageSquare, CreditCard, ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { rideService } from '@/services';
import { VehicleIcon, Spinner, Badge, Button } from '@/components/ui';
import { format } from 'date-fns';
import { MOCK_RIDES } from '@/mock/rides.js';

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    rideService.getRideById(id).then((data) => {
      if (data) {
        setTrip({
          ...data,
          durationMinutes: data.duration || 12,
          paymentMethod: typeof data.payment === 'object'
            ? `${data.payment.method || 'UPI'} AutoPay`
            : (data.paymentMethod || 'UPI AutoPay'),
          paymentStatus: typeof data.payment === 'object' && data.payment.status === 'COMPLETED' ? 'PAID' : 'PAID',
        });
        setLoading(false);
        return;
      }
      // Rich default using first completed ride
      const sample = MOCK_RIDES.find((r) => r.status === 'RIDE_COMPLETED') || MOCK_RIDES[0];
      setTrip({
        ...sample,
        id: id || sample.id,
        durationMinutes: sample.duration || 12,
        paymentMethod: sample.payment?.method ? `${sample.payment.method} AutoPay` : 'UPI AutoPay',
        paymentStatus: 'PAID',
      });
      setLoading(false);
    });
  }, [id]);


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-slate-500 font-medium">Trip not found</p>
        <Link to="/app/trips">
          <Button variant="secondary">Back to Trips</Button>
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-28 sm:pb-20 space-y-6">
      {/* ── Top Navigation Bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/app/trips')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl transition-colors shadow-xs"
        >
          <ArrowLeft size={16} />
          <span>All Trips</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl transition-colors shadow-xs"
            title="Share Trip Link"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">{copied ? 'Link Copied!' : 'Share'}</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-xl transition-colors shadow-xs"
            title="Download Invoice / Print"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Download Invoice</span>
          </button>
        </div>
      </div>

      {/* ── Trip Header Summary ─────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <VehicleIcon category={trip.category} size="md" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900">
                  {trip.category} Ride
                </h1>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                  ✓ {trip.status === 'RIDE_COMPLETED' ? 'Completed' : trip.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                <Clock size={12} />
                <span>
                  {trip.completedAt
                    ? format(new Date(trip.completedAt), 'EEEE, MMMM d, yyyy · h:mm a')
                    : 'Recent trip'}
                </span>
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Paid
            </span>
            <p className="text-2xl font-black text-slate-900 leading-tight">
              ₹{typeof trip.fare === 'object' ? Math.round(trip.fare.total) : trip.fare || 72}
            </p>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              ● Paid via {trip.paymentMethod || 'UPI AutoPay'}
            </span>
          </div>
        </div>

        {/* Route Timeline */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
            Route Details
          </p>
          <div className="relative pl-6 space-y-4">
            {/* Timeline connector bar */}
            <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-blue-600 via-indigo-400 to-rose-500 rounded-full" />

            {/* Pickup */}
            <div className="relative">
              <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-sm" />
              <div>
                <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">
                  Pickup
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {trip.pickup?.name || trip.pickup?.address}
                </p>
                {trip.pickup?.address && trip.pickup?.address !== trip.pickup?.name && (
                  <p className="text-xs text-slate-500">{trip.pickup.address}</p>
                )}
              </div>
            </div>

            {/* Destination */}
            <div className="relative">
              <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white shadow-sm" />
              <div>
                <span className="text-[10px] font-bold uppercase text-rose-600 tracking-wider">
                  Destination Drop-off
                </span>
                <p className="text-sm font-bold text-slate-900">
                  {trip.destination?.name || trip.destination?.address}
                </p>
                {trip.destination?.address && trip.destination?.address !== trip.destination?.name && (
                  <p className="text-xs text-slate-500">{trip.destination.address}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Distance & Trip Stats */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Distance</span>
            <p className="text-sm font-black text-slate-800 mt-0.5">{trip.distance || 2.4} km</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Trip Time</span>
            <p className="text-sm font-black text-slate-800 mt-0.5">{trip.durationMinutes || 9} mins</p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Trip Rating</span>
            <p className="text-sm font-black text-amber-500 mt-0.5">★ {trip.userRating || 5}.0</p>
          </div>
        </div>
      </div>

      {/* ── Driver Partner Information ──────────────────────────────────────── */}
      {trip.driverInfo && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
          <h2 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
            Driver Partner Details
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-sm">
                {trip.driverInfo.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  {trip.driverInfo.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {trip.driverInfo.vehicle} ·{' '}
                  <span className="text-amber-500 font-bold">★ {trip.driverInfo.rating}</span>
                </p>
                <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md inline-block mt-0.5">
                  {trip.driverInfo.plate}
                </span>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              Verified Partner
            </span>
          </div>
        </div>
      )}

      {/* ── Fare Breakdown Receipt ───────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
          Fare & Tax Breakdown
        </h2>

        <div className="space-y-2.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Base Fare ({trip.category})</span>
            <span className="font-semibold text-slate-900">
              ₹{trip.fare?.base || 40}.00
            </span>
          </div>
          <div className="flex justify-between">
            <span>Distance Rate ({trip.distance || 2.4} km)</span>
            <span className="font-semibold text-slate-900">
              ₹{trip.fare?.distanceFare || 28.80}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Surge / Dynamic Multiplier</span>
            <span className="font-semibold text-slate-900">1.0x (Standard Rate)</span>
          </div>
          <div className="flex justify-between">
            <span>Applicable GST / Government Taxes (5%)</span>
            <span className="font-semibold text-slate-900">
              ₹{trip.fare?.tax || 3.44}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
            <span className="text-sm font-black text-slate-900">Total Billed</span>
            <span className="text-xl font-black text-blue-600">
              ₹{typeof trip.fare === 'object' ? Math.round(trip.fare.total) : trip.fare || 72}.00
            </span>
          </div>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-slate-500" />
            <span className="font-bold text-slate-700">Payment: {trip.paymentMethod || 'UPI'}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            Settled Online
          </span>
        </div>
      </div>

      {/* ── Re-book CTA ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/app/home" className="flex-1">
          <Button className="w-full py-3.5 rounded-2xl text-sm font-black bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20">
            Book Next Ride
          </Button>
        </Link>
        <Link to="/contact" className="flex-1">
          <Button variant="secondary" className="w-full py-3.5 rounded-2xl text-sm font-bold">
            Need Help with this Trip?
          </Button>
        </Link>
      </div>
    </div>
  );
}
