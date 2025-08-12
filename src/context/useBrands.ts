import { useContext } from 'react';
import BrandsContext from './BrandsContext';

// Custom hook for using the brands context
export const useBrands = () => useContext(BrandsContext);
