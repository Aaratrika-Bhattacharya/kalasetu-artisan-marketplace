const bcrypt = require('bcryptjs');
const prisma = require('./prismaClient');

async function seed() {
  console.log('🌱 Starting KaPra Master Database Seeding...');

  // Clean existing tables
  await prisma.review.deleteMany();
  await prisma.fairTradeAuditLog.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.shipmentRecord.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.commissionMilestone.deleteMany();
  await prisma.customCommission.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.payoutRecord.deleteMany();
  await prisma.voiceOnboardingLog.deleteMany();
  await prisma.artisanProfile.deleteMany();
  await prisma.craftCluster.deleteMany();
  await prisma.fragilitySpec.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // 1. Create Fragility Packaging Specifications
  const specTerracotta = await prisma.fragilitySpec.create({
    data: {
      code: 'BIO_STRAW_TERRACOTTA_SHOCK_V2',
      name: 'Moulded Bio-Composite Straw Shock Insert',
      fragilityClass: 'EXTREME',
      packagingInstructions: JSON.stringify([
        'Place base moulded bio-composite paddy straw cradle inside the 5-ply corrugated carton.',
        'Wrap the terracotta piece in breathable unbleached butter paper to prevent abrasion.',
        'Slide product into contoured straw cavity; ensure zero movement on horizontal axes.',
        'Fit the interlocking upper bio-straw lid and apply tamper-evident SafeTransit™ seal.',
        'Affix bright red "FRAGILE - HERITAGE CLAY - THIS SIDE UP" bilingual handling label.',
      ]),
      cushioningMaterial: 'Chopped paddy straw + natural tapioca starch binder',
      dropTestRatingFeet: 4.5,
      boxCostInr: 14.0,
    },
  });

  const specBluePottery = await prisma.fragilitySpec.create({
    data: {
      code: 'HONEYCOMB_DOUBLE_FLUTE_V1',
      name: 'Double-Fluted Honeycomb Paper Divider Box',
      fragilityClass: 'HIGH',
      packagingInstructions: JSON.stringify([
        'Expand 100% biodegradable kraft honeycomb paper to 1.5x tension.',
        'Spiral-wrap the ceramic rim and handles with minimum 3 continuous layers.',
        'Insert into double-fluted box with 25mm clearance on all six sides.',
        'Fill void spaces with compressed paper curls (no plastic thermocol).',
        'Drop test passed from 4.0 feet on concrete corner.',
      ]),
      cushioningMaterial: 'Kraft honeycomb expansion paper',
      dropTestRatingFeet: 4.0,
      boxCostInr: 18.0,
    },
  });

  const specLippan = await prisma.fragilitySpec.create({
    data: {
      code: 'RIGID_PINE_EDGE_CUSHION_V1',
      name: 'Rigid Pine Corner Shield & Shock Blanket',
      fragilityClass: 'MEDIUM',
      packagingInstructions: JSON.stringify([
        'Attach 4-corner rigid pine corner protectors to prevent frame warping.',
        'Apply scratch-resistant film over mirror glass surfaces.',
        'Encase in shock-dampening ribbed cardboard folder.',
        'Seal in moisture-resistant recycled poly-sleeve for humid transit routes.',
      ]),
      cushioningMaterial: 'FSC-certified pine braces + ribbed corrugated sheet',
      dropTestRatingFeet: 3.5,
      boxCostInr: 22.0,
    },
  });

  console.log('📦 Created Fragility & SafeTransit Packaging Specs.');

  // 2. Create Admin and Patron Users
  const defaultPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123456', 10);

  const adminUser = await prisma.user.create({
    data: {
      fullName: 'KaPra Master Governance',
      email: 'admin@kalasetu.org',
      phoneNumber: '+919800000001',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      preferredLang: 'en',
      isPhoneVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      fullName: 'Arjun Sen',
      email: 'arjun.connoisseur@gmail.com',
      phoneNumber: '+919800000002',
      passwordHash: defaultPasswordHash,
      role: 'CUSTOMER',
      preferredLang: 'en',
      isPhoneVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
  });

  console.log('👤 Created Admin & Patron user accounts.');

  // 3. Create Craft Clusters & Surveyed Artisans
  const clusterData = [
    {
      slug: 'bishnupur-terracotta',
      name: 'Bishnupur Heritage Terracotta',
      state: 'West Bengal',
      district: 'Bankura',
      materialsUsed: JSON.stringify(['Local alluvial clay', 'Sand', 'River silt', 'Wood smoke']),
      isGiTagged: true,
      giRegNumber: 'GI-Cert #WB-08-TC',
      typicalBreakagePct: 27.5,
      description: 'Ancient red-clay lineage famous for Bankura horses and Panchratna temple relief plaques, characterized by distinct wood-fired ochre-red tones.',
      heroImageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
      artisan: {
        phone: '+919876543201',
        name: 'Dipankar Kundu',
        brandName: 'Pal Lineage Terracotta Studio',
        lineage: '5th Generation Pal Master Potter',
        story: 'Dipankar Kundu carries forward three centuries of sacred Bankura terracotta sculpture. Working alongside his extended family in Bishnupur, their master kilns produce timeless figures using fine river silt, historically plagued by 27.5% transit loss before KaPra SafeTransit™ bio-straw packaging.',
        address: 'Panchmura Potter Colony, Bishnupur, Bankura, West Bengal 722122',
        upiId: 'dipankar.pal@upi',
        hourlyBase: 13.1,
        experienceYears: 28,
        workshopSize: 5,
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
        products: [
          {
            title: 'Sacred Bishnupur Bankura Terracotta Horse (16-inch)',
            slug: 'sacred-bankura-terracotta-horse-16in',
            vernacularTitles: { hi: 'पवित्र बांकुड़ा टेराकोटा घोड़ा', bn: 'ঐতিহ্যবাহী বাঁকুড়ার টেরাকোটা ঘোড়া', gu: 'પરંપરાગત બાંકુરા ઘોડો' },
            description: 'The iconic heritage emblem of Indian craft. Sculpted by hand with hollow neck, elongated pointed ears, and ceremonial clay ornaments before open-air kiln firing.',
            vernacularDescs: {
              hi: 'प्राचीन बांकुड़ा मिट्टी से हस्तनिर्मित प्रतीकात्मक घोड़ा। शुभता और भारतीय विरासत का प्रतीक।',
              bn: 'বাঁকুড়ার পঞ্চমুড়ার খাঁটি পলিমাটির তৈরি ঐতিহাসিক ঘোড়া। ঘরে আনুন প্রাচীন ঐতিহ্যের স্পন্দন।',
              gu: 'પરંપરાગત લાલ માટીનો બનેલ કલાત્મક ઘોડો, પ્રાચીન ભારતીય સંસ્કૃતિનું પ્રતીક.',
            },
            category: 'Sculpture',
            subCategory: 'Heritage Statues',
            tags: ['terracotta', 'bankura-horse', 'GI-tagged', 'unglazed-clay'],
            retailPrice: 950,
            artisanBasePrice: 810,
            marketBenchmarkPrice: 2200,
            stockQuantity: 8,
            lengthCm: 18,
            widthCm: 12,
            heightCm: 40,
            weightGrams: 1400,
            fragilityClass: 'EXTREME',
            packagingTypeId: specTerracotta.id,
            images: [
              'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
            ],
          },
          {
            title: 'Terracotta Handi Pot with Steam-Lock Lid (2-Litre)',
            slug: 'terracotta-slow-cooking-handi-2l',
            vernacularTitles: { hi: 'प्राकृतिक मिट्टी की हांडी', bn: 'টেরাকোটা রান্নার হাঁড়ি', gu: 'માટીની હાંડી' },
            description: 'Slow-cooking earthen handi enriched with alkaline alluvial clay minerals. Imparts authentic earthy aroma and retains 100% natural food nutrition.',
            vernacularDescs: {
              hi: 'पोषक तत्वों से भरपूर प्राकृतिक मिट्टी की हांडी। धीमी आंच पर पकाने के लिए सर्वोत्तम।',
              bn: 'খাঁটি পলিমাটির রান্নার হাঁড়ি। স্বাস্থ্যের পক্ষে উপকারী এবং খাবারের প্রাকৃতিক স্বাদ বজায় রাখে।',
              gu: 'સ્વાસ્થ્યપ્રદ ધીમી રસોઈ માટે પરંપરાગત માટીની હાંડી.',
            },
            category: 'Serveware',
            subCategory: 'Cookware',
            tags: ['terracotta', 'cookware', 'handi', 'alkaline-clay'],
            retailPrice: 720,
            artisanBasePrice: 615,
            marketBenchmarkPrice: 1600,
            stockQuantity: 12,
            lengthCm: 22,
            widthCm: 22,
            heightCm: 18,
            weightGrams: 1650,
            fragilityClass: 'HIGH',
            packagingTypeId: specTerracotta.id,
            images: [
              'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
            ],
          },
        ],
      },
    },
    {
      slug: 'jaipur-blue-pottery',
      name: 'Jaipur GI Blue Pottery',
      state: 'Rajasthan',
      district: 'Jaipur',
      materialsUsed: JSON.stringify(['Quartz powder 80%', 'Cullet glass', 'Soda bicarbonate', 'Gum katira', 'Cobalt oxide']),
      isGiTagged: true,
      giRegNumber: 'GI-Cert #RJ-12-BP',
      typicalBreakagePct: 6.5,
      description: 'Clay-free composite ceramic craft renowned for vibrant turquoise cobalt hues, Mughal floral geometry, and glass-glazed sheen.',
      heroImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80',
      artisan: {
        phone: '+919876543202',
        name: 'Nand Kishore',
        brandName: 'Kishore Blue Pottery Works',
        lineage: 'Master Craftsman & Factory Cluster Lead',
        story: 'Nand Kishore runs an artisan workshop in Jaipur employing 35 craftspeople. Using traditional quartz dough and lead-free natural mineral glazes, their studio produces up to 10,000 units monthly during dry seasons, supported on KaPra by monsoon advance buffering.',
        address: 'Kot Jewar Blue Pottery Hub, Jaipur, Rajasthan 303908',
        upiId: 'nandkishore.ceramics@upi',
        hourlyBase: 150.0,
        experienceYears: 32,
        workshopSize: 35,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
        products: [
          {
            title: 'Jaipur Blue Pottery Royal Peacock Dinner Plate (10-inch)',
            slug: 'jaipur-blue-pottery-peacock-plate-10in',
            vernacularTitles: { hi: 'जयपुर ब्लू पॉटरी मयूर थाली', bn: 'জয়পুর ব্লু পটারি ময়ূর থালা', gu: 'જયપુર બ્લુ પોટરી પ્લેટ' },
            description: 'GI-certified quartz ceramic plate hand-painted with radiant cobalt blue peacock motifs and Persian arabesque scrolls. Double-fired with smooth lead-free food-safe glaze.',
            vernacularDescs: {
              hi: 'जीआई प्रमाणित जयपुर ब्लू पॉटरी की शाही थाली। नीले मोरों और पारंपरिक बेल-बूटों से सुसज्जित।',
              bn: 'জিআই শংসাপত্রযুক্ত ঐতিহ্যবাহী জয়পুর ব্লু পটারির নকশাদার রাজকীয় প্লেট।',
              gu: 'જીઆઈ પ્રમાણિત ક્વોર્ટ્ઝ સિરામિક પ્લેટ, મોર અને શાહી ડિઝાઈન સાથે.',
            },
            category: 'Serveware',
            subCategory: 'Plates & Platters',
            tags: ['jaipur-blue-pottery', 'GI-tagged', 'cobalt-blue', 'food-safe-glaze'],
            retailPrice: 650,
            artisanBasePrice: 550,
            marketBenchmarkPrice: 1450,
            stockQuantity: 24,
            lengthCm: 25,
            widthCm: 25,
            heightCm: 3,
            weightGrams: 750,
            fragilityClass: 'HIGH',
            packagingTypeId: specBluePottery.id,
            images: [
              'https://images.unsplash.com/photo-1615529328331-f8917597711f?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
            ],
          },
          {
            title: 'Turquoise Lattice Table Lamp Base (12-inch)',
            slug: 'jaipur-blue-pottery-turquoise-table-lamp',
            vernacularTitles: { hi: 'फ़िरोज़ा ब्लू पॉटरी लैंप', bn: 'ব্লু পটারি টেবিল ল্যাম্প', gu: 'ટર્કોઇઝ સિરામિક લેમ્પ' },
            description: 'Hand-thrown quartz ceramic lamp base with intricate jaali lattice perforations that cast enchanting shadow mandalas when illuminated.',
            vernacularDescs: {
              hi: 'हाथ से गढ़ा गया आकर्षक टेबल लैंप बेस। कमरे को देता है एक मनमोहक राजस्थानी स्पर्श।',
              bn: 'জয়পুরি ব্লু পটারির অনবদ্য কারুকাজ করা ল্যাম্প শেড। ঘরের সৌন্দর্য বৃদ্ধি করে।',
              gu: 'હાથથી બનાવેલ કલાત્મક સિરામિક ટેબલ લેમ્પ.',
            },
            category: 'Home Decor',
            subCategory: 'Lighting',
            tags: ['blue-pottery', 'lighting', 'home-decor', 'quartz'],
            retailPrice: 1450,
            artisanBasePrice: 1230,
            marketBenchmarkPrice: 3200,
            stockQuantity: 6,
            lengthCm: 18,
            widthCm: 18,
            heightCm: 30,
            weightGrams: 1600,
            fragilityClass: 'HIGH',
            packagingTypeId: specBluePottery.id,
            images: [
              'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80',
            ],
          },
        ],
      },
    },
    {
      slug: 'kutch-lippan-art',
      name: 'Kutch Lippan Kaam (Mud & Mirror Relief)',
      state: 'Gujarat',
      district: 'Kutch',
      materialsUsed: JSON.stringify(['Local mud silt', 'Straw', 'Chalk powder', 'Fevicol binder', 'Convex mirror glass (Aabhla)']),
      isGiTagged: false,
      giRegNumber: null,
      typicalBreakagePct: 15.0,
      description: 'Ancient Kutchi mud-relief mural tradition created by pastoral Rabari women, using hand-rolled clay coils and reflective mirror geometry.',
      heroImageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80',
      artisan: {
        phone: '+919876543203',
        name: 'Priya Jethwa',
        brandName: 'Aabhla Lippan Kaam Studio',
        lineage: 'Traditional Kutchi Mud-Relief Artisan',
        story: 'Priya Jethwa preserves the timeless mud-relief architecture of Bhunga desert homes. Through KaPra, she eliminated the ₹333/piece outsourced carpentry burden, directly creating and shipping authentic mirror relief murals to art collectors worldwide.',
        address: 'Hodka Crafts Village, Bhuj, Kutch, Gujarat 370510',
        upiId: 'priya.lippan@upi',
        hourlyBase: 30.8,
        experienceYears: 14,
        workshopSize: 1,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
        products: [
          {
            title: 'Sacred Kutch Sunburst Lippan Mirror Art (14x14 inch)',
            slug: 'kutch-sunburst-lippan-mirror-panel-14in',
            vernacularTitles: { hi: 'कच्छ लिप्पन कला सूर्य दर्पण', bn: 'কচ্ছ লিপ্পন মাটির আয়না শিল্প', gu: 'કચ્છી લિપ્પણ કામ સૂર્ય મિરર' },
            description: 'Hand-coiled natural clay relief with over 180 hand-cut Aabhla mirrors radiating in sacred solar geometry. Sealed with moisture-resistant natural lime wash.',
            vernacularDescs: {
              hi: 'कच्छ की पारंपरिक लिप्पन मिट्टी और आभला दर्पण कलाकृति। दीवारों को दे अद्वितीय लोक कला का वैभव।',
              bn: 'কচ্ছের ঐতিহ্যবাহী কাদা ও কাঁচের অপূর্ব শিল্পকর্ম। ঘরে ইতিবাচক শক্তি সঞ্চার করে।',
              gu: 'કચ્છની ધરતીની સુગંધ અને આભલાના ચમકારા સાથેનું અસલી લિપ્પણ કામ.',
            },
            category: 'Wall Decor',
            subCategory: 'Murals & Reliefs',
            tags: ['lippan-art', 'kutch', 'mud-and-mirror', 'wall-decor'],
            retailPrice: 1150,
            artisanBasePrice: 980,
            marketBenchmarkPrice: 2800,
            stockQuantity: 7,
            lengthCm: 35,
            widthCm: 35,
            heightCm: 3,
            weightGrams: 1250,
            fragilityClass: 'MEDIUM',
            packagingTypeId: specLippan.id,
            images: [
              'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
            ],
          },
        ],
      },
    },
    {
      slug: 'nizamabad-black-pottery',
      name: 'Nizamabad GI Smoked Black Pottery',
      state: 'Uttar Pradesh',
      district: 'Azamgarh',
      materialsUsed: JSON.stringify(['Local riverbed clay', 'Kabiz slip (mango bark & bamboo ash)', 'Silver foil inlay', 'Mustard oil burnish']),
      isGiTagged: true,
      giRegNumber: 'GI-Cert #UP-09-NZB',
      typicalBreakagePct: 12.0,
      description: 'World-famous black clay pottery achieved through oxygen-reduced smoke firing, lustrous herbal slip, and intricate silvery zinc-tin foil inlay.',
      heroImageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80',
      artisan: {
        phone: '+919876543204',
        name: 'Deepak Prajapati',
        brandName: 'Nizamabad Krishna Black Clay Studio',
        lineage: '4th Generation GI Black Potter',
        story: 'Deepak Prajapati represents the master black earthenware lineage of Nizamabad. Utilizing the ancient herbal Kabiz slip and closed saggar smoke chambers, every item boasts an intense obsidian black surface adorned with silvery floral engravings.',
        address: 'Mohalla Kumharan, Nizamabad, Azamgarh, Uttar Pradesh 276206',
        upiId: 'deepak.blackpottery@upi',
        hourlyBase: 25.0,
        experienceYears: 20,
        workshopSize: 3,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        products: [
          {
            title: 'GI Nizamabad Smoked Black Tea Set with Silver Floral Inlay',
            slug: 'nizamabad-gi-smoked-black-tea-set',
            vernacularTitles: { hi: 'निज़ामाबाद जीआई ब्लैक पॉटरी टी-सेट', bn: 'নিজামাবাদ কালো মাটির চা সেট', gu: 'નિઝામાબાદ બ્લેક પોટરી ટી-સેટ' },
            description: 'Authentic GI-certified smoked black earthenware teapot with 4 matching kulhads. Intricately carved by hand and infilled with silver foil alloy for dazzling metallic contrast.',
            vernacularDescs: {
              hi: 'धुएं की प्रक्रिया से काली की गई प्रामाणिक जीआई मिट्टी की केतली और कुल्हड़। चांदी जैसी नक्काशी।',
              bn: 'জিআই শংসাপত্রপ্রাপ্ত নিজামাবাদের বিখ্যাত কালো মাটির টি-পট ও কুলহড় সেট।',
              gu: 'ધૂપ પ્રક્રિયાથી બનેલ અસલી બ્લેક પોટરી ટી-સેટ, ચાંદીની કોતરણી સાથે.',
            },
            category: 'Serveware',
            subCategory: 'Tea & Coffee Sets',
            tags: ['black-pottery', 'GI-tagged', 'nizamabad', 'silver-inlay', 'earthenware'],
            retailPrice: 1250,
            artisanBasePrice: 1060,
            marketBenchmarkPrice: 2900,
            stockQuantity: 10,
            lengthCm: 25,
            widthCm: 20,
            heightCm: 18,
            weightGrams: 1400,
            fragilityClass: 'HIGH',
            packagingTypeId: specBluePottery.id,
            images: [
              'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80',
            ],
          },
        ],
      },
    },
    {
      slug: 'krishnanagar-clay-miniatures',
      name: 'Krishnanagar Hyper-Realistic Clay Models',
      state: 'West Bengal',
      district: 'Nadia',
      materialsUsed: JSON.stringify(['Ganga alluvial fine silt', 'Cotton lint fiber', 'Fine copper wire armatures', 'Natural earth pigments']),
      isGiTagged: true,
      giRegNumber: 'GI-Cert #WB-14-KN',
      typicalBreakagePct: 3.0,
      description: 'Master anatomical miniature sculpting tradition dating back to Maharaja Krishnachandra Roy in the 18th century, capturing rural Indian life with microscopic fidelity.',
      heroImageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80',
      artisan: {
        phone: '+919876543206',
        name: 'Shibu Biswas',
        brandName: 'Biswas Master Clay Sculpting Studio',
        lineage: 'National Award-Winning Miniature Sculptor',
        story: 'Shibu Biswas crafts astonishingly lifelike miniature figurines using fine Nadia alluvial silt infused with cotton lint. His works have been exhibited in major museums across Europe, now directly available on KaPra bypassing intermediary gallery markups.',
        address: 'Ghurni Clay Modellers Colony, Krishnanagar, Nadia, West Bengal 741101',
        upiId: 'shibu.miniatures@upi',
        hourlyBase: 110.0,
        experienceYears: 36,
        workshopSize: 2,
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
        products: [
          {
            title: 'Heritage Baul Singer Miniature Clay Figurine (8-inch)',
            slug: 'krishnanagar-heritage-baul-clay-miniature',
            vernacularTitles: { hi: 'कृष्णानगर बाउल गायक मिट्टी मूर्ति', bn: 'কৃষ্ণনগর বাউল মাটির মূর্তি', gu: 'કૃષ્ણાનગર ક્લે મૂર્તિ' },
            description: 'Museum-grade hyper-realistic sculpture of a rural Bengal Baul singer with ektara. Features microscopic anatomical detail, lifelike facial expressions, and hand-painted fabric folds.',
            vernacularDescs: {
              hi: 'अद्भुत सूक्ष्म बारीकियों से निर्मित कृष्णानगर की प्रसिद्ध मिट्टी मूर्ति। संगीत और संस्कृति का जीवंत रूप।',
              bn: 'কৃষ্ণনগরের ঘূর্ণির পৃথিবী বিখ্যাত সূক্ষ্ম মাটির একতারা হাতে বাউল ভাস্কর্য।',
              gu: 'અદ્ભુત કુદરતી વિગતો સાથે તૈયાર કરેલ પરંપરાગત ક્લે શિલ્પ.',
            },
            category: 'Sculpture',
            subCategory: 'Miniatures',
            tags: ['krishnanagar', 'clay-miniature', 'baul', 'GI-tagged', 'fine-art'],
            retailPrice: 1800,
            artisanBasePrice: 1530,
            marketBenchmarkPrice: 4800,
            stockQuantity: 4,
            lengthCm: 10,
            widthCm: 10,
            heightCm: 20,
            weightGrams: 450,
            fragilityClass: 'HIGH',
            packagingTypeId: specTerracotta.id,
            images: [
              'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
            ],
          },
        ],
      },
    },
    {
      slug: 'kumartuli-monumental-arts',
      name: 'Kumartuli Monumental Fine Arts & Portraiture',
      state: 'West Bengal',
      district: 'Kolkata',
      materialsUsed: JSON.stringify(['Ganga alluvial clay', 'Bamboo framework', 'Straw armature', 'Fiberglass resin', 'Cast bronze']),
      isGiTagged: false,
      giRegNumber: null,
      typicalBreakagePct: 17.5,
      description: 'The world capital of monumental deity sculptors. Famous for massive heritage armatures up to 22 feet, spiritual statues, and bespoke studio bronze commissions.',
      heroImageUrl: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=80',
      artisan: {
        phone: '+919876543207',
        name: 'Santu Roy',
        brandName: 'Roy Monumental Fine Arts Studio',
        lineage: 'Kumartuli Master Sculptor & Armature Architect',
        story: 'Santu Roy specializes in life-sized portraiture and sacred monumental sculptures up to 22 feet. Utilizing KaPra 3-stage milestone escrow and digital IP mold protection, his studio securely fulfills bespoke fine art commissions worldwide.',
        address: 'Kumartuli Ghat Road, Shobhabazar, Kolkata, West Bengal 700005',
        upiId: 'santu.kumartuli@upi',
        hourlyBase: 95.0,
        experienceYears: 24,
        workshopSize: 8,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        products: [
          {
            title: 'Terracotta & Bronze Fusion Buddha Head Sculpture (18-inch)',
            slug: 'kumartuli-terracotta-bronze-buddha-sculpture',
            vernacularTitles: { hi: 'बुद्ध ध्यानस्थ टेराकोटा कांस्य मूर्ति', bn: 'বুদ্ধ ধ্যানমগ্ন টেরাকোটা ও ব্রোঞ্জ ভাস্কর্য', gu: 'બુદ્ધ ટેરાકોટા કલાત્મક મૂર્તિ' },
            description: 'Serene meditative Buddha bust blending fired riverbed terracotta with antique bronze patina wash. Hand-sculpted facial symmetry inspiring peace and spiritual presence.',
            vernacularDescs: {
              hi: 'शांत भावमग्न बुद्ध प्रतिमा। गंगा की पवित्र मिट्टी और कांस्य मिश्रण से निर्मित मास्टरपीस।',
              bn: 'কুমোরটুলির মাস্টার ভাস্করের হাতে গড়া ধ্যানস্থ বুদ্ধের অপরূপ টেরাকোটা ভাস্কর্য।',
              gu: 'ધ્યાનસ્થ બુદ્ધની ભવ્ય કલાત્મક પ્રતિમા, પવિત્ર માટી અને કાંસાના મિશ્રણથી બનેલ.',
            },
            category: 'Sculpture',
            subCategory: 'Spiritual Statues',
            tags: ['buddha', 'kumartuli', 'terracotta-bronze', 'spiritual-art'],
            retailPrice: 2400,
            artisanBasePrice: 2040,
            marketBenchmarkPrice: 6200,
            stockQuantity: 3,
            lengthCm: 25,
            widthCm: 22,
            heightCm: 45,
            weightGrams: 3800,
            fragilityClass: 'HIGH',
            packagingTypeId: specTerracotta.id,
            images: [
              'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80',
            ],
          },
        ],
      },
    },
  ];

  for (const c of clusterData) {
    const cluster = await prisma.craftCluster.create({
      data: {
        slug: c.slug,
        name: c.name,
        state: c.state,
        district: c.district,
        materialsUsed: c.materialsUsed,
        isGiTagged: c.isGiTagged,
        giRegNumber: c.giRegNumber,
        typicalBreakagePct: c.typicalBreakagePct,
        description: c.description,
        heroImageUrl: c.heroImageUrl,
      },
    });

    const art = c.artisan;
    const artisanUser = await prisma.user.create({
      data: {
        fullName: art.name,
        phoneNumber: art.phone,
        passwordHash: defaultPasswordHash,
        role: 'ARTISAN',
        preferredLang: c.state === 'West Bengal' ? 'bn' : c.state === 'Gujarat' ? 'gu' : 'hi',
        isPhoneVerified: true,
        avatarUrl: art.avatar,
      },
    });

    const profile = await prisma.artisanProfile.create({
      data: {
        userId: artisanUser.id,
        clusterId: cluster.id,
        brandName: art.brandName,
        artisanLineage: art.lineage,
        storyNarrative: art.story,
        workshopAddress: art.address,
        upiId: art.upiId,
        hourlyEarningBase: art.hourlyBase,
        experienceYears: art.experienceYears,
        workshopSize: art.workshopSize,
        verificationStatus: 'VERIFIED',
      },
    });

    for (const p of art.products) {
      const createdProd = await prisma.product.create({
        data: {
          artisanId: profile.id,
          clusterId: cluster.id,
          title: p.title,
          slug: p.slug,
          vernacularTitles: JSON.stringify(p.vernacularTitles),
          description: p.description,
          vernacularDescs: JSON.stringify(p.vernacularDescs),
          category: p.category,
          subCategory: p.subCategory,
          tags: JSON.stringify(p.tags),
          retailPrice: p.retailPrice,
          artisanBasePrice: p.artisanBasePrice,
          marketBenchmarkPrice: p.marketBenchmarkPrice,
          stockQuantity: p.stockQuantity,
          lengthCm: p.lengthCm,
          widthCm: p.widthCm,
          heightCm: p.heightCm,
          weightGrams: p.weightGrams,
          fragilityClass: p.fragilityClass,
          safeTransitCertified: true,
          packagingTypeId: p.packagingTypeId,
          status: 'ACTIVE',
          images: {
            create: p.images.map((url, i) => ({
              imageUrl: url,
              isPrimary: i === 0,
              sortOrder: i,
            })),
          },
        },
      });

      // Add a verified authentic patron review
      await prisma.review.create({
        data: {
          productId: createdProd.id,
          userId: customerUser.id,
          rating: 5,
          headline: 'Masterpiece craftsmanship & zero transit damage!',
          comment: `Arrived securely packed in the bio-composite straw insert. You can feel the real texture of indigenous ${cluster.name}. Exceptional work!`,
          artisanPraise: `Thank you, ${art.name} ji, for preserving this master lineage!`,
          verifiedPurchase: true,
        },
      });
    }

    console.log(`✅ Seeded Cluster & Artisan: ${c.name} (${art.name}) with products.`);
  }

  // 4. Seed a Sample Completed Order to initialize Analytics and Ledger
  const sampleProduct = await prisma.product.findFirst({
    where: { slug: 'sacred-bankura-terracotta-horse-16in' },
  });

  if (sampleProduct) {
    const sampleOrderNumber = 'KS-2026-884120';
    const sampleOrder = await prisma.order.create({
      data: {
        orderNumber: sampleOrderNumber,
        customerId: customerUser.id,
        totalAmount: 1040,
        artisanShareTotal: 810,
        platformFeeTotal: 76,
        packagingFeeTotal: 15,
        shippingFeeTotal: 90,
        shippingAddress: JSON.stringify({
          fullName: 'Arjun Sen',
          street: '42 Chittaranjan Avenue, College Street',
          city: 'Kolkata',
          state: 'West Bengal',
          pincode: '700012',
          phone: '+919800000002',
        }),
        status: 'DELIVERED',
        safeTransitGuarantee: true,
        items: {
          create: [
            {
              productId: sampleProduct.id,
              artisanId: sampleProduct.artisanId,
              quantity: 1,
              unitPrice: 950,
              artisanUnitShare: 810,
              subtotal: 950,
              packagingStatus: 'PACKED_IN_BIO_STRAW',
              breakageClaimed: false,
            },
          ],
        },
      },
    });

    await prisma.paymentTransaction.create({
      data: {
        orderId: sampleOrder.id,
        razorpayOrderId: 'order_rzp_init_seed_01',
        razorpayPaymentId: 'pay_rzp_init_captured_01',
        razorpaySignature: 'sig_valid_test_seed_hmac',
        amount: 1040,
        currency: 'INR',
        status: 'CAPTURED',
        paymentMethod: 'UPI (GPay)',
      },
    });

    await prisma.shipmentRecord.create({
      data: {
        orderId: sampleOrder.id,
        trackingNumber: 'ST-2026-884120',
        carrierName: 'SafeTransit Fragile Express',
        shippingStatus: 'DELIVERED_INTACT',
        fragilityHandling: true,
        originPincode: '722122',
        destPincode: '700012',
        trackingTimeline: JSON.stringify([
          {
            status: 'ORDER_VERIFIED',
            title: 'Order Verified & Fair-Share Escrow Locked',
            timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
            location: 'Bishnupur Craft Hub',
            notes: '₹810 (85%) reserved for Dipankar Kundu lineage.',
          },
          {
            status: 'SAFE_TRANSIT_PACKED',
            title: 'Packed in Bio-Composite Straw Shock Insert',
            timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
            location: 'Panchmura Packaging Center',
            notes: 'Zero plastic thermocol; drop-tested straw cradle locked.',
          },
          {
            status: 'DELIVERED',
            title: 'Hand Delivered with Zero Breakage',
            timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
            location: 'Kolkata Destination',
            notes: 'Customer inspected and confirmed 100% intact terracotta.',
          },
        ]),
      },
    });

    await prisma.fairTradeAuditLog.create({
      data: {
        orderId: sampleOrder.id,
        artisanId: sampleProduct.artisanId,
        grossRetail: 950,
        artisanDirectPay: 810,
        packagingReserve: 28,
        breakagePoolReserve: 38,
        platformTechFee: 76,
      },
    });

    console.log('📦 Seeded initial delivered order & fair-trade audit log.');
  }

  console.log('🎉 Seeding successfully completed!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
