import { BarChart3, DollarSign, TrendingUp, TrendingDown, Calculator, PieChart, FileText, CreditCard, ArrowUpDown, AlertTriangle, CheckCircle, Clock, XCircle, Hash, Users, MapPin, Calendar } from 'lucide-react';
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
      setSales(s.data?.data || s.data || s);
      setPayments(p.data?.data || p.data || p);
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
              <CardContent className="grid md:grid-cols-4 gap-3">
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
                {/* Income Statement */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Income Statement</CardTitle>
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>
                      {period === 'month' ? `For ${value}` : period === 'day' ? `For ${value}` : `For Year ${value}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Revenue */}
                      <div className="border-b pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">Revenue</h3>
                            <p className="text-sm text-muted-foreground">Package Sales</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(financial.revenue?.total || 0)}
                            </div>
                            {financial.revenue?.change_percent !== undefined && financial.revenue.change_percent !== 0 && (
                              <div className={`text-sm flex items-center gap-1 ${financial.revenue.change_percent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {financial.revenue.change_percent > 0 ? (
                                  <TrendingUp className="h-4 w-4" />
                                ) : (
                                  <TrendingDown className="h-4 w-4" />
                                )}
                                {Math.abs(financial.revenue.change_percent).toFixed(1)}% vs previous period
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* COGS */}
                      <div className="border-b pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Cost of Goods Sold (COGS)</h3>
                            <p className="text-sm text-muted-foreground">Package Costs</p>
                          </div>
                          <div className="text-xl font-semibold text-red-600">
                            {formatCurrency(financial.cogs?.total || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Gross Profit */}
                      <div className="border-b pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Gross Profit</h3>
                            <p className="text-sm text-muted-foreground">
                              Margin: {financial.gross_profit?.margin_percent?.toFixed(2) || 0}%
                            </p>
                          </div>
                          <div className="text-xl font-semibold text-blue-600">
                            {formatCurrency(financial.gross_profit?.total || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Operating Costs */}
                      <div className="border-b pb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Operating Costs</h3>
                            <p className="text-sm text-muted-foreground">
                              Equipment Rental: {formatCurrency(financial.operating_costs?.equipment_rental || 0)}
                            </p>
                          </div>
                          <div className="text-xl font-semibold text-orange-600">
                            {formatCurrency(financial.operating_costs?.total || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Net Profit */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
                          <div>
                            <h3 className="font-bold text-lg">Net Profit</h3>
                            <p className="text-sm text-muted-foreground">
                              Margin: {financial.net_profit?.margin_percent?.toFixed(2) || 0}%
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
                          <div className={`text-3xl font-bold ${(financial.net_profit?.total || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(financial.net_profit?.total || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Weddings</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{financial.weddings_count || 0}</div>
                      <p className="text-xs text-muted-foreground">With packages</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Table Assignments</CardTitle>
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{financial.table_assignments || 0}</div>
                      <p className="text-xs text-muted-foreground">Package assignments</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
                      <PieChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {financial.gross_profit?.margin_percent?.toFixed(1) || 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">Profit margin</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Net Margin</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {financial.net_profit?.margin_percent?.toFixed(1) || 0}%
                      </div>
                      <p className="text-xs text-muted-foreground">After operating costs</p>
                    </CardContent>
                  </Card>
                </div>

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
              <CardContent className="grid md:grid-cols-4 gap-3">
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
              </CardContent>
            </Card>

            {cashFlow && (
              <>
                {/* Cash Flow Summary */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Cash Flow Statement</CardTitle>
                      <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>
                      {period === 'day' ? `For ${value}` : period === 'month' ? `For ${value}` : `For Year ${value}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Cash Inflows */}
                      <div className="border-b pb-4">
                        <h3 className="font-semibold text-lg mb-3 text-green-600">Cash Inflows</h3>
                        <div className="space-y-2 ml-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Package Sales</span>
                            <span className="font-medium">{formatCurrency(cashFlow.cash_flows?.inflows?.package_sales || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Equipment Rental</span>
                            <span className="font-medium">{formatCurrency(cashFlow.cash_flows?.inflows?.equipment_rental || 0)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t font-semibold">
                            <span>Total Inflows</span>
                            <span className="text-green-600">{formatCurrency(cashFlow.cash_flows?.inflows?.total || 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Cash Outflows */}
                      <div className="border-b pb-4">
                        <h3 className="font-semibold text-lg mb-3 text-red-600">Cash Outflows</h3>
                        <div className="space-y-2 ml-4">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Package Costs (COGS)</span>
                            <span className="font-medium">{formatCurrency(cashFlow.cash_flows?.outflows?.package_costs || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Equipment Costs</span>
                            <span className="font-medium">{formatCurrency(cashFlow.cash_flows?.outflows?.equipment_costs || 0)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t font-semibold">
                            <span>Total Outflows</span>
                            <span className="text-red-600">{formatCurrency(cashFlow.cash_flows?.outflows?.total || 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Net Cash Flow */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
                          <h3 className="font-bold text-lg">Net Cash Flow</h3>
                          <div className={`text-3xl font-bold ${(cashFlow.cash_flows?.net_cash_flow || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(cashFlow.cash_flows?.net_cash_flow || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Payment Receipts */}
                      <div className="pt-4 border-t">
                        <h3 className="font-semibold text-lg mb-3">Payment Receipts</h3>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Cash Received</div>
                            <div className="text-xl font-semibold text-green-600">
                              {formatCurrency(cashFlow.payment_receipts?.cash_received || 0)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Paid</div>
                            <div className="text-xl font-semibold">{cashFlow.payment_receipts?.paid_count || 0}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Partial</div>
                            <div className="text-xl font-semibold text-warning">{cashFlow.payment_receipts?.partial_count || 0}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Pending</div>
                            <div className="text-xl font-semibold text-red-600">{cashFlow.payment_receipts?.pending_count || 0}</div>
                          </div>
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
              <CardContent className="grid md:grid-cols-4 gap-3">
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

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Wedding Sales Report</CardTitle>
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardDescription>Totals, averages, popular packages and menu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Income</div>
                      <div className="text-xl font-semibold">{sales?.totalIncome ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Avg Income</div>
                      <div className="text-xl font-semibold">{sales?.avgIncome ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Weddings</div>
                      <div className="text-xl font-semibold">{sales?.weddingCount ?? 0}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Payment Methods</div>
                    <div className="text-sm text-muted-foreground">
                      Cash: {sales?.paymentBreakdown?.cash ?? 0} | Card: {sales?.paymentBreakdown?.card ?? 0} | Bank: {sales?.paymentBreakdown?.bank ?? 0}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-1">Top Packages</div>
                      <ul className="text-sm list-disc pl-5">
                        {(sales?.topPackages || []).map((p: any) => (
                          <li key={p.package_id}>{p.package_name} ({p.usage_count})</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Top Menu Items</div>
                      <ul className="text-sm list-disc pl-5">
                        {(sales?.topMenuItems || []).map((m: any) => (
                          <li key={m.menu_item_id}>{m.menu_name} ({m.usage_count})</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment & Receipt Report</CardTitle>
                  <CardDescription>Status by wedding for selected period</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    Status counts: {payments?.statusCounts ? JSON.stringify(payments.statusCounts) : '{}'}
                  </div>
                  <div className="max-h-64 overflow-auto border rounded-md">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left">
                          <th className="p-2">Wedding</th>
                          <th className="p-2">Date</th>
                          <th className="p-2">Total</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">Paid</th>
                          <th className="p-2">Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(payments?.items || []).map((it: any) => (
                          <tr key={it.wedding_id}>
                            <td className="p-2">#{it.wedding_id}</td>
                            <td className="p-2">{it.wedding_date?.slice(0,10)}</td>
                            <td className="p-2">{it.total_cost}</td>
                            <td className="p-2">{it.payment_status}</td>
                            <td className="p-2">{it.amount_paid}</td>
                            <td className="p-2">{it.amount_due}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Export CSV</Button>
                    <Button variant="outline">Print</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-1">Top Dishes</div>
                    <ul className="text-sm list-disc pl-5">
                      {(menuDietary?.dishCounts || []).map((d: any) => (
                        <li key={d.menu_item_id}>{d.menu_name} ({d.times_ordered})</li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-1">Allergens</div>
                      <ul className="text-sm list-disc pl-5">
                        {(menuDietary?.allergens || []).map((a: any, idx: number) => (
                          <li key={idx}>{a.menu_name}: {a.restriction_name}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Guest Restrictions</div>
                      <ul className="text-sm list-disc pl-5">
                        {(menuDietary?.guestRestrictions || []).map((g: any, idx: number) => (
                          <li key={idx}>{g.restriction_name || 'None'} ({g.cnt})</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inventory & Equipment Usage</CardTitle>
                  <CardDescription>Allocations and items needing attention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="max-h-48 overflow-auto border rounded-md">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left">
                          <th className="p-2">Item</th><th className="p-2">Qty Used</th><th className="p-2">Avail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(inventoryUsage?.allocations || []).map((a: any) => (
                          <tr key={a.allocation_id}>
                            <td className="p-2">{a.item_name}</td>
                            <td className="p-2">{a.quantity_used}</td>
                            <td className="p-2">{a.quantity_available}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Needs Attention</div>
                    <ul className="text-sm list-disc pl-5">
                      {(inventoryUsage?.needsAttention || []).map((n: any) => (
                        <li key={n.allocation_id}>{n.item_name} — {n.item_condition || 'check'} ({n.quantity_available} avail)</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Guest Seating & Assignment</CardTitle>
                <CardDescription>Tables and assigned guests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-72 overflow-auto border rounded-md">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="p-2">Table</th><th className="p-2">Category</th><th className="p-2">Capacity</th><th className="p-2">Guests</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(seating?.seating || []).map((t: any) => (
                        <tr key={t.table_id}>
                          <td className="p-2">#{t.table_number || t.table_id}</td>
                          <td className="p-2">{t.table_category || 'N/A'}</td>
                          <td className="p-2">{t.capacity || '-'}</td>
                          <td className="p-2">{(t.guests || []).map((g: any) => g.guest_name).join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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


