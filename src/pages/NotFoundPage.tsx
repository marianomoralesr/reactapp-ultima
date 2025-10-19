import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, HomeIcon } from '../components/icons';
import { proxyImage } from '../utils/proxyImage';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white text-center p-4">
      <img src={proxyImage("http://5.183.8.48/wp-content/uploads/2024/09/trefa-no-encontrado.png")} alt="Página no encontrada" className="w-64 h-auto mb-8" />
      <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight sm:text-5xl">Página no encontrada</h1>
      <p className="mt-4 text-base text-gray-500 max-w-md">
        Lo sentimos, la página que estás buscando no existe, ha sido movida o está temporalmente fuera de servicio.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-md bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Regresar
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
        >
          <HomeIcon className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;