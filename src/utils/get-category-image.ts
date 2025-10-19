const categoryImages: Record<string, string> = {
  'suv': '/images/suv-filter.png',
  'sedán': '/images/sedan-filter.png',
  'pick-up': '/images/pickup-filter.png',
  'hatchback': '/images/hatchback-filter.png',
  'motos': '/images/motos-filter.png',
};

export const getCategoryImage = (category: string, value: string): string => {
  const normalizedValue = value.toLowerCase().replace(/\s+/g, '-');
  return categoryImages[normalizedValue] || '/images/icono.png';
};
