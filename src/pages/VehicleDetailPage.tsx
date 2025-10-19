import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import VehicleService from '../services/VehicleService';
import { useVehicles } from '../context/VehicleContext';
import type { WordPressVehicle, InspectionReportData } from '../types/types';
import { formatPrice, formatMileage, getVideoEmbedUrl, formatPromotion, getPlaceholderImage, getPromotionType } from '../utils/formatters';
import {
    HeartIcon,
    SolidHeartIcon,
    WhatsAppIcon,
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CalculatorIcon,
    EditIcon,
    EyeIcon,
    DatabaseIcon,
    ShieldCheckIcon,
    FileTextIcon,
    UsersIcon,
    PlayCircleIcon,
    CarIcon,
} from '../components/icons';
import { Fuel, Cog, Wrench, MapPin, Maximize } from 'lucide-react';
import LazyImage from '../components/LazyImage';
import Lightbox from '../components/Lightbox';
import Breadcrumbs from '../components/Breadcrumbs';
import { useFavorites } from '../hooks/useFavorites';
import RecentlyViewed from '../components/RecentlyViewed';
import useSEO from '../hooks/useSEO';
import { useAuth } from '../context/AuthContext';
import InspectionReport from '../components/InspectionReport';
import { InspectionService } from '../services/InspectionService';
import { FavoritesService } from '../services/FavoritesService';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import AuthBenefitsBlock from '../components/AuthBenefitsBlock';
import TestimonialCta from '../components/TestimonialCta';
import VehicleGridCard from '../components/VehicleGridCard';


// =================================================================================
// TYPE DEFINITIONS
// =================================================================================

type LightboxMediaItem = {
    type: 'image' | 'video';
    url: string;
};

type MediaItem = {
    type: 'image' | 'video';
    src: string;
    thumbnail: string;
};

// =================================================================================
// HELPER FUNCTIONS & CONSTANTS
// =================================================================================

const TABS = [
  { id: 'specs', label: 'Ficha', icon: FileTextIcon },
  { id: 'calculator', label: 'Calculadora', icon: CalculatorIcon },
  { id: 'inspection', label: 'Inspección', icon: ShieldCheckIcon },
];

const cardStyle = "bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80";

const calculateMonthlyPayment = (price: number, dp: number, term: number, annualRate: number): number => {
    const loanAmount = price - dp;
    if (loanAmount <= 0 || term <= 0 || !isFinite(loanAmount)) return 0;
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) return loanAmount / term;
    const n = term;
    const numerator = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n);
    const denominator = Math.pow(1 + monthlyRate, n) - 1;
    if (denominator === 0) return 0;
    return numerator / denominator;
};

// =================================================================================
// SUB-COMPONENTS
// =================================================================================

const MediaGallery: React.FC<{
    mediaItems: MediaItem[],
    activeMedia: MediaItem | null,
    setActiveMedia: (media: MediaItem) => void,
    handleOpenLightbox: () => void,
    vehicleTitle: string,
    promociones?: string[],
}> = React.memo(({ mediaItems, activeMedia, setActiveMedia, handleOpenLightbox, vehicleTitle, promociones }) => {
    const thumbnailContainerRef = useRef<HTMLDivElement>(null);
    const activeThumbnailRef = useRef<HTMLButtonElement>(null);

    const activeIndex = useMemo(() => mediaItems.findIndex(item => item.src === activeMedia?.src), [mediaItems, activeMedia]);

    const goToIndex = useCallback((index: number) => {
        const newIndex = (index + mediaItems.length) % mediaItems.length;
        if (mediaItems[newIndex]) {
            setActiveMedia(mediaItems[newIndex]);
        }
    }, [mediaItems, setActiveMedia]);

    const goToNext = useCallback(() => goToIndex(activeIndex + 1), [activeIndex, goToIndex]);
    const goToPrev = useCallback(() => goToIndex(activeIndex - 1), [activeIndex, goToIndex]);

    useEffect(() => {
        activeThumbnailRef.current?.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest'
        });
    }, [activeIndex]);

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const swipeThreshold = 50;
        if (info.offset.x > swipeThreshold) {
            goToPrev();
        } else if (info.offset.x < -swipeThreshold) {
            goToNext();
        }
    };

    const bonusPromo = useMemo(() => {
        if (!promociones) return null;
        const promo = promociones.find(p => ['bonus', 'reduction'].includes(getPromotionType(p)));
        return promo ? formatPromotion(promo) : null;
    }, [promociones]);

    const embedUrl = activeMedia?.type === 'video' ? getVideoEmbedUrl(activeMedia.src) : null;
    const isEmbed = embedUrl && (embedUrl.includes('embed') || embedUrl.includes('player.vimeo') || embedUrl.includes('drive.google.com'));

    const Thumbnails = () => (
        <div ref={thumbnailContainerRef} className="thumbnail-carousel flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scroll-smooth">
            {mediaItems.map((item, index) => (
                <button
                    key={index}
                    ref={activeIndex === index ? activeThumbnailRef : null}
                    onClick={() => setActiveMedia(item)}
                    className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden relative border-2 transition-all ${activeMedia?.src === item.src ? 'border-primary-500' : 'border-transparent hover:border-primary-300'}`}
                    aria-label={`View image ${index + 1}`}
                >
                    <LazyImage src={item.thumbnail} alt={`Thumbnail ${index + 1}`} className="w-full h-full" objectFit="cover" />
                    {item.type === 'video' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <PlayCircleIcon className="w-8 h-8 text-white/80" />
                        </div>
                    )}
                </button>
            ))}
        </div>
    );

    const MainViewer = () => (
        <motion.div
            className="aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg relative group cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            dragListener={!isEmbed} // Disable drag on iframes
        >
            {bonusPromo && (
                <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-4 py-2 rounded-full shadow-lg animate-fade-in-up text-sm">
                    {bonusPromo}
                </div>
            )}

            <AnimatePresence initial={false}>
                <motion.div
                    key={activeMedia?.src}
                    className="absolute inset-0 w-full h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeMedia?.type === 'image' && (
                        <button onClick={handleOpenLightbox} className="w-full h-full">
                            <LazyImage src={activeMedia.src} alt="Vista principal del auto" className="w-full h-full" objectFit="cover" />
                        </button>
                    )}
                    {activeMedia?.type === 'video' && (
                        isEmbed ? (
                            <iframe key={activeMedia.src} src={embedUrl || ''} title={`${vehicleTitle} video`} className="w-full h-full object-cover" allow="autoplay; encrypted-media; picture-in-picture"></iframe>
                        ) : (
                            <video key={activeMedia.src} src={activeMedia.src} controls autoPlay muted className="w-full h-full object-cover" poster={mediaItems.find(i => i.type === 'image')?.src}></video>
                        )
                    )}
                </motion.div>
            </AnimatePresence>

            <button onClick={handleOpenLightbox} className="absolute top-4 right-4 bg-black/30 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100 z-20">
                <Maximize className="w-7 h-7" />
            </button>

            {mediaItems.length > 1 && (
                <>
                    <button onClick={goToPrev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center" aria-label="Previous image">
                        <ChevronLeftIcon className="w-8 h-8" />
                    </button>
                    <button onClick={goToNext} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/50 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center" aria-label="Next image">
                        <ChevronRightIcon className="w-8 h-8" />
                    </button>
                </>
            )}
        </motion.div>
    );

    return (
        <div>
            <MainViewer />
            {mediaItems.length > 1 && <div className="mt-4"><Thumbnails /></div>}
        </div>
    );
});


const TitlePriceActionsBlock: React.FC<{
    vehicle: WordPressVehicle;
    financeData: any;
    favoriteCount: number;
    isFavorite: boolean;
    onToggleFavorite: () => void;
    onFinancingClick: () => void;
}> = React.memo(({ vehicle, financeData, favoriteCount, isFavorite, onToggleFavorite, onFinancingClick }) => (
    <div className={cardStyle}>
        <div>
            {vehicle.ordencompra && (
                <p className="text-xs font-light text-gray-500 uppercase tracking-widest mb-1">
                    {vehicle.ordencompra}
                </p>
            )}
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">{vehicle.titulo}</h1>
            <div className="mt-2 flex items-center gap-x-4 gap-y-1 text-sm text-gray-500 flex-wrap">
                <div className="flex items-center gap-1.5"> <HeartIcon className="w-4 h-4 text-red-400" /> <span className="font-medium">{favoriteCount} {favoriteCount === 1 ? 'favorito' : 'favoritos'}</span> </div>
                <div className="flex items-center gap-1.5"> <EyeIcon className="w-4 h-4" /> <span className="font-medium">{(vehicle.viewcount || 0).toLocaleString('es-MX')} vistas</span> <PopularityBadge viewCount={vehicle.view_count || 0} /> </div>
            </div>
        </div>
        <div className="mt-4">
            <p className="text-4xl font-black text-orange-600">{formatPrice(financeData?.displayedPrice ?? 0)} <span className="text-xl font-semibold text-gray-500 align-baseline">MXN</span></p>
            {financeData?.hasReduction && <p className="text-base text-gray-500 line-through">{formatPrice(vehicle.precio)}</p>}
        </div>

        {vehicle.promociones && vehicle.promociones.length > 0 && (
            <div className="mt-4">
                <sup className="text-sm font-semibold italic text-gray-700">
                    <i>¡{vehicle.promociones.map(p => formatPromotion(p)).join('! + ¡')}!</i>
                </sup>
            </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
            <button data-gtm-id="detail-page-finance" onClick={onFinancingClick} className="w-full text-center bg-primary-600 text-white font-bold py-3.5 px-6 rounded-lg hover:bg-primary-700 text-lg shadow-md transition-all"> Comprar con financiamiento </button>
            <a href={`https://wa.me/5218187049079?text=${encodeURIComponent(`Hola, me interesa el ${vehicle.titulo}`)}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 text-lg shadow-md transition-all"> <WhatsAppIcon className="w-6 h-6" /> Contactar por WhatsApp </a>
            <button data-gtm-id="detail-page-favorite" onClick={onToggleFavorite} className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 border-2 border-gray-300 text-lg shadow-sm transition-all"> {isFavorite ? <SolidHeartIcon className="w-6 h-6 text-red-500" /> : <HeartIcon className="w-6 h-6" />} {isFavorite ? 'Guardado' : 'Añadir a favoritos'} ({favoriteCount}) </button>
        </div>
    </div>
));

const CharacteristicsSection: React.FC<{ vehicle: WordPressVehicle; inspectionData: InspectionReportData | null; }> = React.memo(({ vehicle, inspectionData }) => {
    const features = useMemo(() => {
        const list = [];
        const carroceria = vehicle.clasificacionid?.[0];
        if (carroceria) list.push({ icon: CarIcon, text: carroceria });

        if (vehicle.transmision && vehicle.transmision !== null) list.push({ icon: Cog, text: vehicle.transmision});

        if (vehicle.autocombustible && vehicle.autocombustible !== null) list.push({ icon: Fuel, text: `${vehicle.autocombustible}` });

        if (vehicle.motor) list.push({ icon: Wrench, text: `Motor: ${vehicle.motor}` });

        if (vehicle.cilindros) list.push({ icon: DatabaseIcon, text: `${vehicle.cilindros} Cilindros` });
        if (vehicle.kilometraje && vehicle.kilometraje !== null) {
            const kilometrajeFormatted = formatMileage(vehicle.kilometraje);
            list.push({ icon: UsersIcon, text: `${kilometrajeFormatted}` });
        }

        const pastOwners = inspectionData?.past_owners ?? 1;
        list.push({ icon: UsersIcon, text: `${pastOwners} ${pastOwners === 1 ? 'Dueño' : 'Dueños'}` });

        if (vehicle.sucursal?.length > 0) list.push({ icon: MapPin, text: `Sucursal: ${vehicle.sucursal.join(', ')}` });

        return list;
    }, [vehicle, inspectionData]);

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 pt-2.5">Características</h3>
            <div className="grid grid-cols-1 gap-4">
                {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <feature.icon className="w-6 h-6 text-orange-500 flex-shrink-0" />
                        <span className="text-base text-gray-800">{feature.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
});

const FinanceHighlightItem: React.FC<{ title: string; subtitle: string; downPayment: string; monthlyPayment: string; term: number; isRecommended?: boolean }> = React.memo(({ title, subtitle, downPayment, monthlyPayment, term, isRecommended }) => (
    <div className={`p-4 rounded-lg ${isRecommended ? 'bg-primary-50 border-primary-200' : 'bg-gray-100 border-gray-200'} border`}>
        <p className={`font-bold ${isRecommended ? 'text-primary-800' : 'text-gray-800'}`}>{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
        <p className="text-xs font-semibold text-orange-600 mt-1">Plazo: {term} meses | Tasa: 12.99%</p>
        <div className="mt-3 space-y-2 text-sm text-gray-800">
            <div className="flex justify-between"><span>Enganche:</span> <span className="font-semibold">{downPayment}</span></div>
            <div className="flex justify-between"><span>Mensualidad Aprox:</span> <span className="font-semibold">{monthlyPayment}</span></div>
        </div>
    </div>
));

const FinancingHighlights: React.FC<{ vehicle: WordPressVehicle }> = React.memo(({ vehicle }) => {
    const financing = useMemo(() => {
        const price = vehicle.autoprecio;
        const term = vehicle.plazomax || 60;
        const rate = 12.99;

        const engancheMinimo = vehicle.enganchemin > 0 ? vehicle.enganchemin : price * 0.15;
        const mensualidadMinima = vehicle.mensualidad_minima > 0 
            ? vehicle.mensualidad_minima 
            : calculateMonthlyPayment(price, engancheMinimo, term, rate);

        const engancheRecomendado = vehicle.enganche_recomendado > 0
            ? vehicle.enganche_recomendado
            : price * 0.35;
        const mensualidadRecomendada = vehicle.mensualidad_recomendada > 0
            ? vehicle.mensualidad_recomendada
            : calculateMonthlyPayment(price, engancheRecomendado, term, rate);
        
        return { engancheMinimo, mensualidadMinima, engancheRecomendado, mensualidadRecomendada, term };
    }, [vehicle]);

    return (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Escenarios de Financiamiento</h2>
            <div className="space-y-4 text-gray-700 text-base">
                <FinanceHighlightItem
                    title="Dejando un Enganche Mínimo"
                    subtitle="*Incluye seguro y otros cargos"
                    downPayment={formatPrice(financing.engancheMinimo)}
                    monthlyPayment={formatPrice(financing.mensualidadMinima)}
                    term={financing.term}
                />
                <FinanceHighlightItem
                    title="Dejando un Enganche Recomendado"
                    subtitle="(35% del valor del auto)"
                    downPayment={formatPrice(financing.engancheRecomendado)}
                    monthlyPayment={formatPrice(financing.mensualidadRecomendada)}
                    term={financing.term}
                    isRecommended
                />
            </div>
        </div>
    );
});

const FeatureFinancingSection: React.FC<{ vehicle: WordPressVehicle; inspectionData: InspectionReportData | null; }> = React.memo(({ vehicle, inspectionData }) => (
    <div className={cardStyle}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-1">
                <CharacteristicsSection vehicle={vehicle} inspectionData={inspectionData} />
            </div>
            <div className="md:col-span-2">
                <FinancingHighlights vehicle={vehicle} />
            </div>
        </div>
    </div>
));


const DescriptionSection: React.FC<{ content: string }> = React.memo(({ content }) => {
    if (!content) return null;
    return (
        <div className={cardStyle}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción del Auto</h2>
            <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
});

const SimilarVehicles: React.FC<{ vehicle: WordPressVehicle; allVehicles: WordPressVehicle[] }> = React.memo(({ vehicle, allVehicles }) => {
    const similarVehicles = useMemo(() => {
        const priceRange = vehicle.autoprecio * 0.2; // 20% price range
        const minPrice = vehicle.autoprecio - priceRange;
        const maxPrice = vehicle.autoprecio + priceRange;

        return allVehicles
            .filter(v =>
                v.id !== vehicle.id &&
                (v.automarca === vehicle.automarca || v.clasificacionid?.[0] === vehicle.clasificacionid?.[0]) &&
                v.autoprecio >= minPrice &&
                v.autoprecio <= maxPrice
            )
            .slice(0, 4);
    }, [vehicle, allVehicles]);

    if (similarVehicles.length === 0) return null;

    return (
        <div className="bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">También te puede interesar...</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {similarVehicles.map(v => (
                        <VehicleGridCard key={v.id} vehicle={v} />
                    ))}
                </div>
            </div>
        </div>
    );
});

const PopularityBadge: React.FC<{ viewCount: number }> = React.memo(({ viewCount }) => {
    if (viewCount < 1000) return null;
    let emojis = '🔥';
    if (viewCount >= 2000) emojis += '🔥';
    if (viewCount >= 3000) emojis += '🔥';
    return <span className="text-xl" role="img" aria-label="Popular">{emojis}</span>;
});

const InspectionSummary: React.FC<{ data: InspectionReportData; onSeeFullReport: () => void }> = React.memo(({ data, onSeeFullReport }) => {
    const points = useMemo(() => {
        return Object.values(data.inspection_points || {})
            .map(p => p[0])
            .filter(Boolean);
    }, [data.inspection_points]);

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
                <h3 className="font-bold text-primary-600">TREFA Certificado</h3>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-gray-700 pl-1">
                {points.slice(0, 4).map((point, i) => (
                    <li key={i} className="flex items-center gap-2">
                        <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{point}</span>
                    </li>
                ))}
            </ul>
            <button onClick={onSeeFullReport} className="text-sm font-semibold text-primary-600 hover:underline mt-3 w-full text-left">
                Ver reporte de inspección completo &rarr;
            </button>
        </div>
    );
});

const SummaryRow: React.FC<{ label: string; value: React.ReactNode; isLarge?: boolean }> = React.memo(({ label, value, isLarge }) => (
  <div className="flex justify-between items-baseline py-1">
    <span className={`text-sm ${isLarge ? 'font-semibold text-neutral-800' : 'text-gray-600'}`}>{label}</span>
    <span className={`font-bold ${isLarge ? 'text-2xl text-primary-600' : 'text-base text-neutral-800'}`}>{value}</span>
  </div>
));

const SpecItem: React.FC<{ label: string; value: string | number }> = React.memo(({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100">
    <dt className="text-sm text-gray-600">{label}</dt>
    <dd className="text-sm font-semibold text-gray-900">{value}</dd>
  </div>
));

const VehicleDetailLocation: React.FC<{ vehicle: WordPressVehicle }> = React.memo(({ vehicle }) => {
  if (!vehicle.sucursal || vehicle.sucursal.length === 0) return null;

  const addressQuery = vehicle.sucursal.join(', ');
  const encodedAddress = encodeURIComponent(addressQuery);
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodedAddress}&output=embed`;

  return (
    <div className={cardStyle}>
      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-orange-500" />
        Ubicación
      </h3>
      <p className="text-base text-gray-700 mb-3">{addressQuery}</p>

      <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-200">
        <iframe
          src={mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Mapa de ${addressQuery}`}
        ></iframe>
      </div>

      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700 font-semibold hover:underline"
      >
        Ver en Google Maps →
      </a>
    </div>
  );
});

const TabsSection: React.FC<{
    activeTab: 'specs' | 'calculator' | 'inspection';
    setActiveTab: (tab: 'specs' | 'calculator' | 'inspection') => void;
    isAdmin: boolean;
    vehicleId: number;
    specifications: { label: string; value: string | number }[];
    financeData: any;
    downPayment: number;
    setDownPayment: (dp: number) => void;
    loanTerm: number;
    setLoanTerm: (term: number) => void;
    inspectionLoading: boolean;
    inspectionData: InspectionReportData | null;
    onSeeFullReport: () => void;
}> = React.memo(({ activeTab, setActiveTab, isAdmin, vehicleId, specifications, financeData, downPayment, setDownPayment, loanTerm, setLoanTerm, inspectionLoading, inspectionData, onSeeFullReport }) => (
    <div className={cardStyle}>
        <div className="flex border-b">
            {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${activeTab === tab.id ? 'border-b-2 border-trefa-dark-blue text-trefa-dark-blue' : 'text-gray-500 hover:text-gray-800'}`}>
                    <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
            ))}
            {isAdmin && <Link to={`/escritorio/admin/inspections/${vehicleId}`} className="ml-auto px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-md flex items-center gap-2"><EditIcon className="w-4 h-4"/> Editar</Link>}
        </div>

        <div className="mt-6">
            {activeTab === 'specs' && <dl className="space-y-1">{specifications.map(spec => <SpecItem key={spec.label} {...spec} />)}</dl>}
            {activeTab === 'calculator' && financeData && (
                <div className="space-y-6">
                    <div>
                        <label htmlFor="downPayment" className="block text-sm font-medium text-gray-700">Enganche: <span className="font-bold">{formatPrice(downPayment)}</span></label>
                        <input id="downPayment" type="range" min={financeData.minDownPayment} max={financeData.maxDownPayment} value={downPayment} onChange={e => setDownPayment(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Plazo (meses):</label>
                        <div className="grid grid-cols-4 gap-2">
                            {financeData.loanTerms.map((term: number) => (
                                <button key={term} onClick={() => setLoanTerm(term)} className={`px-2 py-1 text-xs font-semibold rounded-md ${loanTerm === term ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{term}</button>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-dashed">
                        <SummaryRow label="Mensualidad estimada" value={formatPrice(financeData.monthlyPayment)} isLarge />
                        <SummaryRow label="Monto a financiar" value={formatPrice(financeData.displayedPrice - downPayment)} />
                        <SummaryRow label="Total pagado al final" value={formatPrice(financeData.totalPayment)} />
                    </div>
                    <p className="text-xs text-gray-500 text-center pt-2">*Estos montos no incluyen costos de seguro.</p>
                </div>
            )}
            {activeTab === 'inspection' && (
                inspectionLoading ? <p>Cargando reporte...</p> :
                inspectionData ? <InspectionSummary data={inspectionData} onSeeFullReport={onSeeFullReport} /> :
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700">Reporte de Inspección no Disponible</p>
                    <p className="text-xs text-gray-500 mt-1">Este auto aún no tiene un reporte de inspección público.</p>
                </div>
            )}
        </div>
    </div>
));


// =================================================================================
// MAIN COMPONENT
// =================================================================================

const VehicleDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { session, user, loading: authLoading } = useAuth();
    const { vehicles: allVehicles } = useVehicles();
    const [vehicle, setVehicle] = useState<WordPressVehicle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const { isFavorite, toggleFavorite } = useFavorites();
    const [activeTab, setActiveTab] = useState<'specs' | 'calculator' | 'inspection'>('specs');
    const [inspectionData, setInspectionData] = useState<InspectionReportData | null>(null);
    const [inspectionLoading, setInspectionLoading] = useState(true);
    const [favoriteCount, setFavoriteCount] = useState(0);

    const adminEmails = ['mariano.morales@autostrefa.mx', 'alejandro.trevino@autostrefa.mx'];
    const isAdmin = !!(user?.email && adminEmails.includes(user.email));
    const availableVehicles = useMemo(() => allVehicles, [allVehicles]);

    const { prevVehicle, nextVehicle } = useMemo(() => {
        if (!slug || availableVehicles.length === 0) return { prevVehicle: null, nextVehicle: null };
        const currentIndex = availableVehicles.findIndex(v => v.slug === slug);
        if (currentIndex === -1) return { prevVehicle: null, nextVehicle: null };
        const prev = currentIndex > 0 ? availableVehicles[currentIndex - 1] : null;
        const next = currentIndex < availableVehicles.length - 1 ? availableVehicles[currentIndex + 1] : null;
        return { prevVehicle: prev, nextVehicle: next };
    }, [slug, availableVehicles]);

    const [lightboxMedia, setLightboxMedia] = useState<LightboxMediaItem[]>([]);
    const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
    const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

    const mediaItems = useMemo<MediaItem[]>(() => {
        if (!vehicle) return [];
        const items: MediaItem[] = [];
        const mainImage = vehicle.feature_image || getPlaceholderImage(vehicle);

        const imageUrls = [
            mainImage,
            ...(vehicle.galeria_exterior || []),
            ...(vehicle.galeria_interior || [])
        ];
        [...new Set(imageUrls.filter(Boolean))].forEach(url => items.push({ type: 'image', src: url, thumbnail: url }));

        const videoUrl = vehicle.video_reel;
        if (videoUrl) {
            items.push({ type: 'video', src: videoUrl, thumbnail: mainImage });
        }

        return items;
    }, [vehicle]);

    useEffect(() => {
        if (mediaItems.length > 0) setActiveMedia(mediaItems[0]);
        else if (vehicle) setActiveMedia({ type: 'image', src: vehicle.feature_image || getPlaceholderImage(vehicle), thumbnail: vehicle.feature_image || getPlaceholderImage(vehicle) });
    }, [mediaItems, vehicle]);

    useSEO({
        title: vehicle ? `${vehicle.titulo} en Venta | TREFA` : 'Detalles del Auto | TREFA',
        description: vehicle ? (vehicle.metadescripcion || `Encuentra el ${vehicle.titulo}, año ${vehicle.autoano} con ${formatMileage(vehicle.autokilometraje)} en TREFA. ¡Ofrecemos las mejores opciones de financiamiento para este ${vehicle.automarca}!`) : 'Cargando detalles del auto...',
        keywords: vehicle ? (vehicle.seo_keywords || `${vehicle.automarca}, ${vehicle.autosubmarcaversion}, ${vehicle.autoano}, seminuevo, en venta, financiamiento, TREFA`) : 'auto, seminuevo, TREFA'
    });

    const handleFinancingClick = () => {
        if (!vehicle) return;
        const financingUrl = session ? '/escritorio/aplicacion' : '/acceder';
        const urlWithParams = vehicle.ordencompra ? `${financingUrl}?ordencompra=${vehicle.ordencompra}` : financingUrl;
        navigate(urlWithParams);
    };

    useEffect(() => {
        const fetchVehicleData = async () => {
            if (!slug) {
                setError('No se proporcionó el identificador del auto.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            let vehicleData: WordPressVehicle | null | undefined = allVehicles.find(v => v.slug === slug);

            if (vehicleData) {
                console.log("✅ [VehicleDetail] Found vehicle in context.");
            } else {
                console.log("... Vehicle not in context, fetching from service.");
                try {
                    vehicleData = await VehicleService.getVehicleBySlug(slug);
                } catch (err: any) {
                    setError('Error al cargar los detalles del auto: ' + err.message);
                    setIsLoading(false);
                    return;
                }
            }

            if (vehicleData) {
                setVehicle(vehicleData);
                setInspectionLoading(true);
                try {
                    const [inspectionResult, favoriteCountResult] = await Promise.allSettled([
                        InspectionService.getInspectionByVehicleId(vehicleData.id),
                        FavoritesService.getFavoriteCountByVehicleId(vehicleData.id)
                    ]);

                    if (inspectionResult.status === 'fulfilled') setInspectionData(inspectionResult.value);
                    if (favoriteCountResult.status === 'fulfilled') setFavoriteCount(favoriteCountResult.value);

                } catch (error) {
                    console.error("Error fetching secondary data:", error);
                } finally {
                    setInspectionLoading(false);
                }
            } else {
                setError('Auto no encontrado.');
            }
            setIsLoading(false);
        };

        if (!authLoading) {
            fetchVehicleData();
        }
    }, [slug, allVehicles, authLoading]);

    const closeLightbox = () => setIsLightboxOpen(false);

    const handleOpenLightbox = () => {
        if (!activeMedia) return;
        const imageItems = mediaItems.filter(item => item.type === 'image');
        const lightboxItems = imageItems.map(item => ({ type: item.type, url: item.src }));
        const currentIndex = imageItems.findIndex(item => item.src === activeMedia.src);
        setLightboxMedia(lightboxItems);
        setLightboxStartIndex(currentIndex > -1 ? currentIndex : 0);
        setIsLightboxOpen(true);
    };

    const [downPayment, setDownPayment] = useState<number>(0);
    const [loanTerm, setLoanTerm] = useState<number>(48);

    useEffect(() => {
        if (vehicle) {
            const price = parseFloat(String(vehicle.precio_reduccion)) || vehicle.precio;
            const minDP = vehicle.engancheMinimo || price * 0.15;
            setDownPayment(minDP);

            const maxTerm = vehicle.plazomax || 60;
            const possibleTerms = [12, 24, 36, 48, 60].filter(t => t <= maxTerm);
            setLoanTerm(possibleTerms.includes(60) ? 60 : (possibleTerms.length > 0 ? possibleTerms[possibleTerms.length - 1] : 60));
        }
    }, [vehicle]);

    const financeData = useMemo(() => {
        if (!vehicle) return null;
        const CALC_INTEREST_RATE = 16.0; // Use a fixed 16% rate for the interactive calculator
        const price = parseFloat(String(vehicle.precio_reduccion)) || vehicle.precio;
        const monthlyPayment = calculateMonthlyPayment(price, downPayment, loanTerm, CALC_INTEREST_RATE);

        return {
            displayedPrice: price,
            hasReduction: price < vehicle.precio,
            minDownPayment: vehicle.engancheMinimo || price * 0.15,
            maxDownPayment: price > (vehicle.engancheMinimo || price * 0.15) ? price : (vehicle.engancheMinimo || price * 0.15) + 1,
            monthlyPayment,
            upperMonthlyPayment: 0, // No longer a range
            totalPayment: monthlyPayment > 0 ? (monthlyPayment * loanTerm) + downPayment : price,
            loanTerms: [12, 24, 36, 48, 60, 72].filter(t => t <= (vehicle.plazomax || 72)),
        };
    }, [vehicle, downPayment, loanTerm]);

    if (isLoading || authLoading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div></div>;
    if (error) return <div className="flex justify-center items-center h-screen"><p className="text-red-500 px-4 text-center">{error}</p></div>;
    if (!vehicle) return <div className="flex justify-center items-center h-screen"><p>Auto no encontrado.</p></div>;

    const crumbs = [{ name: 'Inventario', href: '/autos' }, { name: vehicle.titulo }];
    const specifications = [
        { label: 'Marca', value: vehicle.marca }, { label: 'Modelo', value: vehicle.modelo },
        { label: 'Año', value: vehicle.autoano }, { label: 'Kilometraje', value: formatMileage(vehicle.kilometraje) },
        { label: 'Color Exterior', value: vehicle.color_exterior }, { label: 'Color Interior', value: vehicle.color_interior },
        { label: 'Transmisión', value: vehicle.transmision }, { label: 'Combustible', value: vehicle.combustible },
        { label: 'Motor', value: vehicle.automotor }, { label: 'Cilindros', value: vehicle.autocilindros },
        { label: 'Garantía', value: vehicle.garantia }, { label: 'Siniestros', value: vehicle.nosiniestros },
        { label: 'Detalles Estéticos', value: vehicle.detalles_esteticos },
    ].filter(spec => spec.value && String(spec.value).trim() !== '' && String(spec.value).trim() !== '0');

  return (
    <>
      <div className="bg-white min-h-screen font-sans">
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="page-content">
          <div className="mb-6"><Breadcrumbs crumbs={crumbs} /></div>

          <nav className="no-print flex items-center justify-between bg-gray-100 p-2 rounded-xl mb-8 border border-gray-200">
            {/* Previous Vehicle */}
            {prevVehicle ? (() => {
              const prevImage = prevVehicle.feature_image ||
                                prevVehicle.thumbnail_webp ||
                                prevVehicle.thumbnail ||
                                prevVehicle.fotos_exterior?.[0] ||
                                prevVehicle.fotos_interior?.[0] ||
                                getPlaceholderImage(prevVehicle);
              return (
                <Link to={`/autos/${prevVehicle.slug}`} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors">
                  <ChevronLeftIcon className="w-8 h-8 flex-shrink-0 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  <img src={prevImage} alt={prevVehicle.titulo} className="w-20 h-16 object-cover rounded-md flex-shrink-0 hidden sm:block" />
                  <div className="truncate text-left">
                    <span className="text-xs text-gray-500 block">Anterior</span>
                    <span className="font-semibold hidden md:block truncate text-neutral-800 group-hover:text-primary-700">{prevVehicle.titulo}</span>
                  </div>
                </Link>
              );
            })() : <div />}

            {prevVehicle && nextVehicle && <div className="h-12 border-r border-gray-200 mx-2 hidden sm:block"></div>}

            {/* Next Vehicle */}
            {nextVehicle ? (() => {
              const nextImage = nextVehicle.feature_image ||
                                nextVehicle.thumbnail_webp ||
                                nextVehicle.thumbnail ||
                                nextVehicle.fotos_exterior?.[0] ||
                                nextVehicle.fotos_interior?.[0] ||
                                getPlaceholderImage(nextVehicle);
              return (
                <Link to={`/autos/${nextVehicle.slug}`} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors">
                  <div className="truncate text-right">
                    <span className="text-xs text-gray-500 block">Siguiente</span>
                    <span className="font-semibold hidden md:block truncate text-neutral-800 group-hover:text-primary-700">{nextVehicle.titulo}</span>
                  </div>
                  <img src={nextImage} alt={nextVehicle.titulo} className="w-20 h-16 object-cover rounded-md flex-shrink-0 hidden sm:block" />
                  <ChevronRightIcon className="w-8 h-8 flex-shrink-0 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </Link>
              );
            })() : <div />}
          </nav>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start pt-4">
            <div className="lg:col-span-3 space-y-8">
              <MediaGallery mediaItems={mediaItems} activeMedia={activeMedia} setActiveMedia={setActiveMedia} handleOpenLightbox={handleOpenLightbox} vehicleTitle={vehicle.titulo} promociones={vehicle.promociones}/>

              <div className="lg:hidden space-y-8">
                <TitlePriceActionsBlock vehicle={vehicle} financeData={financeData} favoriteCount={favoriteCount} isFavorite={isFavorite(vehicle.id)} onToggleFavorite={() => toggleFavorite(vehicle.id)} onFinancingClick={handleFinancingClick} />
              </div>

              <FeatureFinancingSection vehicle={vehicle} inspectionData={inspectionData} />
              <DescriptionSection content={vehicle.description || vehicle.descripcion} />
              <TestimonialCta />

              <div className="lg:hidden space-y-8">
                <TabsSection activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} vehicleId={vehicle.id} specifications={specifications} financeData={financeData} downPayment={downPayment} setDownPayment={setDownPayment} loanTerm={loanTerm} setLoanTerm={setLoanTerm} inspectionLoading={inspectionLoading} inspectionData={inspectionData} onSeeFullReport={() => setIsLightboxOpen(true)} />
                <VehicleDetailLocation vehicle={vehicle} />
              </div>
            </div>

            <aside className="hidden lg:block lg:col-span-2">
              <div className="sticky top-28 space-y-6">
                <TitlePriceActionsBlock vehicle={vehicle} financeData={financeData} favoriteCount={favoriteCount} isFavorite={isFavorite(vehicle.id)} onToggleFavorite={() => toggleFavorite(vehicle.id)} onFinancingClick={handleFinancingClick} />
                <TabsSection activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} vehicleId={vehicle.id} specifications={specifications} financeData={financeData} downPayment={downPayment} setDownPayment={setDownPayment} loanTerm={loanTerm} setLoanTerm={setLoanTerm} inspectionLoading={inspectionLoading} inspectionData={inspectionData} onSeeFullReport={() => setIsLightboxOpen(true)} />
                <VehicleDetailLocation vehicle={vehicle} />
                {!session && <AuthBenefitsBlock />}
              </div>
            </aside>
          </div>
        </main>

        <SimilarVehicles vehicle={vehicle} allVehicles={allVehicles} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <RecentlyViewed currentVehicleId={vehicle.id} />
        </div>
      </div>

      {/* Lightbox for inspection or media */}
      {isLightboxOpen && inspectionData && activeTab === 'inspection' && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm p-4 overflow-y-auto" onClick={closeLightbox}>
          <div className="max-w-4xl mx-auto my-8 bg-white rounded-2xl" onClick={e => e.stopPropagation()}>
            {/* @ts-ignore */}
            <InspectionReport data={inspectionData} />
          </div>
        </div>
      )}

      {isLightboxOpen && (activeTab !== 'inspection' || !inspectionData) && (
        <Lightbox
          media={lightboxMedia}
          currentIndex={lightboxStartIndex}
          onClose={closeLightbox}
          onPrev={() => setLightboxStartIndex(prev => (prev === 0 ? lightboxMedia.length - 1 : prev - 1))}
          onNext={() => setLightboxStartIndex(prev => (prev === lightboxMedia.length - 1 ? 0 : prev + 1))}
        />
      )}
    </>
  );
};

export default VehicleDetailPage;