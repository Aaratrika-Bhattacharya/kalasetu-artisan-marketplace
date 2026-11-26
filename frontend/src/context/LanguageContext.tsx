import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  tVernacular: (obj?: { [key in Language]?: string } | null, fallback?: string) => string;
}

const UI_DICTIONARY: Record<Language, Record<string, string>> = {
  en: {
    brand_name: 'KaPra',
    brand_tagline: 'Direct-to-Connoisseur Indian Clay & Ceramic Marketplace',
    nav_marketplace: 'Marketplace',
    nav_clusters: 'GI Craft Clusters',
    nav_artisans: 'Master Lineages',
    nav_commissions: 'Bespoke Sculptures',
    nav_artisan_portal: 'Artisan Studio',
    nav_admin_console: 'Governance',
    nav_track_order: 'SafeTransit™ Track',
    hero_title: 'Direct from Bharat’s Master Kilns to Your Home',
    hero_subtitle: 'Discover handmade pieces from across India, meet their makers, and see how your purchase supports their work.',
    filter_all_crafts: 'All Craft Lineages',
    filter_gi_only: 'GI-Certified Only',
    filter_category: 'Category',
    filter_price: 'Price Range',
    safe_transit_tag: 'SafeTransit™ Bio-Straw Guarantee',
    artisan_direct_share: 'Direct Artisan Realization',
    view_details: 'View Masterpiece',
    add_to_cart: 'Add to Cart',
    custom_order_cta: 'Commission Bespoke Sculpture',
    breakage_claim_cta: '100% Free Replacement Guarantee',
    voice_upload_title: 'Multimodal Vernacular Voice Intake',
    voice_upload_prompt: 'Hold to speak in Bengali, Hindi, or Gujarati to list your product effortlessly with Gemini AI.',
    packaging_guide_title: 'SafeTransit™ Bio-Composite Packaging Guide',
    zero_breakage_promise: 'Zero Transit Breakage Guarantee',
  },
  hi: {
    brand_name: 'KaPra',
    brand_tagline: 'भारतीय माटी और चीनी मिट्टी शिल्प का सीधा मंच',
    nav_marketplace: 'हाट बाज़ार',
    nav_clusters: 'शिल्प संकुल (GI)',
    nav_artisans: 'शिल्पकार वंशावली',
    nav_commissions: 'विशेष मूर्तिकला',
    nav_artisan_portal: 'कारीगर स्टूडियो',
    nav_admin_console: 'प्रशासन',
    nav_track_order: 'पार्सल ट्रैकिंग',
    hero_title: 'भारत के प्रामाणिक मिट्टी शिल्पकारों से सीधे आपके द्वार',
    hero_subtitle: 'भारत भर की हस्तनिर्मित कलाकृतियाँ खोजें, उनके कारीगरों से मिलें और जानें कि आपकी खरीद उनके काम को कैसे सहारा देती है।',
    filter_all_crafts: 'सभी शिल्प परंपराएं',
    filter_gi_only: 'केवल GI प्रमाणित',
    filter_category: 'श्रेणी',
    filter_price: 'मूल्य सीमा',
    safe_transit_tag: 'सुरक्षित बायो-स्ट्रॉ पैकेजिंग',
    artisan_direct_share: 'कारीगर का सीधा हिस्सा',
    view_details: 'कलाकृति देखें',
    add_to_cart: 'झोले में डालें',
    custom_order_cta: 'कस्टम मूर्ति का ऑर्डर दें',
    breakage_claim_cta: '100% मुफ्त रिप्लेसमेंट गारंटी',
    voice_upload_title: 'आवाज़ द्वारा नया उत्पाद जोड़ें',
    voice_upload_prompt: 'माइक दबाकर हिंदी, बांग्ला या गुजराती में बोलें, जेमिनी एआई विवरण तैयार कर देगा।',
    packaging_guide_title: 'सुरक्षित पैकेजिंग निर्देश',
    zero_breakage_promise: 'शून्य क्षति गारंटी',
  },
  bn: {
    brand_name: 'KaPra',
    brand_tagline: 'বাংলার ও ভারতের ঐতিহ্যবাহী মাটির শিল্পীদের সরাসরি হাট',
    nav_marketplace: 'শিল্প বিপণি',
    nav_clusters: 'জিআই শিল্প অঞ্চল',
    nav_artisans: 'মাস্টার কারিগর',
    nav_commissions: 'ফরমায়েশি ভাস্কর্য',
    nav_artisan_portal: 'শিল্পী স্টুডিও',
    nav_admin_console: 'প্রশাসন',
    nav_track_order: 'পার্সেল ট্র্যাকিং',
    hero_title: 'বাংলার পঞ্চমুড়ার পোড়ামাটি থেকে জয়পুরি ব্লু পটারি—সরাসরি শিল্পীর হাত থেকে',
    hero_subtitle: 'ভারতের নানা প্রান্তের হাতে তৈরি শিল্পকর্ম দেখুন, শিল্পীদের চিনুন এবং জানুন আপনার কেনাকাটা তাঁদের কাজে কীভাবে সহায়তা করে।',
    filter_all_crafts: 'সমস্ত ঐতিহ্যবাহী শিল্প',
    filter_gi_only: 'শুধু জিআই সার্টিফায়েড',
    filter_category: 'বিভাগ',
    filter_price: 'মূল্যসীমা',
    safe_transit_tag: 'নিরাপদ বায়ো-স্ট্র মোড়ক',
    artisan_direct_share: 'শিল্পীর প্রত্যক্ষ আয়',
    view_details: 'শিল্পকর্ম দেখুন',
    add_to_cart: 'ব্যাগে যোগ করুন',
    custom_order_cta: 'ফরমায়েশি মূর্তি তৈরি করুন',
    breakage_claim_cta: '১০০% বিনা খরচে বদলানোর গ্যারান্টি',
    voice_upload_title: 'মুখের কথায় পণ্যের তালিকা তৈরি',
    voice_upload_prompt: 'মাইক টিপে বাংলায় আপনার তৈরি সামগ্রীর কথা বলুন, জেমিনি এআই বিস্তারিত লিখে দেবে।',
    packaging_guide_title: 'বায়ো-কম্পোজিট প্যাকেজিং গাইড',
    zero_breakage_promise: 'ভাঙচুর মুক্ত ডেলিভারি প্রতিশ্রুতি',
  },
  gu: {
    brand_name: 'KaPra',
    brand_tagline: 'ભારતીય પરંપરાગત માટી અને સિરામિક શિલ્પીઓનું સીધું બજાર',
    nav_marketplace: 'બજાર',
    nav_clusters: 'જીઆઈ ક્રાફ્ટ ક્લસ્ટર્સ',
    nav_artisans: 'કારીગર વંશાવળી',
    nav_commissions: 'વિશેષ મૂર્તિઓ',
    nav_artisan_portal: 'કારીગર સ્ટુડિયો',
    nav_admin_console: 'સંચાલન',
    nav_track_order: 'ઓર્ડર ટ્રેકિંગ',
    hero_title: 'કચ્છના લિપ્પણ કામ અને ભારતીય માટી કળા સીધી તમારા આંગણે',
    hero_subtitle: 'ભારતભરના હસ્તનિર્મિત ઉત્પાદનો શોધો, તેમના કારીગરોને ઓળખો અને જાણો કે તમારી ખરીદી તેમના કામને કેવી રીતે ટેકો આપે છે.',
    filter_all_crafts: 'તમામ હસ્તકલા',
    filter_gi_only: 'માત્ર GI પ્રમાણિત',
    filter_category: 'શ્રેણી',
    filter_price: 'કિંમત મર્યાદા',
    safe_transit_tag: 'સેફટ્રાન્ઝિટ™ બાયો-સ્ટ્રો સુરક્ષા',
    artisan_direct_share: 'કારીગરનો સીધો હિસ્સો',
    view_details: 'કલાકૃતિ જુઓ',
    add_to_cart: 'કાર્ટમાં ઉમેરો',
    custom_order_cta: 'ખાસ કલાકૃતિ બનાવડાવો',
    breakage_claim_cta: '૧૦૦% મફત બદલી ગેરંટી',
    voice_upload_title: 'અવાજથી નવી વસ્તુ ઉમેરો',
    voice_upload_prompt: 'માઈક દબાવીને ગુજરાતી, હિન્દી કે અંગ્રેજીમાં બોલો, જેમિની એઆઈ વિગતો તૈયાર કરી આપશે.',
    packaging_guide_title: 'સુરક્ષિત પેકેજિંગ માર્ગદર્શિકા',
    zero_breakage_promise: 'શૂન્ય નુકસાન ગેરંટી',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('kalasetu_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kalasetu_lang', lang);
  };

  const t = (key: string): string => {
    const dict = UI_DICTIONARY[language] || UI_DICTIONARY.en;
    return dict[key] || UI_DICTIONARY.en[key] || key;
  };

  const tVernacular = (obj?: { [key in Language]?: string } | null, fallback = ''): string => {
    if (!obj) return fallback;
    return obj[language] || obj.en || fallback;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tVernacular }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
