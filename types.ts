
export interface SchoolItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
}

export interface ConsolidatedItem {
  name: string;
  totalQuantity: number;
  items: SchoolItem[];
}

export interface QuoteItem {
  itemName: string;
  unitPrice: number;
  url?: string; // Link para compra online
}

export interface SupplierQuote {
  id: string;
  supplierName: string;
  date: string;
  items: QuoteItem[];
  totalValue: number;
}

export interface ChildList {
  id: string;
  title: string;
  items: SchoolItem[];
}

export interface BudgetAnalysis {
  bestGlobalSupplier: string;
  bestGlobalTotal: number;
  splitSupplierTotal: number;
  recommendations: {
    itemName: string;
    bestSupplier: string;
    price: number;
  }[];
}
