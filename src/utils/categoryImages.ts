// src/utils/categoryImages.ts

const brandImageMapping: Record<string, string> = {
  acura: '/images/Acura.png',
  audi: '/images/Audi.png',
  bmw: '/images/BMW.png',
  buick: '/images/Buick.png',
  cadillac: '/images/Cadillac.png',
  chevrolet: '/images/Chevrolet.png',
  dodge: '/images/Dodge.png',
  fiat: '/images/Fiat.png',
  ford: '/images/Ford.png',
  gmc: '/images/GMC.png',
  honda: '/images/Honda.png',
  hyundai: '/images/Hyundai.png',
  jeep: '/images/Jeep.png',
  kia: '/images/Kia.png',
  'land-rover': '/images/Land-Rover.png',
  lexus: '/images/Lexus.png',
  mazda: '/images/Mazda.png',
  'mercedes-benz': '/images/Mercedes-benz.png',
  mg: '/images/MG.png',
  mitsubishi: '/images/Mitsubishi.png',
  nissan: '/images/Nissan.png',
  peugeot: '/images/Peugeot.png',
  ram: '/images/Ram.png',
  renault: '/images/Renault.png',
  seat: '/images/SEAT.png',
  subaru: '/images/Subaru.png',
  suzuki: '/images/Suzuki.png',
  toyota: '/images/Toyota.png',
  volkswagen: '/images/Volkswagen.png',
  volvo: '/images/Volvo.png',
};

const classificationImageMapping: Record<string, string> = {
  suv: '/images/suv-filter.png',
  sedan: '/images/sedan-filter.png',
  'pick-up': '/images/pickup-filter.png',
  pickup: '/images/pickup-filter.png',
  hatchback: '/images/hatchback-filter.png',
  moto: '/images/motos-filter.png',
};

const defaultBanner = '/images/hero-showroom.webp';

export const getCategoryImage = (type: string, value: string): string => {
  const normalizedValue = value.toLowerCase().replace(/\s+/g, '-');
  
  if (type === 'marca' && brandImageMapping[normalizedValue]) {
    return brandImageMapping[normalizedValue];
  }
  
  if (type === 'clasificacion' && classificationImageMapping[normalizedValue]) {
    return classificationImageMapping[normalizedValue];
  }
  
  return defaultBanner;
};