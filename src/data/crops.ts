export interface Crop {
  id: string;
  name: string;
  category: string;
  season: string;
  soil: string;
  temperature: string;
  irrigation: string;
  image: string;
  description: string;
}

export const INDIAN_CROPS: Crop[] = [
  {
    id: 'rice',
    name: 'Rice (Paddy)',
    category: 'Grains',
    season: 'Kharif (June-Oct)',
    soil: 'Clayey or Loamy',
    temperature: '20°C - 27°C',
    irrigation: 'High (Standing water)',
    image: 'https://picsum.photos/seed/rice/800/600',
    description: 'Rice is the staple food of India. It requires high temperature and high humidity with annual rainfall above 100 cm.'
  },
  {
    id: 'wheat',
    name: 'Wheat',
    category: 'Grains',
    season: 'Rabi (Nov-April)',
    soil: 'Well-drained Loamy',
    temperature: '10°C - 15°C (Growing), 21°C - 26°C (Ripening)',
    irrigation: 'Moderate',
    image: 'https://picsum.photos/seed/wheat/800/600',
    description: 'Wheat is the second most important cereal crop in India. It requires a cool growing season and bright sunshine at the time of ripening.'
  },
  {
    id: 'cotton',
    name: 'Cotton',
    category: 'Fiber',
    season: 'Kharif',
    soil: 'Black Soil (Regur)',
    temperature: '21°C - 30°C',
    irrigation: 'Moderate to Low',
    image: 'https://picsum.photos/seed/cotton/800/600',
    description: 'India is one of the largest producers of cotton. It requires 210 frost-free days and bright sunshine for its growth.'
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    category: 'Cash Crop',
    season: 'Year-round (10-12 months)',
    soil: 'Deep Rich Loamy',
    temperature: '21°C - 27°C',
    irrigation: 'High',
    image: 'https://picsum.photos/seed/sugarcane/800/600',
    description: 'Sugarcane is a tropical as well as a subtropical crop. It grows well in hot and humid climates.'
  },
  {
    id: 'maize',
    name: 'Maize (Corn)',
    category: 'Grains',
    season: 'Kharif',
    soil: 'Old Alluvial',
    temperature: '21°C - 27°C',
    irrigation: 'Moderate',
    image: 'https://picsum.photos/seed/maize/800/600',
    description: 'Maize is used both as food and fodder. It is a Kharif crop but in states like Bihar it is grown in Rabi season also.'
  }
];
