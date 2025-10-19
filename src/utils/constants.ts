import { proxyImage } from './proxyImage';

export const DEFAULT_PLACEHOLDER_IMAGE = 'https://jjepfehmuybpctdzipnu.supabase.co/storage/v1/object/public/fotos_airtable/app/sedan-2Artboard-12-trefa.png';

export const TREFA_WHATSAPP = '5218187049079';

export const BRAND_LOGOS: Record<string, string> = {
  'Nissan': '/images/Nissan.png',
  'Toyota': '/images/Toyota.png',
  'Honda': '/images/Honda.png',
  'Mazda': '/images/Mazda.png',
  'Volkswagen': '/images/Volkswagen.png',
  'Chevrolet': '/images/Chevrolet.png',
  'Ford': '/images/Ford.png',
  'Hyundai': '/images/Hyundai.png',
  'Kia': '/images/Kia.png',
  'BMW': '/images/BMW.png',
  'Mercedes-Benz': '/images/Mercedes-benz.png',
  'Audi': '/images/Audi.png',
   'Jeep': '/images/Jeep.png',
    'Dodge': '/images/Dodge.png',
    'GMC': '/images/GMC.png',
    'Peugeot': '/images/Peugeot.png',
    'Chrysler': '/images/Chrysler.png',
    'MG': '/images/MG.png',
    'Renault': '/images/Renault.png',
    'Land Rover': '/images/Land-Rover.png',
    'Volvo': '/images/Volvo.png',
    'Fiat': '/images/Fiat.png',
    'Ram': '/images/Ram.png',
    'Mitsubishi': '/images/Mitsubishi.png',
    'Buick': '/images/Buick.png',
    'Other': '/images/Other.png',
};

export const branchData = [
    {
        city: 'Monterrey',
        phone: '8187049079',
        address: 'Aaron Sáenz Garza #1902, Local 111 (Plaza Oasis), Col. Santa María | 64650 NL',
        imageUrl: proxyImage('http://5.183.8.48/wp-content/uploads/2025/02/TREFA-San-JEronimo.jpg'),
        directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Autos+TREFA+Suc.+Santa+Mar%C3%ADa,+Monterrey',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d20266.68731001804!2d-100.39056183742488!3d25.678753949794295!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86629701ae2b5ea9%3A0xdf7cc5199ffd3661!2sAutos+TREFA!5e0!3m2!1ses-419!2smx!4v1760614862872!5m2!1ses-419!2smx'
    },
    {
        city: 'Reynosa',
        phone: '8994602822',
        address: 'Boulevard Beethoven #100, Col. Narciso Mendoza | 88700, TMPS ',
        imageUrl: proxyImage('http://5.183.8.48/wp-content/uploads/2025/02/Reynosa.jpg'),
        directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=TREFA+Boulevard+Beethoven+100+Col+Narciso+Mendoza+Reynosa+Tamps',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d919409.403042456!2d-100.0018594359385!3d25.821944527038745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86650559b25facc9%3A0x2309737f95449f22!2sAutos%20TREFA!5e0!3m2!1ses-419!2smx!4v1760615128648!5m2!1ses-419!2smx'
    },
    {
        city: 'Guadalupe',
        phone: '8187049079',
        address: 'Hidalgo #918, Col. Paraíso | 67140 Centro de Guadalupe, NL',
        imageUrl: proxyImage('http://5.183.8.48/wp-content/uploads/2025/02/2023-02-03.jpg'),
        directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Autos+TREFA,+Hidalgo+918+Col+Paraiso+Centro+de+Guadalupe',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3595.8161808056575!2d-100.27112402363022!3d25.67738751208222!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8662bdeb19eb72eb%3A0x65eb12ea70bc37cb!2sAutos+TREFA!5e0!3m2!1ses-419!2smx!4v1760615208138!5m2!1ses-419!2smx'
    },
    {
        city: 'Saltillo',
        phone: '8442123399',
        address: 'Blvd. Nazario Ortiz #2060, Local 132, Col 16 | Saltillo, COAH 25253',
        imageUrl: proxyImage('http://5.183.8.48/wp-content/uploads/2025/02/Saltillo-Autos-TREFA.jpeg'),
        directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=TREFA+Saltillo+Blvd+Nazario+Ortiz+2060+Local+132+Col+16+Saltillo+Coah',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3602.810577905786!2d-100.99913802595996!3d25.44458312076059!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!0x86880d60393303c9%3A0x33b5413345239534!2sTrefa%20Saltillo!5e0!3m2!1ses-419!2smx!4v1709660339301!5m2!1ses-419!2smx'
    },
];