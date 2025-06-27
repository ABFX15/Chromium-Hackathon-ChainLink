import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Address } from 'viem';
import { LoanData, PropertyNFTData, TransactionData, UserProfile, ContractError } from '../types/enhanced-contracts';

interface AppState {
  // User data
  userProfile: UserProfile | null;
  isConnected: boolean;
  userAddress: Address | null;
  
  // Properties and loans
  userProperties: PropertyNFTData[];
  allProperties: PropertyNFTData[];
  userLoans: LoanData[];
  allLoans: LoanData[];
  
  // Transaction history
  transactions: TransactionData[];
  
  // UI state
  loading: {
    properties: boolean;
    loans: boolean;
    transactions: boolean;
    userProfile: boolean;
  };
  
  errors: {
    properties?: ContractError;
    loans?: ContractError;
    transactions?: ContractError;
    userProfile?: ContractError;
  };
  
  // Filters and search
  filters: {
    propertyType?: string;
    priceRange?: [number, number];
    riskLevel?: string;
    location?: string;
  };
  
  searchQuery: string;
}

interface AppActions {
  // User actions
  setUserProfile: (profile: UserProfile | null) => void;
  setConnection: (isConnected: boolean, address?: Address) => void;
  
  // Property actions
  setUserProperties: (properties: PropertyNFTData[]) => void;
  setAllProperties: (properties: PropertyNFTData[]) => void;
  addProperty: (property: PropertyNFTData) => void;
  updateProperty: (tokenId: bigint, updates: Partial<PropertyNFTData>) => void;
  
  // Loan actions
  setUserLoans: (loans: LoanData[]) => void;
  setAllLoans: (loans: LoanData[]) => void;
  addLoan: (loan: LoanData) => void;
  updateLoan: (loanId: bigint, updates: Partial<LoanData>) => void;
  
  // Transaction actions
  addTransaction: (transaction: TransactionData) => void;
  updateTransaction: (hash: Address, updates: Partial<TransactionData>) => void;
  clearTransactions: () => void;
  
  // Loading and error management
  setLoading: (key: keyof AppState['loading'], loading: boolean) => void;
  setError: (key: keyof AppState['errors'], error: ContractError | undefined) => void;
  clearError: (key: keyof AppState['errors']) => void;
  clearAllErrors: () => void;
  
  // Filters and search
  setFilters: (filters: Partial<AppState['filters']>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Utility actions
  refreshAllData: () => Promise<void>;
  resetState: () => void;
}

const initialState: AppState = {
  userProfile: null,
  isConnected: false,
  userAddress: null,
  userProperties: [],
  allProperties: [],
  userLoans: [],
  allLoans: [],
  transactions: [],
  loading: {
    properties: false,
    loans: false,
    transactions: false,
    userProfile: false,
  },
  errors: {},
  filters: {},
  searchQuery: '',
};

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // User actions
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      setConnection: (isConnected, address) => set({ 
        isConnected, 
        userAddress: address || null,
        // Clear user data when disconnecting
        ...(isConnected ? {} : {
          userProfile: null,
          userProperties: [],
          userLoans: [],
        })
      }),

      // Property actions
      setUserProperties: (properties) => set({ userProperties: properties }),
      
      setAllProperties: (properties) => set({ allProperties: properties }),
      
      addProperty: (property) => set((state) => ({
        allProperties: [property, ...state.allProperties],
        userProperties: property.owner === state.userAddress 
          ? [property, ...state.userProperties]
          : state.userProperties,
      })),
      
      updateProperty: (tokenId, updates) => set((state) => ({
        userProperties: state.userProperties.map(p => 
          p.tokenId === tokenId ? { ...p, ...updates } : p
        ),
        allProperties: state.allProperties.map(p => 
          p.tokenId === tokenId ? { ...p, ...updates } : p
        ),
      })),

      // Loan actions
      setUserLoans: (loans) => set({ userLoans: loans }),
      
      setAllLoans: (loans) => set({ allLoans: loans }),
      
      addLoan: (loan) => set((state) => ({
        allLoans: [loan, ...state.allLoans],
        userLoans: (loan.borrower === state.userAddress || loan.lender === state.userAddress)
          ? [loan, ...state.userLoans]
          : state.userLoans,
      })),
      
      updateLoan: (loanId, updates) => set((state) => ({
        userLoans: state.userLoans.map(l => 
          l.loanId === loanId ? { ...l, ...updates } : l
        ),
        allLoans: state.allLoans.map(l => 
          l.loanId === loanId ? { ...l, ...updates } : l
        ),
      })),

      // Transaction actions
      addTransaction: (transaction) => set((state) => ({
        transactions: [transaction, ...state.transactions.slice(0, 49)] // Keep last 50 transactions
      })),
      
      updateTransaction: (hash, updates) => set((state) => ({
        transactions: state.transactions.map(t => 
          t.hash === hash ? { ...t, ...updates } : t
        ),
      })),
      
      clearTransactions: () => set({ transactions: [] }),

      // Loading and error management
      setLoading: (key, loading) => set((state) => ({
        loading: { ...state.loading, [key]: loading }
      })),
      
      setError: (key, error) => set((state) => ({
        errors: { ...state.errors, [key]: error }
      })),
      
      clearError: (key) => set((state) => ({
        errors: { ...state.errors, [key]: undefined }
      })),
      
      clearAllErrors: () => set({ errors: {} }),

      // Filters and search
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      clearFilters: () => set({ filters: {}, searchQuery: '' }),

      // Utility actions
      refreshAllData: async () => {
        // This will be implemented to trigger data refresh across all hooks
        const { setLoading, clearAllErrors } = get();
        
        setLoading('properties', true);
        setLoading('loans', true);
        setLoading('transactions', true);
        
        clearAllErrors();
        
        try {
          // Data refresh logic will be implemented in the enhanced hooks
          console.log('Refreshing all data...');
        } catch (error) {
          console.error('Error refreshing data:', error);
        } finally {
          setLoading('properties', false);
          setLoading('loans', false);
          setLoading('transactions', false);
        }
      },
      
      resetState: () => set(initialState),
    }),
    {
      name: 'oraclend-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist user preferences, not dynamic data
        filters: state.filters,
        searchQuery: state.searchQuery,
        userProfile: state.userProfile,
      }),
    }
  )
);

// Computed selectors
export const useFilteredProperties = () => {
  const { allProperties, filters, searchQuery } = useAppStore();
  
  return allProperties.filter((property) => {
    // Search query filter
    if (searchQuery && !property.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !property.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Property type filter
    if (filters.propertyType && property.metadata?.attributes.find(
      attr => attr.trait_type === 'Property Type' && attr.value !== filters.propertyType
    )) {
      return false;
    }
    
    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      const valueInEth = Number(property.propertyValue) / 1e18;
      if (valueInEth < min || valueInEth > max) {
        return false;
      }
    }
    
    // Risk level filter
    if (filters.riskLevel) {
      const riskCategory = property.riskScore < 30 ? 'low' : 
                          property.riskScore < 70 ? 'medium' : 'high';
      if (riskCategory !== filters.riskLevel) {
        return false;
      }
    }
    
    // Location filter
    if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    
    return true;
  });
};

export const useUserStats = () => {
  const { userLoans, userProperties, transactions } = useAppStore();
  
  return {
    totalProperties: userProperties.length,
    totalLoans: userLoans.length,
    activeLoans: userLoans.filter(loan => loan.isActive).length,
    totalValueLocked: userProperties.reduce((sum, prop) => sum + prop.propertyValue, BigInt(0)),
    totalBorrowed: userLoans
      .filter(loan => loan.isActive)
      .reduce((sum, loan) => sum + loan.principalAmount, BigInt(0)),
    recentTransactions: transactions.slice(0, 5),
  };
};