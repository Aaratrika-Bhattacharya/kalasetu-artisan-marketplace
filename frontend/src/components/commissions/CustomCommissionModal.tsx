import React, { useState } from 'react';
import { api } from '../../services/api';
import { X, Sparkles, ShieldCheck, Lock, CheckCircle, Loader2 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const CustomCommissionModal: React.FC<Props> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    artisanId: '',
    title: '5-Foot Monumental Garden Sculpture',
    projectScope: 'Custom weathered outdoor garden sculpture using reinforced Ganga riverbed terracotta and bronze patina finish.',
    patronBudget: 28000,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCommission, setCreatedCommission] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Find Santu Roy or first artisan
      const artisansRes = await api.getArtisans();
      const targetArtisan =
        artisansRes.artisans?.find((a: any) => a.artisanName === 'Santu Roy') ||
        artisansRes.artisans?.[0];

      if (!targetArtisan) throw new Error('No artisan available for commission');

      const res = await api.createCommission({
        ...formData,
        artisanId: targetArtisan.id,
      });

      if (res.success && res.commission) {
        setCreatedCommission(res.commission);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize custom commission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in text-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-clayborder shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-heritage font-bold text-lg">
                Bespoke Sculpture & Custom Commission
              </h3>
              <p className="text-stone-400 text-xs">
                3-Stage Milestone Escrow with Digital IP Mold Protection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdCommission ? (
          <div className="p-6 space-y-5 animate-fade-in">
            <div className="bg-emerald-50 text-emerald-950 border border-emerald-300 p-4 rounded-xl space-y-2">
              <div className="font-bold text-sm flex items-center">
                <CheckCircle className="w-4 h-4 text-emerald-600 mr-1.5" />
                Commission Ref #{createdCommission.commissionNumber} Locked in Escrow
              </div>
              <p className="text-[11px] leading-relaxed">
                Your bespoke commission has been assigned to master sculptor Santu Roy. Funds remain secured in 3-stage milestone escrow until you inspect and approve each stage.
              </p>
            </div>

            {/* Digital IP Hash */}
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
              <span className="text-stone-500 font-mono text-[10px] block">
                DIGITAL IP COPYRIGHT HASH:
              </span>
              <span className="font-mono text-stone-800 text-[11px] break-all">
                {createdCommission.digitalIpHash}
              </span>
            </div>

            {/* Milestones List */}
            <div className="space-y-2.5">
              <span className="font-bold text-stone-800 text-xs uppercase tracking-wider block">
                3-Stage Escrow Timeline
              </span>
              {createdCommission.milestones?.map((m: any, i: number) => (
                <div
                  key={i}
                  className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-stone-900">{m.title}</div>
                    <div className="text-[10px] text-stone-500">
                      Escrow allocation: {m.percentage}% of total
                    </div>
                  </div>
                  <span className="font-bold text-stone-900 font-heritage text-sm">
                    ₹{m.amount}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-stone-900 text-white font-bold"
            >
              Done & Return to Marketplace
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            {errorMsg && (
              <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Project Title & Craft Medium
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 text-xs text-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Project Scope & Specifications
              </label>
              <textarea
                rows={3}
                required
                value={formData.projectScope}
                onChange={(e) => setFormData({ ...formData, projectScope: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-stone-300 text-xs text-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                Your Patron Budget (₹)
              </label>
              <input
                type="number"
                required
                value={formData.patronBudget}
                onChange={(e) => setFormData({ ...formData, patronBudget: Number(e.target.value) })}
                className="w-full p-2.5 rounded-lg border border-stone-300 text-xs font-bold text-stone-900 text-base"
              />
            </div>

            {/* 3-Stage Escrow Explanation Card */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-2 text-[11px] text-amber-950">
              <div className="font-bold flex items-center">
                <Lock className="w-3.5 h-3.5 mr-1 text-amber-700" />
                How KalaSetu Milestone Escrow Protects You & The Artisan:
              </div>
              <ul className="space-y-1 list-disc list-inside text-amber-900">
                <li>Stage 1 (25%): Unlocked for raw alluvial clay & steel armature lock.</li>
                <li>Stage 2 (35%): Disbursed only after you approve the 360° clay prototype photo.</li>
                <li>Stage 3 (40%): Released upon kiln firing and timber-crated SafeTransit delivery.</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Locking Escrow Agreement...</span>
                </>
              ) : (
                <span>Initialize Bespoke Commission</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
