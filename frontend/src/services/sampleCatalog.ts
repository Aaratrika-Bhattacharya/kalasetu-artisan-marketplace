import type { ArtisanProfile, Product } from '../types';
import { craftImage } from './catalog';

const examples = [
  { id: 'lippan', title: 'Sunburst Lippan Mirror', category: 'Wall Decor', craft: 'Lippan Kaam', place: 'Kutch', state: 'Gujarat', maker: 'Rina Vankar', years: 12, price: 1650, stock: 2, size: [32, 32, 3], materials: ['Clay', 'Mirror glass'], collections: ['Home decor'], featured: true,
    story: 'Small mirrors catch the light along a raised sunburst, a pattern designed for the wall near an entrance.',
    process: 'The maker rolls the prepared clay into narrow coils, builds the relief by hand and presses small mirrors into the pattern.',
    heritage: 'Lippan Kaam is a mud-relief and mirror-work tradition associated with decorated homes in Kutch.' },
  { id: 'wood', title: 'Carved Sheesham Desk Tray', category: 'Wooden Crafts', craft: 'Saharanpur Woodcarving', place: 'Saharanpur', state: 'Uttar Pradesh', maker: 'Amaan Saifi', years: 16, price: 1180, stock: 6, size: [26, 15, 4], materials: ['Sheesham wood'], collections: ['Office decor', 'Gifting'], featured: false,
    story: 'The tray keeps everyday desk objects together, with a carved edge that leaves the grain visible.',
    process: 'The maker carves the compartments, sands the edges and finishes the wood with a light coat of oil.',
    heritage: 'Saharanpur is known for workshops that specialise in carved wooden household objects and furniture.' },
  { id: 'terracotta', title: 'River Clay Bud Vase', category: 'Home Decor', craft: 'Bengal Terracotta', place: 'Bankura', state: 'West Bengal', maker: 'Anjana Pal', years: 14, price: 850, stock: 4, size: [13, 13, 21], materials: ['Terracotta clay'], collections: ['Home decor', 'Office decor'], featured: false,
    story: 'The soft ridges preserve the maker’s hand movements as the clay turned on the wheel.',
    process: 'The vase is wheel-thrown, left to dry slowly, and fired to bring out the natural rust tones.',
    heritage: 'Terracotta workshops in Bengal work with fired clay across household pottery, figures and architectural ornament.' },
  { id: 'blue-pottery', title: 'Indigo Vine Bowl', category: 'Pottery & Ceramics', craft: 'Jaipur Blue Pottery', place: 'Jaipur', state: 'Rajasthan', maker: 'Meera Saini', years: 18, price: 1420, stock: 3, size: [21, 21, 8], materials: ['Quartz', 'Glaze'], collections: ['Home decor', 'Gifting'], featured: true,
    story: 'Indigo vines curve around the bowl in a design that follows the shape of the rim.',
    process: 'A quartz-based body is shaped in a mould, dried, painted by hand, glazed and fired.',
    heritage: 'Jaipur blue pottery is known for its quartz-based body and painted decoration in cobalt and other colours.' },
  { id: 'madhubani', title: 'Fish Motif Madhubani Painting', category: 'Paintings', craft: 'Madhubani Painting', place: 'Madhubani', state: 'Bihar', maker: 'Kavita Jha', years: 11, price: 1850, stock: 0, size: [30, 22, 1], materials: ['Paper', 'Pigments'], collections: ['Home decor', 'Gifting'], featured: true,
    story: 'A brightly coloured fish sits within a border of repeated lines and leaf motifs.',
    process: 'The maker outlines the figures, fills the remaining spaces with fine marks, and layers colour onto handmade paper.',
    heritage: 'Madhubani painting comes from the Mithila region, where painted motifs have long appeared in domestic and ceremonial settings.' },
  { id: 'dokra', title: 'Lost-Wax Brass Horse', category: 'Metal Crafts', craft: 'Dhokra Casting', place: 'Bastar', state: 'Chhattisgarh', maker: 'Nirmala Markam', years: 19, price: 2350, stock: 2, size: [16, 6, 19], materials: ['Brass'], collections: ['Office decor', 'Gifting'], featured: true, lesserKnown: true,
    story: 'The horse’s ridged saddle and narrow legs show the small details formed in wax before casting.',
    process: 'The figure is modelled in wax, encased in clay and cast in brass. Each mould is broken to release the piece.',
    heritage: 'Dhokra is a lost-wax metal casting tradition practised by artisan communities in Bastar and other parts of India.' },
  { id: 'ikat', title: 'Indigo Sambalpuri Table Runner', category: 'Handloom & Textiles', craft: 'Sambalpuri Ikat', place: 'Sambalpur', state: 'Odisha', maker: 'Sabitri Meher', years: 21, price: 1560, stock: 5, size: [150, 32, 1], materials: ['Cotton'], collections: ['Home decor', 'Festivals'], featured: false,
    story: 'A restrained indigo pattern lets the soft edges of the dyed motifs show.',
    process: 'The yarn is bound and dyed in sections before weaving, so the motif emerges as the yarns align on the loom.',
    heritage: 'Sambalpuri ikat is associated with Odisha’s bandha resist-dyeing and handweaving traditions.' },
  { id: 'filigree', title: 'Silver Filigree Crescent Earrings', category: 'Jewellery', craft: 'Cuttack Tarakasi', place: 'Cuttack', state: 'Odisha', maker: 'Anjali Sahoo', years: 13, price: 1950, stock: 0, size: [4, 2, 1], materials: ['Silver'], collections: ['Gifting', 'Festivals'], featured: false, lesserKnown: true,
    story: 'Fine silver scrolls fill the crescent outline without hiding the open spaces between the wires.',
    process: 'The maker draws and twists fine silver wire, arranges it inside a frame and solders the pieces into place.',
    heritage: 'Tarakasi is the fine silver filigree craft associated with Cuttack, used for jewellery and decorative objects.' },
  { id: 'diyas', title: 'Handmade Diya Gift Set', category: 'Gifts', craft: 'Bengal Terracotta', place: 'Bankura', state: 'West Bengal', maker: 'Anjana Pal', years: 14, price: 680, stock: 8, size: [18, 14, 6], materials: ['Terracotta clay'], collections: ['Gifting', 'Festivals'], featured: true,
    story: 'Two clay lamps come in a simple gift box for festival evenings and housewarmings.',
    process: 'The lamps are shaped by hand, dried and fired before being fitted into a cushioned box.',
    heritage: 'Clay diyas are widely used during Diwali and other household ceremonies.' },
];

export const sampleProducts: Product[] = examples.map((example) => ({
  id: `sample-${example.id}`, slug: example.id, isDemo: true, isTrendingSample: example.featured,
  title: example.title, description: example.story, category: example.category, tags: [example.craft],
  artisanBasePrice: Math.round(example.price * 0.82), retailPrice: example.price,
  stockQuantity: example.stock, isMadeToOrder: example.id === 'madhubani', leadTimeDays: example.id === 'madhubani' ? 10 : 3,
  dimensions: { lengthCm: example.size[0], widthCm: example.size[1], heightCm: example.size[2], weightGrams: null },
  craftDetails: {
    artForm: example.craft, story: example.story, makingProcess: example.process, heritage: example.heritage,
    materials: example.materials, collections: example.collections,
    careInstructions: example.id === 'ikat' ? 'Hand wash separately in cold water and dry in shade.' :
      example.id === 'filigree' ? 'Store dry in a soft pouch and polish gently with a silver cloth.' :
      'Dust gently with a soft, dry cloth. Keep away from prolonged moisture.',
  },
  images: [{ id: example.id, imageUrl: craftImage(example.id), isPrimary: true }],
  fragilityClass: ['wood', 'ikat', 'filigree', 'dokra'].includes(example.id) ? 'LOW' : 'HIGH',
  safeTransitCertified: false,
  artisan: { id: `sample-artisan-${example.maker}`, artisanName: example.maker, brandName: `${example.place} Workshop` },
  cluster: {
    id: `sample-cluster-${example.craft}`, slug: example.id, name: example.craft,
    state: example.state, district: example.place, materialsUsed: example.materials, isGiTagged: false,
    typicalBreakagePct: 0, description: example.heritage,
  },
}));

export const sampleCraftSources: Record<string, string> = {
  'blue-pottery': 'https://www.india.gov.in/explore-india/odop/details/blue-pottery-of-jaipur',
  madhubani: 'https://tourism.bihar.gov.in/en/experiences/art-and-craft/painting/madhubani-or-mithila-painting',
  dokra: 'https://bastar.gov.in/en/departments/handicraft/',
  ikat: 'https://dot.odisha.gov.in/en/explore-odisha/art-and-crafts-odisha',
  filigree: 'https://crafts.odisha.gov.in/?crafts=silver-filigree',
  wood: 'https://search.ipindia.gov.in/GIRPublicSearch/Application/Details/184',
};

export const lesserKnownCrafts = examples.filter((example) => example.lesserKnown);

const makerStories: Record<string, string> = {
  lippan: 'Rina learned to roll clay coils for wall reliefs at home. She now works on smaller mirror panels that bring the same patterns into apartments.',
  wood: 'Amaan learned marking and hand carving at his family’s workbench. His desk pieces are designed around small, everyday objects.',
  terracotta: 'Anjana learned to judge when clay was dry enough to fire by watching her family’s kilns. She makes small batches and keeps the wheel marks visible.',
  'blue-pottery': 'Meera began by painting borders in a Jaipur workshop. She now draws plant motifs that follow the shape of each vessel.',
  madhubani: 'Kavita grew up sketching motifs for family celebrations. She paints on paper and explores how traditional borders can frame animals and plants.',
  dokra: 'Nirmala started by helping shape fine wax threads. In her own workshop, she turns those textures into individual brass figures.',
  ikat: 'Sabitri learned to wind yarn and count repeats at a family loom. She now weaves runners with smaller repeats suited to everyday tables.',
  filigree: 'Anjali started with simple wire loops and gradually moved to openwork jewellery. She designs each piece around how light passes through the silver.',
};

export function getSampleArtisan(id: string): (ArtisanProfile & { products: Product[]; isDemo: boolean; avatarUrl: string }) | undefined {
  const products = sampleProducts.filter((product) => product.artisan.id === id);
  if (!products.length) return undefined;
  const example = examples.find((item) => item.id === products[0].slug);
  return {
    ...products[0].artisan, workshopAddress: `${example.place}, ${example.state}`, cluster: products[0].cluster,
    storyNarrative: makerStories[example.id], avatarUrl: craftImage(`maker-${example.id}`),
    verificationStatus: 'PENDING', experienceYears: example.years, workshopSize: 1, products, isDemo: true,
  };
}
