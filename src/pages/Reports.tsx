import { BarChart3, DollarSign, TrendingUp, TrendingDown, Calculator, PieChart, FileText, CreditCard, ArrowUpDown, AlertTriangle, CheckCircle, Clock, XCircle, Hash, Users, MapPin, Calendar, Utensils, Warehouse, Package, Receipt, ArrowDownCircle, ArrowUpCircle, Minus, Percent, Activity, Building2, Wrench, TrendingUpDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { tablesAPI, weddingsAPI } from '@/api';
import { useCurrencyFormat } from '@/utils/currency';
import { useCurrency, SupportedCurrency } from '@/context/CurrencyContext';
import api from '@/api';
import { Loader2 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const Reports = () => {
  const { formatCurrency } = useCurrencyFormat();
  const { currency, setCurrency } = useCurrency();
  
  const CURRENCY_OPTIONS: { code: SupportedCurrency; symbol: string; name: string }[] = [
    { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  ];
  const [period, setPeriod] = useState<'day' | 'month' | 'year'>('month');
  const [value, setValue] = useState<string>(''); // YYYY-MM-DD, YYYY-MM, or YYYY
  const [sales, setSales] = useState<any>(null);
  const [payments, setPayments] = useState<any>(null);
  const [financial, setFinancial] = useState<any>(null);
  const [cashFlow, setCashFlow] = useState<any>(null);
  const [accountsReceivable, setAccountsReceivable] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [financialLoading, setFinancialLoading] = useState(false);
  const [cashFlowLoading, setCashFlowLoading] = useState(false);
  const [arLoading, setArLoading] = useState(false);

  const [weddingId, setWeddingId] = useState<string>('');
  const [weddings, setWeddings] = useState<any[]>([]);
  const [menuDietary, setMenuDietary] = useState<any>(null);
  const [inventoryUsage, setInventoryUsage] = useState<any>(null);
  const [seating, setSeating] = useState<any>(null);
  const [menuUsage, setMenuUsage] = useState<any>(null);
  const [ingredientUsage, setIngredientUsage] = useState<any>(null);

  // Chart colors
  const CHART_COLORS = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#06b6d4',
    purple: '#a855f7',
    orange: '#f97316',
    pink: '#ec4899'
  };

  useEffect(() => {
    (async () => {
      const res = await weddingsAPI.getAll({}).catch(() => ({ data: [] }));
      const list = res?.data || res || [];
      setWeddings(Array.isArray(list) ? list : []);
    })();
  }, []);

  const fetchGeneral = async () => {
    if (!value) return;
    setLoading(true);
    try {
      const s = await api.get('/reports/sales', { params: { period, value } });
      const p = await api.get('/reports/payments', { params: { period, value } });
      const mu = await api.get('/reports/menu-usage', { params: { period, value } });
      const iu = await api.get('/reports/ingredient-usage', { params: { period, value } });
      setSales(s.data?.data || s.data || s);
      setPayments(p.data?.data || p.data || p);
      setMenuUsage(mu.data?.data || mu.data || mu);
      setIngredientUsage(iu.data?.data || iu.data || iu);
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancial = async () => {
    if (!value) return;
    setFinancialLoading(true);
    try {
      const response = await api.get('/reports/financial', { params: { period, value } });
      setFinancial(response.data?.data || response.data || response);
    } catch (error: any) {
      console.error('Error fetching financial report:', error);
    } finally {
      setFinancialLoading(false);
    }
  };

  const fetchCashFlow = async () => {
    if (!value) return;
    setCashFlowLoading(true);
    try {
      const response = await api.get('/reports/cash-flow', { params: { period, value } });
      setCashFlow(response.data?.data || response.data || response);
    } catch (error: any) {
      console.error('Error fetching cash flow report:', error);
    } finally {
      setCashFlowLoading(false);
    }
  };

  const fetchAccountsReceivable = async () => {
    if (!value) return;
    setArLoading(true);
    try {
      const response = await api.get('/reports/accounts-receivable', { params: { period, value } });
      const data = response.data?.data || response.data || response;
      console.log('Accounts Receivable Data:', data);
      console.log('Receivables:', data.receivables);
      setAccountsReceivable(data);
    } catch (error: any) {
      console.error('Error fetching accounts receivable report:', error);
    } finally {
      setArLoading(false);
    }
  };

  // Helper to get placeholder based on period
  const getPlaceholder = () => {
    if (period === 'day') return '2024-11-15';
    if (period === 'month') return '2024-11';
    return '2024';
  };

  const fetchWeddingSpecific = async () => {
    if (!weddingId) return;
    setLoading(true);
    try {
      const md = await api.get(`/reports/wedding/${weddingId}/menu-dietary`);
      const inv = await api.get(`/reports/wedding/${weddingId}/inventory`);
      const seat = await api.get(`/reports/wedding/${weddingId}/seating`);
      setMenuDietary(md.data || md);
      setInventoryUsage(inv.data || inv);
      setSeating(seat.data || seat);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">General and wedding-specific analytics</p>
        </div>

        <Tabs defaultValue="financial">
          <TabsList>
            <TabsTrigger value="financial">Income Statement</TabsTrigger>
            <TabsTrigger value="cash-flow">Cash Flow</TabsTrigger>
            <TabsTrigger value="accounts-receivable">Accounts Receivable</TabsTrigger>
            <TabsTrigger value="general">General Reports</TabsTrigger>
            <TabsTrigger value="wedding">Wedding-Specific Reports</TabsTrigger>
          </TabsList>

          {/* Financial Reports Tab */}
          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Report Filters</CardTitle>
                <CardDescription>Select a period and date for financial analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Period</label>
                    <Select value={period} onValueChange={(v: any) => {
                      setPeriod(v);
                      setFinancial(null);
                      setValue('');
                    }}>
                      <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day (YYYY-MM-DD)</SelectItem>
                        <SelectItem value="month">Month (YYYY-MM)</SelectItem>
                        <SelectItem value="year">Year (YYYY)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground">
                      {period === 'day' ? 'Day (YYYY-MM-DD)' : period === 'month' ? 'Month (YYYY-MM)' : 'Year (YYYY)'}
                    </label>
                    <Input 
                      value={value} 
                      onChange={(e) => {
                        setValue(e.target.value);
                        setFinancial(null);
                      }} 
                      placeholder={getPlaceholder()} 
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={fetchFinancial} disabled={!value || financialLoading}>
                      {financialLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Generate Report'
                      )}
                    </Button>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Display Currency</label>
                      <p className="text-xs text-muted-foreground">Change currency for all amounts in this report</p>
                    </div>
                    <Select value={currency} onValueChange={(value) => setCurrency(value as SupportedCurrency)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue>
                          {CURRENCY_OPTIONS.find(c => c.code === currency)?.symbol} {currency}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((curr) => (
                          <SelectItem key={curr.code} value={curr.code}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{curr.symbol}</span>
                              <span>{curr.name}</span>
                              <span className="text-muted-foreground">({curr.code})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {financial && (
              <>
                {/* Warning if no packages assigned */}
                {financial.revenue?.total === 0 && financial.table_assignments === 0 && (
                  <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                        <AlertTriangle className="h-5 w-5" />
                        <div>
                          <p className="font-semibold">No Package Assignments Found</p>
                          <p className="text-sm">Revenue is calculated from packages assigned to tables. Assign packages to tables in the Wedding Detail page to see revenue data.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Key Performance Indicators */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="border-green-200 dark:border-green-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-green-600" />
                        Total Revenue
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(financial.revenue?.total || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {financial.revenue?.change_percent !== undefined && financial.revenue.change_percent !== 0 && (
                          <span className={financial.revenue.change_percent > 0 ? 'text-green-600' : 'text-red-600'}>
                            {financial.revenue.change_percent > 0 ? '↑' : '↓'} {Math.abs(financial.revenue.change_percent).toFixed(1)}% vs previous
                          </span>
                        )}
                        {(!financial.revenue?.change_percent || financial.revenue.change_percent === 0) && 'Package sales revenue'}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200 dark:border-blue-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Percent className="h-4 w-4 text-blue-600" />
                        Gross Margin
                      </CardTitle>
                      <Activity className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {financial.gross_profit?.margin_percent?.toFixed(1) || 0}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(financial.gross_profit?.total || 0)} gross profit
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-purple-200 dark:border-purple-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                        Net Margin
                      </CardTitle>
                      <TrendingUpDown className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${(financial.net_profit?.total || 0) >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                        {financial.net_profit?.margin_percent?.toFixed(1) || 0}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(financial.net_profit?.total || 0)} net profit
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-orange-200 dark:border-orange-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-orange-600" />
                        Weddings
                      </CardTitle>
                      <Users className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {financial.weddings_count || 0}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {financial.table_assignments || 0} table assignments
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Income Statement */}
                <Card className="border-2">
                  <CardHeader className="bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">Income Statement</CardTitle>
                          <CardDescription className="text-base mt-1">
                            {period === 'month' ? `For ${value}` : period === 'day' ? `For ${value}` : `For Year ${value}`}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        {period === 'day' ? 'Daily' : period === 'month' ? 'Monthly' : 'Annual'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {/* Revenue Section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b-2">
                          <ArrowUpCircle className="h-5 w-5 text-green-600" />
                          <h3 className="font-bold text-lg text-green-600">REVENUE</h3>
                        </div>
                        <div className="ml-7 space-y-2">
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Package Sales</span>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-green-600">
                                {formatCurrency(financial.revenue?.total || 0)}
                              </div>
                              {financial.revenue?.change_percent !== undefined && financial.revenue.change_percent !== 0 && (
                                <div className={`text-xs flex items-center justify-end gap-1 mt-1 ${financial.revenue.change_percent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {financial.revenue.change_percent > 0 ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3" />
                                  )}
                                  {Math.abs(financial.revenue.change_percent).toFixed(1)}% vs previous period
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t font-bold text-lg">
                            <span>Total Revenue</span>
                            <span className="text-green-600">{formatCurrency(financial.revenue?.total || 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* COGS Section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b-2">
                          <ArrowDownCircle className="h-5 w-5 text-red-600" />
                          <h3 className="font-bold text-lg text-red-600">COST OF GOODS SOLD (COGS)</h3>
                        </div>
                        <div className="ml-7 space-y-2">
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <Calculator className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Package Costs</span>
                            </div>
                            <div className="text-xl font-bold text-red-600">
                              {formatCurrency(financial.cogs?.total || 0)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t font-bold text-lg">
                            <span>Total COGS</span>
                            <span className="text-red-600">{formatCurrency(financial.cogs?.total || 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Gross Profit */}
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-900">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Percent className="h-5 w-5 text-blue-600" />
                            <div>
                              <h3 className="font-bold text-lg text-blue-600">GROSS PROFIT</h3>
                              <p className="text-sm text-muted-foreground">
                                Gross Margin: {financial.gross_profit?.margin_percent?.toFixed(2) || 0}%
                              </p>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(financial.gross_profit?.total || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Operating Expenses Section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b-2">
                          <Building2 className="h-5 w-5 text-orange-600" />
                          <h3 className="font-bold text-lg text-orange-600">OPERATING EXPENSES</h3>
                        </div>
                        <div className="ml-7 space-y-2">
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <Wrench className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Equipment Rental</span>
                            </div>
                            <div className="text-lg font-semibold text-orange-600">
                              {formatCurrency(financial.operating_costs?.equipment_rental || 0)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t font-bold text-lg">
                            <span>Total Operating Expenses</span>
                            <span className="text-orange-600">{formatCurrency(financial.operating_costs?.total || 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Net Profit */}
                      <div className={`p-6 rounded-lg border-2 ${(financial.net_profit?.total || 0) >= 0 ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${(financial.net_profit?.total || 0) >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                              <DollarSign className={`h-6 w-6 ${(financial.net_profit?.total || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                            </div>
                            <div>
                              <h3 className={`font-bold text-xl ${(financial.net_profit?.total || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                NET PROFIT / (LOSS)
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                Net Margin: {financial.net_profit?.margin_percent?.toFixed(2) || 0}%
                              </p>
                              {financial.net_profit?.change_percent !== undefined && financial.net_profit.change_percent !== 0 && (
                                <div className={`text-sm flex items-center gap-1 mt-1 ${financial.net_profit.change_percent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {financial.net_profit.change_percent > 0 ? (
                                    <TrendingUp className="h-4 w-4" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4" />
                                  )}
                                  {Math.abs(financial.net_profit.change_percent).toFixed(1)}% vs previous period
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={`text-4xl font-bold ${(financial.net_profit?.total || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(financial.net_profit?.total || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>


                {/* Revenue by Package Type with Chart */}
                {financial.revenue_by_package_type && financial.revenue_by_package_type.length > 0 && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue by Package Type</CardTitle>
                        <CardDescription>Breakdown of revenue by package category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80 mb-6">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financial.revenue_by_package_type.map((item: any) => ({
                              name: item.package_type || 'N/A',
                              revenue: parseFloat(item.revenue || 0),
                              cost: parseFloat(item.cost || 0),
                              profit: parseFloat(item.revenue || 0) - parseFloat(item.cost || 0)
                            }))}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                              <XAxis dataKey="name" className="text-xs" />
                              <YAxis className="text-xs" tickFormatter={(value) => formatCurrency(value)} />
                              <Tooltip 
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                              />
                              <Legend />
                              <Bar dataKey="revenue" fill={CHART_COLORS.success} name="Revenue" />
                              <Bar dataKey="cost" fill={CHART_COLORS.danger} name="Cost" />
                              <Bar dataKey="profit" fill={CHART_COLORS.primary} name="Profit" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Package Type</TableHead>
                              <TableHead>Revenue</TableHead>
                              <TableHead>Cost</TableHead>
                              <TableHead>Profit</TableHead>
                              <TableHead>Usage Count</TableHead>
                              <TableHead>Margin %</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {financial.revenue_by_package_type.map((item: any, idx: number) => {
                              const revenue = parseFloat(item.revenue || 0);
                              const cost = parseFloat(item.cost || 0);
                              const profit = revenue - cost;
                              const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
                              return (
                                <TableRow key={idx}>
                                  <TableCell className="font-medium">{item.package_type || 'N/A'}</TableCell>
                                  <TableCell>{formatCurrency(revenue)}</TableCell>
                                  <TableCell>{formatCurrency(cost)}</TableCell>
                                  <TableCell className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {formatCurrency(profit)}
                                  </TableCell>
                                  <TableCell>{item.usage_count || 0}</TableCell>
                                  <TableCell>
                                    <Badge variant={margin >= 0 ? 'default' : 'destructive'}>
                                      {margin.toFixed(1)}%
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    {/* Pie Chart for Revenue Distribution */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Revenue Distribution by Package Type</CardTitle>
                        <CardDescription>Percentage breakdown of total revenue</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={financial.revenue_by_package_type.map((item: any) => ({
                                  name: item.package_type || 'N/A',
                                  value: parseFloat(item.revenue || 0)
                                }))}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {financial.revenue_by_package_type.map((_: any, index: number) => {
                                  const colors = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.danger, CHART_COLORS.purple, CHART_COLORS.orange, CHART_COLORS.pink];
                                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                })}
                              </Pie>
                              <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            )}

            {!financial && !financialLoading && value && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Click "Generate Report" to view financial data
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Cash Flow Statement Tab */}
          <TabsContent value="cash-flow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Statement Filters</CardTitle>
                <CardDescription>Select a period and date for cash flow analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Period</label>
                    <Select value={period} onValueChange={(v: any) => {
                      setPeriod(v);
                      setCashFlow(null);
                      setValue('');
                    }}>
                      <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day (YYYY-MM-DD)</SelectItem>
                        <SelectItem value="month">Month (YYYY-MM)</SelectItem>
                        <SelectItem value="year">Year (YYYY)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground">
                      {period === 'day' ? 'Day (YYYY-MM-DD)' : period === 'month' ? 'Month (YYYY-MM)' : 'Year (YYYY)'}
                    </label>
                    <Input 
                      value={value} 
                      onChange={(e) => {
                        setValue(e.target.value);
                        setCashFlow(null);
                      }} 
                      placeholder={getPlaceholder()} 
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={fetchCashFlow} disabled={!value || cashFlowLoading}>
                      {cashFlowLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Generate Report'
                      )}
                    </Button>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Display Currency</label>
                      <p className="text-xs text-muted-foreground">Change currency for all amounts in this report</p>
                    </div>
                    <Select value={currency} onValueChange={(value) => setCurrency(value as SupportedCurrency)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue>
                          {CURRENCY_OPTIONS.find(c => c.code === currency)?.symbol} {currency}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((curr) => (
                          <SelectItem key={curr.code} value={curr.code}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{curr.symbol}</span>
                              <span>{curr.name}</span>
                              <span className="text-muted-foreground">({curr.code})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {cashFlow && (
              <>
                {/* Cash Flow Key Metrics */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="border-green-200 dark:border-green-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <ArrowUpCircle className="h-4 w-4 text-green-600" />
                        Total Inflows
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(cashFlow.cash_flows?.inflows?.total || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cash received
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 dark:border-red-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <ArrowDownCircle className="h-4 w-4 text-red-600" />
                        Total Outflows
                      </CardTitle>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(cashFlow.cash_flows?.outflows?.total || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cash paid out
                      </p>
                    </CardContent>
                  </Card>
                  <Card className={`border-2 ${(cashFlow.cash_flows?.net_cash_flow || 0) >= 0 ? 'border-green-200 dark:border-green-900' : 'border-red-200 dark:border-red-900'}`}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <ArrowUpDown className={`h-4 w-4 ${(cashFlow.cash_flows?.net_cash_flow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                        Net Cash Flow
                      </CardTitle>
                      <Activity className={`h-4 w-4 ${(cashFlow.cash_flows?.net_cash_flow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${(cashFlow.cash_flows?.net_cash_flow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(cashFlow.cash_flows?.net_cash_flow || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(cashFlow.cash_flows?.net_cash_flow || 0) >= 0 ? 'Positive' : 'Negative'} flow
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-200 dark:border-blue-900">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        Cash Received
                      </CardTitle>
                      <Receipt className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(cashFlow.payment_receipts?.cash_received || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Actual payments
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Cash Flow Statement */}
                <Card className="border-2">
                  <CardHeader className="bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <ArrowUpDown className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">Cash Flow Statement</CardTitle>
                          <CardDescription className="text-base mt-1">
                            {period === 'day' ? `For ${value}` : period === 'month' ? `For ${value}` : `For Year ${value}`}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        {period === 'day' ? 'Daily' : period === 'month' ? 'Monthly' : 'Annual'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {/* Cash Inflows Section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b-2 border-green-200">
                          <ArrowUpCircle className="h-5 w-5 text-green-600" />
                          <h3 className="font-bold text-lg text-green-600">CASH INFLOWS</h3>
                        </div>
                        <div className="ml-7 space-y-3">
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Package Sales Revenue</span>
                            </div>
                            <div className="text-xl font-bold text-green-600">
                              {formatCurrency(cashFlow.cash_flows?.inflows?.package_sales || 0)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <Wrench className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Equipment Rental Income</span>
                            </div>
                            <div className="text-xl font-bold text-green-600">
                              {formatCurrency(cashFlow.cash_flows?.inflows?.equipment_rental || 0)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t-2 border-green-200 font-bold text-lg">
                            <span className="text-green-600">Total Cash Inflows</span>
                            <span className="text-green-600">{formatCurrency(cashFlow.cash_flows?.inflows?.total || 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Cash Outflows Section */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b-2 border-red-200">
                          <ArrowDownCircle className="h-5 w-5 text-red-600" />
                          <h3 className="font-bold text-lg text-red-600">CASH OUTFLOWS</h3>
                        </div>
                        <div className="ml-7 space-y-3">
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <Calculator className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Package Costs (COGS)</span>
                            </div>
                            <div className="text-xl font-bold text-red-600">
                              {formatCurrency(cashFlow.cash_flows?.outflows?.package_costs || 0)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Equipment Costs</span>
                            </div>
                            <div className="text-xl font-bold text-red-600">
                              {formatCurrency(cashFlow.cash_flows?.outflows?.equipment_costs || 0)}
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t-2 border-red-200 font-bold text-lg">
                            <span className="text-red-600">Total Cash Outflows</span>
                            <span className="text-red-600">{formatCurrency(cashFlow.cash_flows?.outflows?.total || 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Net Cash Flow */}
                      <div className={`p-6 rounded-lg border-2 ${(cashFlow.cash_flows?.net_cash_flow || 0) >= 0 ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${(cashFlow.cash_flows?.net_cash_flow || 0) >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                              <ArrowUpDown className={`h-6 w-6 ${(cashFlow.cash_flows?.net_cash_flow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                            </div>
                            <div>
                              <h3 className={`font-bold text-xl ${(cashFlow.cash_flows?.net_cash_flow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                NET CASH FLOW
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {(cashFlow.cash_flows?.net_cash_flow || 0) >= 0 ? 'Positive cash position' : 'Negative cash position'}
                              </p>
                            </div>
                          </div>
                          <div className={`text-4xl font-bold ${(cashFlow.cash_flows?.net_cash_flow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(cashFlow.cash_flows?.net_cash_flow || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Payment Receipts Section */}
                      <div className="pt-4 border-t-2">
                        <div className="flex items-center gap-2 pb-3 mb-4">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <h3 className="font-bold text-lg text-blue-600">PAYMENT RECEIPTS SUMMARY</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <Card className="border-green-200 dark:border-green-900">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-xs font-medium flex items-center gap-2 text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                Paid
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-green-600">
                                {cashFlow.payment_receipts?.paid_count || 0}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Fully paid</p>
                            </CardContent>
                          </Card>
                          <Card className="border-yellow-200 dark:border-yellow-900">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-xs font-medium flex items-center gap-2 text-yellow-600">
                                <Clock className="h-3 w-3" />
                                Partial
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-yellow-600">
                                {cashFlow.payment_receipts?.partial_count || 0}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">50% paid</p>
                            </CardContent>
                          </Card>
                          <Card className="border-red-200 dark:border-red-900">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-xs font-medium flex items-center gap-2 text-red-600">
                                <XCircle className="h-3 w-3" />
                                Pending
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-red-600">
                                {cashFlow.payment_receipts?.pending_count || 0}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Not paid</p>
                            </CardContent>
                          </Card>
                          <Card className="border-blue-200 dark:border-blue-900">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-xs font-medium flex items-center gap-2 text-blue-600">
                                <DollarSign className="h-3 w-3" />
                                Total Received
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(cashFlow.payment_receipts?.cash_received || 0)}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Actual cash</p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cash Flow Chart */}
                {cashFlow.breakdown && cashFlow.breakdown.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Cash Flow Trend</CardTitle>
                      <CardDescription>Cash inflows and outflows over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={cashFlow.breakdown}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis 
                              dataKey="period" 
                              className="text-xs"
                              tickFormatter={(value) => {
                                if (period === 'year') return value.slice(5); // Show MM
                                if (period === 'month') return new Date(value).getDate().toString(); // Show day
                                return value;
                              }}
                            />
                            <YAxis className="text-xs" tickFormatter={(value) => formatCurrency(value)} />
                            <Tooltip 
                              formatter={(value: number) => formatCurrency(value)}
                              contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="revenue" stackId="1" stroke={CHART_COLORS.success} fill={CHART_COLORS.success} fillOpacity={0.6} name="Revenue" />
                            <Area type="monotone" dataKey="equipment_income" stackId="1" stroke={CHART_COLORS.info} fill={CHART_COLORS.info} fillOpacity={0.6} name="Equipment Income" />
                            <Area type="monotone" dataKey="costs" stackId="2" stroke={CHART_COLORS.danger} fill={CHART_COLORS.danger} fillOpacity={0.6} name="Costs" />
                            <Area type="monotone" dataKey="net_flow" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.3} strokeWidth={2} name="Net Cash Flow" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {!cashFlow && !cashFlowLoading && value && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Click "Generate Report" to view cash flow data
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Accounts Receivable Aging Tab */}
          <TabsContent value="accounts-receivable" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Accounts Receivable Aging Filters</CardTitle>
                <CardDescription>Select a period and date for receivables analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Period</label>
                    <Select value={period} onValueChange={(v: any) => {
                      setPeriod(v);
                      setAccountsReceivable(null);
                      setValue('');
                    }}>
                      <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day (YYYY-MM-DD)</SelectItem>
                        <SelectItem value="month">Month (YYYY-MM)</SelectItem>
                        <SelectItem value="year">Year (YYYY)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground">
                      {period === 'day' ? 'Day (YYYY-MM-DD)' : period === 'month' ? 'Month (YYYY-MM)' : 'Year (YYYY)'}
                    </label>
                    <Input 
                      value={value} 
                      onChange={(e) => {
                        setValue(e.target.value);
                        setAccountsReceivable(null);
                      }} 
                      placeholder={getPlaceholder()} 
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={fetchAccountsReceivable} disabled={!value || arLoading}>
                      {arLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Generate Report'
                      )}
                    </Button>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Display Currency</label>
                      <p className="text-xs text-muted-foreground">Change currency for all amounts in this report</p>
                    </div>
                    <Select value={currency} onValueChange={(value) => setCurrency(value as SupportedCurrency)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue>
                          {CURRENCY_OPTIONS.find(c => c.code === currency)?.symbol} {currency}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((curr) => (
                          <SelectItem key={curr.code} value={curr.code}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{curr.symbol}</span>
                              <span>{curr.name}</span>
                              <span className="text-muted-foreground">({curr.code})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {accountsReceivable && (() => {
              const totalReceivables = accountsReceivable.total_receivables || 0;
              const totalCount = accountsReceivable.total_count || 0;
              const avgInvoiceAmount = totalCount > 0 ? totalReceivables / totalCount : 0;
              
              // Calculate payment status breakdown
              const receivables = accountsReceivable.receivables || [];
              const pendingAmount = receivables
                .filter((r: any) => (r.payment_status || '').toLowerCase() === 'pending')
                .reduce((sum: number, r: any) => sum + (parseFloat(r.outstanding_balance) || 0), 0);
              const partialAmount = receivables
                .filter((r: any) => (r.payment_status || '').toLowerCase() === 'partial')
                .reduce((sum: number, r: any) => sum + (parseFloat(r.outstanding_balance) || 0), 0);
              const pendingCount = receivables.filter((r: any) => (r.payment_status || '').toLowerCase() === 'pending').length;
              const partialCount = receivables.filter((r: any) => (r.payment_status || '').toLowerCase() === 'partial').length;
              
              // Calculate average days overdue
              const totalDaysOverdue = receivables.reduce((sum: number, r: any) => sum + (parseInt(r.days_overdue) || 0), 0);
              const avgDaysOverdue = totalCount > 0 ? Math.round(totalDaysOverdue / totalCount) : 0;
              
              // Find oldest invoice
              const oldestInvoice = receivables.length > 0 
                ? receivables.reduce((oldest: any, current: any) => 
                    (parseInt(current.days_overdue) || 0) > (parseInt(oldest.days_overdue) || 0) ? current : oldest
                  )
                : null;
              
              return (
                <>
                  {/* Key Metrics Overview */}
                  <div className="grid gap-4 md:grid-cols-4 mb-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Outstanding Receivables</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalReceivables)}</div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">{totalCount} outstanding invoice{totalCount !== 1 ? 's' : ''}</p>
                          <p className="text-xs text-muted-foreground">Avg: {formatCurrency(avgInvoiceAmount)}</p>
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Pending:</span>
                            <span className="font-medium">{formatCurrency(pendingAmount)} ({pendingCount})</span>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-muted-foreground">Partial:</span>
                            <span className="font-medium">{formatCurrency(partialAmount)} ({partialCount})</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Days Overdue</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{avgDaysOverdue} days</div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {oldestInvoice ? (
                            <>Oldest: {oldestInvoice.days_overdue} days (Invoice #{oldestInvoice.wedding_id})</>
                          ) : (
                            'No overdue invoices'
                          )}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Collection Risk</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(accountsReceivable.aging_buckets?.over_90?.amount || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {accountsReceivable.aging_buckets?.over_90?.count || 0} invoice{accountsReceivable.aging_buckets?.over_90?.count !== 1 ? 's' : ''} over 90 days
                        </p>
                        <p className="text-xs text-red-600 font-medium mt-1">
                          {totalReceivables > 0 
                            ? `${((accountsReceivable.aging_buckets?.over_90?.amount || 0) / totalReceivables * 100).toFixed(1)}% of total`
                            : '0% of total'}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Status</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(accountsReceivable.aging_buckets?.current?.amount || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {accountsReceivable.aging_buckets?.current?.count || 0} invoice{accountsReceivable.aging_buckets?.current?.count !== 1 ? 's' : ''} (0-30 days)
                        </p>
                        <p className="text-xs text-green-600 font-medium mt-1">
                          {totalReceivables > 0 
                            ? `${((accountsReceivable.aging_buckets?.current?.amount || 0) / totalReceivables * 100).toFixed(1)}% of total`
                            : '0% of total'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Aging Buckets Detail */}
                  <div className="grid gap-4 md:grid-cols-4 mb-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current (0-30 days)</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(accountsReceivable.aging_buckets?.current?.amount || 0)}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {accountsReceivable.aging_buckets?.current?.count || 0} invoice{accountsReceivable.aging_buckets?.current?.count !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs font-medium text-green-600">
                            {accountsReceivable.aging_buckets?.current?.percentage?.toFixed(1) || '0.0'}%
                          </p>
                        </div>
                        {accountsReceivable.aging_buckets?.current?.count > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Avg: {formatCurrency((accountsReceivable.aging_buckets?.current?.amount || 0) / (accountsReceivable.aging_buckets?.current?.count || 1))}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">31-60 Days Overdue</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                          {formatCurrency(accountsReceivable.aging_buckets?.days_31_60?.amount || 0)}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {accountsReceivable.aging_buckets?.days_31_60?.count || 0} invoice{accountsReceivable.aging_buckets?.days_31_60?.count !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs font-medium text-yellow-600">
                            {accountsReceivable.aging_buckets?.days_31_60?.percentage?.toFixed(1) || '0.0'}%
                          </p>
                        </div>
                        {accountsReceivable.aging_buckets?.days_31_60?.count > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Avg: {formatCurrency((accountsReceivable.aging_buckets?.days_31_60?.amount || 0) / (accountsReceivable.aging_buckets?.days_31_60?.count || 1))}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">61-90 Days Overdue</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(accountsReceivable.aging_buckets?.days_61_90?.amount || 0)}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {accountsReceivable.aging_buckets?.days_61_90?.count || 0} invoice{accountsReceivable.aging_buckets?.days_61_90?.count !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs font-medium text-orange-600">
                            {accountsReceivable.aging_buckets?.days_61_90?.percentage?.toFixed(1) || '0.0'}%
                          </p>
                        </div>
                        {accountsReceivable.aging_buckets?.days_61_90?.count > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Avg: {formatCurrency((accountsReceivable.aging_buckets?.days_61_90?.amount || 0) / (accountsReceivable.aging_buckets?.days_61_90?.count || 1))}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Over 90 Days Overdue</CardTitle>
                        <XCircle className="h-4 w-4 text-red-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(accountsReceivable.aging_buckets?.over_90?.amount || 0)}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {accountsReceivable.aging_buckets?.over_90?.count || 0} invoice{accountsReceivable.aging_buckets?.over_90?.count !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs font-medium text-red-600">
                            {accountsReceivable.aging_buckets?.over_90?.percentage?.toFixed(1) || '0.0'}%
                          </p>
                        </div>
                        {accountsReceivable.aging_buckets?.over_90?.count > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Avg: {formatCurrency((accountsReceivable.aging_buckets?.over_90?.amount || 0) / (accountsReceivable.aging_buckets?.over_90?.count || 1))}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Aging Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Accounts Receivable Aging</CardTitle>
                    <CardDescription>Breakdown by aging buckets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Bar Chart */}
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            accountsReceivable.aging_buckets?.current,
                            accountsReceivable.aging_buckets?.days_31_60,
                            accountsReceivable.aging_buckets?.days_61_90,
                            accountsReceivable.aging_buckets?.over_90
                          ].filter(Boolean)}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="label" className="text-xs" />
                            <YAxis className="text-xs" tickFormatter={(value) => formatCurrency(value)} />
                            <Tooltip 
                              formatter={(value: number) => formatCurrency(value)}
                              contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                            />
                            <Bar dataKey="amount" fill={CHART_COLORS.primary} name="Amount" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Pie Chart */}
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={[
                                { name: accountsReceivable.aging_buckets?.current?.label, value: accountsReceivable.aging_buckets?.current?.amount || 0 },
                                { name: accountsReceivable.aging_buckets?.days_31_60?.label, value: accountsReceivable.aging_buckets?.days_31_60?.amount || 0 },
                                { name: accountsReceivable.aging_buckets?.days_61_90?.label, value: accountsReceivable.aging_buckets?.days_61_90?.amount || 0 },
                                { name: accountsReceivable.aging_buckets?.over_90?.label, value: accountsReceivable.aging_buckets?.over_90?.amount || 0 }
                              ].filter(item => item.value > 0)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              <Cell fill={CHART_COLORS.success} />
                              <Cell fill={CHART_COLORS.warning} />
                              <Cell fill={CHART_COLORS.orange} />
                              <Cell fill={CHART_COLORS.danger} />
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Receivables Table */}
                {accountsReceivable.receivables && accountsReceivable.receivables.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Outstanding Invoices</CardTitle>
                      <CardDescription>Detailed list of receivables</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                Wedding ID
                              </div>
                            </TableHead>
                            <TableHead>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                Couple
                              </div>
                            </TableHead>
                            <TableHead>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                Venue
                              </div>
                            </TableHead>
                            <TableHead>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                Wedding Date
                              </div>
                            </TableHead>
                            <TableHead>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                Total Cost
                              </div>
                            </TableHead>
                            <TableHead>
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                Outstanding
                              </div>
                            </TableHead>
                            <TableHead>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                Days Overdue
                              </div>
                            </TableHead>
                            <TableHead>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                Status
                              </div>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accountsReceivable.receivables.map((rec: any, idx: number) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">#{rec.wedding_id}</TableCell>
                              <TableCell>{rec.couple_name}</TableCell>
                              <TableCell>{rec.venue}</TableCell>
                              <TableCell>{new Date(rec.wedding_date).toLocaleDateString()}</TableCell>
                              <TableCell>{formatCurrency(rec.total_cost || 0)}</TableCell>
                              <TableCell className="font-semibold">{formatCurrency(rec.outstanding_balance || 0)}</TableCell>
                              <TableCell>
                                <Badge variant={rec.days_overdue > 90 ? 'destructive' : rec.days_overdue > 60 ? 'default' : 'secondary'}>
                                  {rec.days_overdue} days
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={rec.payment_status === 'partial' ? 'default' : 'destructive'}>
                                  {rec.payment_status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
                </>
              );
            })()}

            {!accountsReceivable && !arLoading && value && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Click "Generate Report" to view accounts receivable data
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Select a period and date</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-4 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">Period</label>
                  <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                    <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Month (YYYY-MM)</SelectItem>
                      <SelectItem value="year">Year (YYYY)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground">{period === 'month' ? 'Month (YYYY-MM)' : 'Year (YYYY)'}</label>
                  <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={period === 'month' ? '2025-11' : '2025'} />
                </div>
                <div className="flex items-end">
                  <Button onClick={fetchGeneral} disabled={!value || loading}>Load</Button>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics Dashboard */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(sales?.totalIncome ?? 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    From {sales?.weddingCount ?? 0} wedding{sales?.weddingCount !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(sales?.avgIncome ?? 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per wedding
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Weddings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {sales?.weddingCount ?? 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    In selected period
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {payments?.statusCounts ? Object.keys(payments.statusCounts).length : 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Status categories
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Wedding Sales Report</CardTitle>
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardDescription>Popular packages and menu items</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Methods Pie Chart */}
                  {(sales?.paymentBreakdown) && (
                    <div>
                      <div className="text-sm font-medium mb-2">Payment Methods Distribution</div>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={[
                                { name: 'Cash', value: sales.paymentBreakdown.cash || 0 },
                                { name: 'Card', value: sales.paymentBreakdown.card || 0 },
                                { name: 'Bank', value: sales.paymentBreakdown.bank || 0 }
                              ].filter(item => item.value > 0)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              <Cell fill={CHART_COLORS.success} />
                              <Cell fill={CHART_COLORS.primary} />
                              <Cell fill={CHART_COLORS.info} />
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Top Packages Bar Chart */}
                  {(sales?.topPackages && sales.topPackages.length > 0) && (
                    <div>
                      <div className="text-sm font-medium mb-2">Top Packages</div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sales.topPackages.slice(0, 10).reverse()} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis type="number" className="text-xs" />
                            <YAxis dataKey="package_name" type="category" width={100} className="text-xs" />
                            <Tooltip 
                              formatter={(value: number) => `${value} times`}
                              contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                            />
                            <Bar dataKey="usage_count" fill={CHART_COLORS.primary} name="Usage Count" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Top Menu Items Bar Chart */}
                  {(sales?.topMenuItems && sales.topMenuItems.length > 0) && (
                    <div>
                      <div className="text-sm font-medium mb-2">Top Menu Items</div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sales.topMenuItems.slice(0, 10).reverse()} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis type="number" className="text-xs" />
                            <YAxis dataKey="menu_name" type="category" width={100} className="text-xs" />
                            <Tooltip 
                              formatter={(value: number) => `${value} times`}
                              contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                            />
                            <Bar dataKey="usage_count" fill={CHART_COLORS.success} name="Usage Count" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment & Receipt Report</CardTitle>
                  <CardDescription>Status by wedding for selected period</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Payment Status Donut Chart */}
                  {(payments?.statusCounts) && (
                    <div>
                      <div className="text-sm font-medium mb-2">Payment Status Distribution</div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={Object.entries(payments.statusCounts).map(([name, value]: [string, any]) => ({
                                name: name.charAt(0).toUpperCase() + name.slice(1),
                                value: value
                              }))}
                              cx="40%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              labelLine={false}
                              label={false}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {Object.keys(payments.statusCounts).map((_, index) => (
                                <Cell key={`cell-${index}`} fill={[CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.danger, CHART_COLORS.info][index % 4]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number, name: string) => {
                              const total: number = (Object.values(payments.statusCounts) as number[]).reduce((a: number, b: number) => a + (b || 0), 0);
                              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                              return [`${value} (${percentage}%)`, name] as [string, string];
                            }} />
                            <Legend 
                              verticalAlign="middle" 
                              align="right" 
                              layout="vertical"
                              wrapperStyle={{ paddingLeft: '20px' }}
                            />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Payments Table */}
                  <div>
                    <div className="text-sm font-medium mb-2">Payment Details</div>
                    <div className="max-h-64 overflow-auto border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Wedding</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Paid</TableHead>
                            <TableHead>Due</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(payments?.items || []).map((it: any) => (
                            <TableRow key={it.wedding_id}>
                              <TableCell className="font-medium">#{it.wedding_id}</TableCell>
                              <TableCell>{it.wedding_date?.slice(0,10)}</TableCell>
                              <TableCell>{formatCurrency(it.total_cost || 0)}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  it.payment_status === 'paid' ? 'default' : 
                                  it.payment_status === 'partial' ? 'secondary' : 'destructive'
                                }>
                                  {it.payment_status || 'unknown'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-green-600">{formatCurrency(it.amount_paid || 0)}</TableCell>
                              <TableCell className="text-red-600">{formatCurrency(it.amount_due || 0)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Export CSV</Button>
                    <Button variant="outline">Print</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Menu Item Usage Analytics */}
            {menuUsage && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Menu Item Usage Analytics</CardTitle>
                    <Utensils className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardDescription>Menu item usage and profitability across all weddings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Menu Items</CardTitle>
                        <Hash className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{menuUsage.unique_menu_items || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Items used</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(menuUsage.total_revenue || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">From menu items</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(menuUsage.total_profit || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Margin: {menuUsage.total_revenue > 0 ? ((menuUsage.total_profit / menuUsage.total_revenue) * 100).toFixed(1) : 0}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{menuUsage.total_usage || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Table assignments</p>
                        {menuUsage.usage_change_percent !== 0 && (
                          <p className={`text-xs mt-1 ${menuUsage.usage_change_percent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {menuUsage.usage_change_percent > 0 ? '+' : ''}{menuUsage.usage_change_percent.toFixed(1)}% vs previous
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Top Menu Items by Usage */}
                  {(menuUsage.menu_items && menuUsage.menu_items.length > 0) && (
                    <div>
                      <div className="text-sm font-medium mb-2">Top 10 Menu Items by Usage</div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={menuUsage.menu_items.slice(0, 10).reverse()} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis type="number" className="text-xs" />
                            <YAxis dataKey="menu_name" type="category" width={120} className="text-xs" />
                            <Tooltip 
                              formatter={(value: number) => `${value} times`}
                              contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                            />
                            <Bar dataKey="usage_count" fill={CHART_COLORS.primary} name="Usage Count" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Menu Items by Revenue (Stacked) */}
                  {(menuUsage.menu_items && menuUsage.menu_items.length > 0) && (
                    <div>
                      <div className="text-sm font-medium mb-2">Menu Items by Revenue (Cost vs Profit)</div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={menuUsage.menu_items.slice(0, 10).reverse()}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="menu_name" angle={-45} textAnchor="end" height={100} className="text-xs" />
                            <YAxis className="text-xs" tickFormatter={(value) => formatCurrency(value)} />
                            <Tooltip 
                              formatter={(value: number) => formatCurrency(value)}
                              contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                            />
                            <Legend />
                            <Bar dataKey="total_cost" stackId="a" fill={CHART_COLORS.danger} name="Cost" />
                            <Bar dataKey="total_profit" stackId="a" fill={CHART_COLORS.success} name="Profit" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Detailed Table */}
                  {(menuUsage.menu_items && menuUsage.menu_items.length > 0) && (
                    <div>
                      <div className="text-sm font-medium mb-2">Detailed Menu Item Usage</div>
                      <div className="max-h-64 overflow-auto border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Menu Item</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Usage Count</TableHead>
                              <TableHead>Revenue</TableHead>
                              <TableHead>Cost</TableHead>
                              <TableHead>Profit</TableHead>
                              <TableHead>Margin %</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {menuUsage.menu_items.map((item: any) => (
                              <TableRow key={item.menu_item_id}>
                                <TableCell className="font-medium">{item.menu_name}</TableCell>
                                <TableCell>{item.menu_type}</TableCell>
                                <TableCell>{item.usage_count}</TableCell>
                                <TableCell>{formatCurrency(item.total_revenue)}</TableCell>
                                <TableCell>{formatCurrency(item.total_cost)}</TableCell>
                                <TableCell className={item.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {formatCurrency(item.total_profit)}
                                </TableCell>
                                <TableCell>{item.profit_margin.toFixed(1)}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Ingredient Consumption Analytics */}
            {ingredientUsage && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Ingredient Consumption Analytics</CardTitle>
                    <Warehouse className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardDescription>Ingredient consumption and stock status across all weddings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unique Ingredients</CardTitle>
                        <Hash className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{ingredientUsage.unique_ingredients || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Ingredients used</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Consumed</CardTitle>
                        <Calculator className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{ingredientUsage.total_consumed?.toFixed(2) || 0}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total quantity</p>
                        {ingredientUsage.consumption_change_percent !== 0 && (
                          <p className={`text-xs mt-1 ${ingredientUsage.consumption_change_percent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {ingredientUsage.consumption_change_percent > 0 ? '+' : ''}{ingredientUsage.consumption_change_percent.toFixed(1)}% vs previous
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          {formatCurrency(ingredientUsage.total_cost || 0)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Estimated cost</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                          {ingredientUsage.low_stock_ingredients?.length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Need attention</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Low Stock Alert */}
                  {(ingredientUsage.low_stock_ingredients && ingredientUsage.low_stock_ingredients.length > 0) && (
                    <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-md p-4">
                      <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <h3 className="font-semibold">Ingredients Approaching Re-order Level</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ingredientUsage.low_stock_ingredients.map((item: any) => (
                          <Badge key={item.ingredient_id} variant="destructive">
                            {item.ingredient_name} ({item.stock_quantity} {item.unit || ''} - Reorder: {item.re_order_level})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top Ingredients by Consumption */}
                  {(ingredientUsage.ingredients && ingredientUsage.ingredients.length > 0) && (
                    <div>
                      <div className="text-sm font-medium mb-2">Top 10 Ingredients by Consumption</div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={ingredientUsage.ingredients.slice(0, 10).reverse()} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis type="number" className="text-xs" />
                            <YAxis dataKey="ingredient_name" type="category" width={120} className="text-xs" />
                            <Tooltip 
                              formatter={(value: number) => `${value.toFixed(2)}`}
                              contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                            />
                            <Bar dataKey="total_consumed" fill={CHART_COLORS.orange} name="Consumed" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Ingredient Consumption Distribution */}
                  {(ingredientUsage.ingredients && ingredientUsage.ingredients.length > 0) && (
                    <div>
                      <div className="text-sm font-medium mb-2">Ingredient Consumption Distribution (by Cost)</div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={ingredientUsage.ingredients.slice(0, 10).map((item: any) => ({
                                name: item.ingredient_name,
                                value: item.estimated_cost
                              }))}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {ingredientUsage.ingredients.slice(0, 10).map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={[CHART_COLORS.primary, CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.danger, CHART_COLORS.info, CHART_COLORS.purple, CHART_COLORS.orange, CHART_COLORS.pink][index % 8]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Detailed Table */}
                  {(ingredientUsage.ingredients && ingredientUsage.ingredients.length > 0) && (
                    <div>
                      <div className="text-sm font-medium mb-2">Detailed Ingredient Consumption</div>
                      <div className="max-h-64 overflow-auto border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ingredient</TableHead>
                              <TableHead>Consumed</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead>Weddings</TableHead>
                              <TableHead>Stock</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Estimated Cost</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {ingredientUsage.ingredients.map((item: any) => (
                              <TableRow key={item.ingredient_id}>
                                <TableCell className="font-medium">{item.ingredient_name}</TableCell>
                                <TableCell>{item.total_consumed.toFixed(2)}</TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell>{item.wedding_count}</TableCell>
                                <TableCell>{item.stock_quantity.toFixed(2)}</TableCell>
                                <TableCell>
                                  <Badge variant={
                                    item.stock_status === 'low' ? 'destructive' :
                                    item.stock_status === 'warning' ? 'secondary' : 'default'
                                  }>
                                    {item.stock_status === 'low' ? 'Low Stock' :
                                     item.stock_status === 'warning' ? 'Warning' : 'Good'}
                                  </Badge>
                                </TableCell>
                                <TableCell>{formatCurrency(item.estimated_cost)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="wedding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Wedding Selector</CardTitle>
                <CardDescription>Select a wedding to view detailed reports</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Select value={weddingId} onValueChange={(v: any) => setWeddingId(v)}>
                    <SelectTrigger><SelectValue placeholder="Select wedding" /></SelectTrigger>
                    <SelectContent>
                      {(weddings || []).map((w: any) => (
                        <SelectItem key={w.wedding_id || w.id} value={String(w.wedding_id || w.id)}>
                          #{w.wedding_id || w.id} — {w.venue || 'Wedding'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={fetchWeddingSpecific} disabled={!weddingId || loading}>Load</Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Menu & Dietary Report</CardTitle>
                  <CardDescription>Top dishes, allergens, guest dietary restrictions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Top Dishes Bar Chart */}
                  {(menuDietary?.dishCounts && menuDietary.dishCounts.length > 0) && (
                    <div>
                      <div className="text-sm font-medium mb-2">Top Dishes</div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={menuDietary.dishCounts.slice(0, 10).reverse()} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis type="number" className="text-xs" />
                            <YAxis dataKey="menu_name" type="category" width={120} className="text-xs" />
                            <Tooltip 
                              formatter={(value: number) => `${value} times`}
                              contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                            />
                            <Bar dataKey="times_ordered" fill={CHART_COLORS.primary} name="Times Ordered" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Allergens Pie Chart */}
                    {(menuDietary?.allergens && menuDietary.allergens.length > 0) && (
                      <div>
                        <div className="text-sm font-medium mb-2">Allergens Distribution</div>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsPieChart>
                              <Pie
                                data={menuDietary.allergens.reduce((acc: any, a: any) => {
                                  const existing = acc.find((item: any) => item.name === a.restriction_name);
                                  if (existing) {
                                    existing.value += 1;
                                  } else {
                                    acc.push({ name: a.restriction_name, value: 1 });
                                  }
                                  return acc;
                                }, [])}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={60}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {menuDietary.allergens.map((_: any, index: number) => (
                                  <Cell key={`cell-${index}`} fill={[CHART_COLORS.warning, CHART_COLORS.danger, CHART_COLORS.orange, CHART_COLORS.info][index % 4]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Guest Restrictions Bar Chart */}
                    {(menuDietary?.guestRestrictions && menuDietary.guestRestrictions.length > 0) && (
                      <div>
                        <div className="text-sm font-medium mb-2">Guest Restrictions</div>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={menuDietary.guestRestrictions.slice(0, 8)}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                              <XAxis dataKey="restriction_name" angle={-45} textAnchor="end" height={80} className="text-xs" />
                              <YAxis className="text-xs" />
                              <Tooltip 
                                formatter={(value: number) => `${value} guests`}
                                contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
                              />
                              <Bar dataKey="cnt" fill={CHART_COLORS.secondary} name="Guest Count" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory & Equipment Usage</CardTitle>
                  <CardDescription>Allocations and items needing attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Utilization Gauge/Summary */}
                  {(inventoryUsage?.allocations && inventoryUsage.allocations.length > 0) && (
                    <div>
                      <div className="text-sm font-medium mb-2">Equipment Utilization</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border rounded-md p-3 text-center">
                          <div className="text-2xl font-bold">{inventoryUsage.allocations.length}</div>
                          <div className="text-xs text-muted-foreground">Items Allocated</div>
                        </div>
                        <div className="border rounded-md p-3 text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {inventoryUsage.needsAttention?.length || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Need Attention</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Allocations Table */}
                  <div>
                    <div className="text-sm font-medium mb-2">Inventory Allocations</div>
                    <div className="max-h-48 overflow-auto border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Qty Used</TableHead>
                            <TableHead>Avail</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(inventoryUsage?.allocations || []).map((a: any) => (
                            <TableRow key={a.allocation_id}>
                              <TableCell className="font-medium">{a.item_name}</TableCell>
                              <TableCell>{a.quantity_used}</TableCell>
                              <TableCell>{a.quantity_available}</TableCell>
                              <TableCell>
                                {(inventoryUsage?.needsAttention || []).some((n: any) => n.allocation_id === a.allocation_id) ? (
                                  <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                    <AlertTriangle className="h-3 w-3" />
                                    Attention
                                  </Badge>
                                ) : (
                                  <Badge variant="default" className="flex items-center gap-1 w-fit">
                                    <CheckCircle className="h-3 w-3" />
                                    OK
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Needs Attention Alert */}
                  {(inventoryUsage?.needsAttention && inventoryUsage.needsAttention.length > 0) && (
                    <div className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded-md p-3">
                      <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <h3 className="font-semibold text-sm">Items Needing Attention</h3>
                      </div>
                      <ul className="text-sm space-y-1">
                        {inventoryUsage.needsAttention.map((n: any) => (
                          <li key={n.allocation_id}>
                            <Badge variant="outline" className="mr-2">{n.item_name}</Badge>
                            {n.item_condition || 'check'} ({n.quantity_available} avail)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Guest Seating & Assignment</CardTitle>
                <CardDescription>Tables and assigned guests with packages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary Metrics */}
                {seating?.summary && (
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
                        <Hash className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{seating.summary.total_tables || 0}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{seating.summary.total_guests || 0}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{seating.summary.total_capacity || 0}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{seating.summary.occupancy_rate?.toFixed(1) || 0}%</div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Tables Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(seating?.seating || []).map((t: any) => {
                    const guestCount = (t.guests || []).length;
                    const capacity = parseInt(t.capacity) || 0;
                    const occupancyPercent = capacity > 0 ? (guestCount / capacity) * 100 : 0;
                    const categoryColors: Record<string, string> = {
                      'VIP': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
                      'Family': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
                      'Friends': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
                      'Others': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                    };
                    const categoryColor = categoryColors[t.table_category] || categoryColors['Others'];

                    return (
                      <Card key={t.table_id} className="border-2">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-lg font-bold">
                                #{t.table_number || t.table_id}
                              </Badge>
                              {t.table_category && (
                                <Badge className={categoryColor}>
                                  {t.table_category}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {guestCount}/{capacity} guests
                            </div>
                          </div>
                          {t.package && (
                            <div className="mt-2">
                              <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                                <Package className="h-3 w-3" />
                                {t.package.package_name}
                              </Badge>
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {/* Occupancy Progress Bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Occupancy</span>
                              <span>{occupancyPercent.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  occupancyPercent >= 90 ? 'bg-red-500' :
                                  occupancyPercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Guests List */}
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-muted-foreground">Guests:</div>
                            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                              {(t.guests || []).map((g: any) => (
                                <Badge
                                  key={g.guest_id}
                                  variant={
                                    g.rsvp_status === 'confirmed' ? 'default' :
                                    g.rsvp_status === 'pending' ? 'secondary' : 'outline'
                                  }
                                  className="text-xs"
                                >
                                  {g.rsvp_status === 'confirmed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {g.rsvp_status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                  {g.rsvp_status === 'no_response' && <XCircle className="h-3 w-3 mr-1" />}
                                  {g.guest_name}
                                </Badge>
                              ))}
                              {guestCount === 0 && (
                                <span className="text-xs text-muted-foreground italic">No guests assigned</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline">Export CSV</Button>
              <Button variant="outline">Print</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;


