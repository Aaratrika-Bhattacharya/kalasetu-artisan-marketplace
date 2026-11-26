import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import {
  Mic,
  MicOff,
  Sparkles,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
  Volume2,
} from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

const SAMPLE_VOICE_NOTES = [
  {
    lang: 'bn',
    label: 'বাংলা (Bengali Sample)',
    text: 'এটা আমাদের বাঁকুড়ার পঞ্চমুড়ার খাঁটি পোড়ামাটির ঐতিহাসিক ঘোড়া, উচ্চতা প্রায় ১৬ ইঞ্চি, দাম ৯৫০ টাকা। এটি সম্পূর্ণ হাতে গড়া।',
  },
  {
    lang: 'hi',
    label: 'हिन्दी (Hindi Sample)',
    text: 'यह हमारी जयपुर ब्लू पॉटरी की १० इंच की शाही मयूर थाली है। क्वार्ट्ज और कोबाल्ट नीले रंग से बनी, कीमत ६५० रुपये है।',
  },
  {
    lang: 'gu',
    label: 'ગુજરાતી (Gujarati Sample)',
    text: 'આ અમારું કચ્છનું પરંપરાગત સૂર્યમુખી લિપ્પણ કામ મિરર પેનલ છે, માટી અને આભલા કાચથી બનેલ ૧૪ ઈંચ, કિંમત ૧૧૫૦ રૂપિયા.',
  },
];

export const VoiceMultimodalUpload: React.FC<Props> = ({ onSuccess }) => {
  const { language, t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [spokenLang, setSpokenLang] = useState<string>('bn');
  const [selectedImage, setSelectedImage] = useState<string>(
    'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSimulateVoice = (sample: { lang: string; text: string }) => {
    setSpokenLang(sample.lang);
    setSpokenText(sample.text);
    setIsRecording(false);
  };

  const handleProcessAI = async () => {
    if (!spokenText.trim()) {
      setErrorMsg('Please speak or type craft description first.');
      return;
    }
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const res = await api.multimodalOnboard({
        voiceTranscript: spokenText,
        spokenLang,
        imageMeta: { imageUrl: selectedImage },
      });

      if (res.success && res.data) {
        setExtractedData(res.data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'AI Multimodal Extraction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublishProduct = async () => {
    if (!extractedData) return;
    setIsPublishing(true);
    setErrorMsg(null);

    try {
      await api.createProduct({
        title: extractedData.title,
        vernacularTitles: extractedData.vernacularTitles,
        description: extractedData.description,
        vernacularDescs: extractedData.vernacularDescs,
        category: extractedData.category,
        tags: extractedData.tags,
        retailPrice: extractedData.suggestedRetailPrice,
        artisanBasePrice: extractedData.artisanBasePrice,
        stockQuantity: 5,
        lengthCm: extractedData.dimensions?.lengthCm || 15,
        widthCm: extractedData.dimensions?.widthCm || 15,
        heightCm: extractedData.dimensions?.heightCm || 20,
        weightGrams: extractedData.dimensions?.weightGrams || 800,
        imageUrls: [selectedImage],
      });

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to list product. Make sure you are logged in as Artisan.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-clayborder shadow-sm space-y-6">
      <div className="border-b border-stone-100 pb-4">
        <div className="flex items-center space-x-2 text-terracotta-700">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h3 className="font-heritage font-bold text-xl text-stone-900">
            {t('voice_upload_title')}
          </h3>
        </div>
        <p className="text-stone-500 text-xs mt-1">
          {t('voice_upload_prompt')}
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1: Photos & Voice Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo Section */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
            1. Craft Photograph
          </label>
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-dashed border-stone-300 bg-stone-50 flex items-center justify-center group">
            <img
              src={selectedImage}
              alt="Craft Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs font-semibold flex items-center">
                <Camera className="w-4 h-4 mr-1.5" />
                Change Photo
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {[
              'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80',
            ].map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedImage(img)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 ${
                  selectedImage === img ? 'border-terracotta-600' : 'border-stone-200'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Voice Section */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
            2. Spoken Vernacular Description
          </label>

          {/* Quick Vernacular Speech Simulation Pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-stone-500 font-medium block">
              Quick Test Prompts (Bengali, Hindi, Gujarati):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_VOICE_NOTES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSimulateVoice(sample)}
                  className="px-2.5 py-1 rounded-md text-[11px] bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium border border-stone-200 transition-colors flex items-center space-x-1"
                >
                  <Volume2 className="w-3 h-3 text-terracotta-600" />
                  <span>{sample.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Spoken Audio Transcript Textbox */}
          <div className="relative">
            <textarea
              rows={4}
              value={spokenText}
              onChange={(e) => setSpokenText(e.target.value)}
              placeholder="Speak naturally about your craft piece (height, clay materials, price in rupees or taka)..."
              className="w-full p-3 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 bg-stone-50 text-stone-900"
            />
          </div>

          {/* Large Hold-to-Speak Microphone Button */}
          <button
            type="button"
            onClick={handleProcessAI}
            disabled={isProcessing}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-terracotta-600 hover:from-amber-700 hover:to-terracotta-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gemini Multimodal AI Analyzing...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-white" />
                <span>Analyze with Gemini Multimodal AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step 2: Extracted AI Metadata & Approval */}
      {extractedData && (
        <div className="border-t border-stone-200 pt-6 space-y-4 animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <h4 className="font-heritage font-bold text-base text-stone-900">
              AI-Generated Catalog Card (Ready for Approval)
            </h4>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-stone-500 font-semibold block">Generated Title (English):</span>
                <span className="font-bold text-stone-900 text-sm">{extractedData.title}</span>
              </div>
              <div>
                <span className="text-stone-500 font-semibold block">Craft & Fragility Class:</span>
                <span className="font-bold text-amber-800">
                  {extractedData.craft} • {extractedData.fragilityClass} Fragility
                </span>
              </div>
            </div>

            <div>
              <span className="text-stone-500 font-semibold block">Evocative Story Description:</span>
              <p className="text-stone-700 mt-1 leading-relaxed">{extractedData.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-200">
              <div>
                <span className="text-stone-500 block">Suggested Retail:</span>
                <span className="font-bold text-stone-900 text-base">₹{extractedData.suggestedRetailPrice}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Your Direct Share (85%):</span>
                <span className="font-bold text-emerald-700 text-base">₹{extractedData.artisanBasePrice}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Category:</span>
                <span className="font-semibold text-stone-800">{extractedData.category}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Dimensions:</span>
                <span className="font-semibold text-stone-800">
                  {extractedData.dimensions?.heightCm}cm H × {extractedData.dimensions?.weightGrams}g
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePublishProduct}
            disabled={isPublishing}
            className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing to KaPra Marketplace...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Approve & Publish to Marketplace (অনুমোদন করুন)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
