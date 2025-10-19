
import React from 'react';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import { GoogleIcon, FacebookIcon, StarIcon } from './icons';

export interface Review {
    source: 'Google' | 'Facebook';
    name: string;
    avatar: string;
    rating: number;
    text: string;
    date: string;
}

const ReviewCard: React.FC<{ review: Review, index: number }> = ({ review, index }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
    const delay = (index % 5) * 100;

    return (
        <div ref={ref} className="review-card-wrapper">
            <div 
                className={`p-6 bg-white rounded-xl shadow-md border border-gray-200 transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${delay}ms` }}
            >
                <div className="flex items-center mb-4">
                    <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                    <div>
                        <p className="font-bold text-gray-800">{review.name}</p>
                        <div className="flex items-center mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <StarIcon key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                        </div>
                    </div>
                </div>
                <p className="text-gray-600 text-base leading-relaxed">{review.text}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                    <span>{review.date}</span>
                    {review.source === 'Google' ? <GoogleIcon className="w-5 h-5" /> : <FacebookIcon className="w-5 h-5" />}
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
