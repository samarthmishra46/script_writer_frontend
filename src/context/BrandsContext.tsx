import React, { createContext, useState, ReactNode } from 'react';

// Define the Brand interface
interface Brand {
  name: string;
  products: string[];
  id: string;
}

// Define the context shape
interface BrandsContextType {
  brands: Brand[];
  loading: boolean;
  error: string | null;
  updateBrands: (newBrands: Brand[]) => void;
  refreshSidebar: () => void;
  lastUpdated: number;
}

// Create the context with default values
const BrandsContext = createContext<BrandsContextType>({
  brands: [],
  loading: false,
  error: null,
  updateBrands: () => {},
  refreshSidebar: () => {},
  lastUpdated: 0
});

// The hook is defined in useBrands.ts file

interface BrandsProviderProps {
  children: ReactNode;
}

// Provider component
export const BrandsProvider: React.FC<BrandsProviderProps> = ({ children }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(0);

  // Function to update brands data
  const updateBrands = (newBrands: Brand[]) => {
    setBrands(newBrands);
    setLoading(false);
    setError(null);
    setLastUpdated(Date.now());
  };

  // Function to trigger a sidebar refresh
  const refreshSidebar = () => {
    setLastUpdated(Date.now());
  };

  // The value provided by the context
  const value = {
    brands,
    loading,
    error,
    updateBrands,
    refreshSidebar,
    lastUpdated
  };

  return (
    <BrandsContext.Provider value={value}>
      {children}
    </BrandsContext.Provider>
  );
};

export default BrandsContext;
