export interface Region {
  id: string;
  name: string;
}

export interface Store {
  id: string;
  name: string;
  regionId: string;
  address: string;
  lat: number; // 0-100 scale for map visualization Y
  lng: number; // 0-100 scale for map visualization X
  // 门店统计数据（从 /api/store/getStatisticsStore 接口获取）
  headcount?: number;      // 编制人数（员工总数）
  managedArea?: number;    // 在管面积（总面积）
  buildingCount?: number;  // 楼栋数量
}

export enum SubjectType {
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
  PROFIT = 'PROFIT',
}

export interface Subject {
  id: string;
  name: string;
  type: SubjectType;
  isParent?: boolean;
}

export interface MonthlyFinancials {
  date: string; // YYYY-MM
  revenue: number;
  expense: number;
  netProfit: number;
  // Dynamic map for all specific subjects (rev_1... rev_6, exp_1... exp_27)
  details: Record<string, number>;
}

// For the matrix view
export interface RegionFinancialSummary {
  regionId: string;
  regionName: string;
  data: Record<string, number>; // key: subjectId, value: amount
}

export interface RankItem {
  rank: number;
  storeId: string;
  storeName: string;
  value: number;
}

export interface DashboardData {
  totalProfit: number;
  totalRevenue: number;
  totalExpense: number;
  profitGrowth: number;
  revenueGrowth: number;
  expenseGrowth: number;
  // 上月原始值（用于判断扭亏/转亏）
  prevProfit?: number | null;
  prevRevenue?: number | null;
  prevExpense?: number | null;
  matrix: RegionFinancialSummary[];
  rankings: {
    revenue: RankItem[];
    expense: RankItem[];
    profit: RankItem[];
  };
}

export interface StoreFinancialSummary extends MonthlyFinancials {
  storeId: string;
  storeName: string;
  storeAddress: string;
  headcount: number;
  managedArea: number; // in sqm
  buildingCount: number;
  // 环比增长率
  revenueGrowth?: number;
  expenseGrowth?: number;
  profitGrowth?: number;
  // 上月原始值（用于判断扭亏/转亏）
  prevRevenue?: number | null;
  prevExpense?: number | null;
  prevProfit?: number | null;
}