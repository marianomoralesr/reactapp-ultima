

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from './icons';

interface Crumb {
    name: string;
    href?: string;
}

interface BreadcrumbsProps {
    crumbs: Crumb[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ crumbs }) => {
    return (
        <nav aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm">
                {crumbs.map((crumb, index) => (
                    <li key={index}>
                        <div className="flex items-center">
                            {index > 0 && (
                                <ChevronRightIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mx-2" />
                            )}
                            {crumb.href ? (
                                <Link to={crumb.href} className="text-gray-500 hover:text-gray-700 font-medium">
                                    {crumb.name}
                                </Link>
                            ) : (
                                <span className="font-semibold text-gray-700 truncate max-w-xs" aria-current="page">
                                    {crumb.name}
                                </span>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;