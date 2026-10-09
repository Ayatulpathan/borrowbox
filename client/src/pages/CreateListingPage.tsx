import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus, Trash2, ArrowLeft, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { listingService } from '../services/listingService';
import { agentService } from '../services/agentService';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const CreateListingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Cameras & Photography');
  const [description, setDescription] = useState('');
  const [itemCondition, setItemCondition] = useState<'Brand New' | 'Like New' | 'Good' | 'Fair'>('Like New');
  const [dailyPrice, setDailyPrice] = useState('1500');
  const [hourlyPrice, setHourlyPrice] = useState('');
  const [weeklyPrice, setWeeklyPrice] = useState('8000');
  const [securityDeposit, setSecurityDeposit] = useState('2000');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800');
  const [city, setCity] = useState(user?.location?.city || 'Dhaka');
  const [area, setArea] = useState(user?.location?.area || 'Gulshan');
  const [address, setAddress] = useState(user?.location?.address || '');
  const [pickup, setPickup] = useState(true);
  const [delivery, setDelivery] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState('150');
  const [cancellationPolicy, setCancellationPolicy] = useState<'Flexible' | 'Moderate' | 'Strict'>('Flexible');

  // Specs & Accessories
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([
    { key: 'Brand/Model', value: '' },
    { key: 'Condition', value: 'Like New' },
  ]);
  const [accessories, setAccessories] = useState<string[]>(['Battery + Charger', 'Carrying Bag']);
  const [accessoryInput, setAccessoryInput] = useState('');

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Description Generator
  const handleGenerateAIDescription = async () => {
    if (!title.trim()) {
      setError('Please provide at least an item title/model first so the AI can craft the description.');
      return;
    }
    setIsGeneratingAI(true);
    setError(null);
    try {
      const res = await agentService.sendMessage(
        `Help me create a listing for: "${title}". Category is ${category}, condition is ${itemCondition}.`
      );
      if (res.success && res.data) {
        // Find the generated tool result if any
        const descTool = res.data.toolCalls?.find((tc: any) => tc.toolName === 'generateListingDescription');
        if (descTool && descTool.result) {
          setDescription(descTool.result.suggestedDescription || res.data.response);
        } else {
          setDescription(res.data.response);
        }
      }
    } catch (err: any) {
      setError('AI generation error. You can type the description manually.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const handleAddAccessory = () => {
    if (accessoryInput.trim()) {
      setAccessories([...accessories, accessoryInput.trim()]);
      setAccessoryInput('');
    }
  };

  const handleSubmit = async (status: 'published' | 'draft') => {
    if (!title || !description || !dailyPrice) {
      setError('Title, description, and daily rental price are mandatory.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await listingService.createListing({
        title,
        category,
        description,
        itemCondition,
        pricing: {
          daily: Number(dailyPrice),
          hourly: hourlyPrice ? Number(hourlyPrice) : undefined,
          weekly: weeklyPrice ? Number(weeklyPrice) : undefined,
        },
        securityDeposit: Number(securityDeposit) || 0,
        images: [imageUrl],
        location: { city, area, address },
        specs: specs.filter((s) => s.key && s.value),
        includedAccessories: accessories,
        pickupDelivery: {
          pickup,
          delivery,
          deliveryFee: delivery ? Number(deliveryFee) : 0,
        },
        cancellationPolicy,
        status,
      });

      if (res.success) {
        navigate(`/listings/${res.data._id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create listing.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Cancel
        </button>
        <h1 className="text-xl font-bold text-slate-900">List Your Item for Rent</h1>
        <div />
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-8">
        {/* Step 1: Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Basic Item Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-700">Listing Title / Model Name *</label>
              <input
                type="text"
                placeholder="e.g. Sony Alpha A7 IV Mirrorless Camera Kit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              >
                <option value="Cameras & Photography">Cameras & Photography</option>
                <option value="Electronics & Audio">Electronics & Audio</option>
                <option value="Laptops & Computing">Laptops & Computing</option>
                <option value="Tools & DIY">Tools & DIY</option>
                <option value="Outdoor & Camping">Outdoor & Camping</option>
                <option value="Party & Events">Party & Events</option>
                <option value="Gaming & VR">Gaming & VR</option>
                <option value="Vehicles & Scooters">Vehicles & Scooters</option>
                <option value="Sports & Fitness">Sports & Fitness</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Condition</label>
              <select
                value={itemCondition}
                onChange={(e) => setItemCondition(e.target.value as any)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500"
              >
                <option value="Brand New">Brand New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          {/* AI Description Button & Textarea */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Item Description *</label>
              <button
                type="button"
                onClick={handleGenerateAIDescription}
                disabled={isGeneratingAI}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-lg border border-brand-200 transition-colors disabled:opacity-50"
              >
                {isGeneratingAI ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
                    Auto-Generate with AI Agent
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={5}
              placeholder="Describe item condition, usage instructions, specs, and why renters should choose it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Step 2: Pricing & Deposit */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. Rental Pricing & Security Deposit
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Daily Rate (৳) *</label>
              <input
                type="number"
                placeholder="1500"
                value={dailyPrice}
                onChange={(e) => setDailyPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Weekly Rate (৳)</label>
              <input
                type="number"
                placeholder="8000"
                value={weeklyPrice}
                onChange={(e) => setWeeklyPrice(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Security Deposit (৳)</label>
              <input
                type="number"
                placeholder="2000"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Photo URL */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            3. Photo URL / Image Cover
          </h3>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Direct Image URL</label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          {imageUrl && (
            <div className="w-32 h-20 rounded-xl overflow-hidden border border-slate-200">
              <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Step 4: Location & Handover */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            4. Location & Handover
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Area / Neighborhood *</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2 text-xs font-semibold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={pickup}
                onChange={(e) => setPickup(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              Self Pickup Allowed
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={delivery}
                onChange={(e) => setDelivery(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              Doorstep Delivery Supported
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <LoadingSpinner size="sm" /> : 'Publish Listing Now'}
          </button>
        </div>
      </div>
    </div>
  );
};
