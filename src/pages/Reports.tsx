import { BarChart3, DollarSign, TrendingUp, TrendingDown, Calculator, PieChart, FileText } from 'lucide-react';
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

const Reports = () => {
  const { formatCurrency } = useCurrencyFormat();
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [value, setValue] = useState<string>(''); // YYYY-MM or YYYY
  const [sales, setSales] = useState<any>(null);
  const [payments, setPayments] = useState<any>(null);
  const [financial, setFinancial] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [financialLoading, setFinancialLoading] = useState(false);

  const [weddingId, setWeddingId] = useState<string>('');
  const [weddings, setWeddings] = useState<any[]>([]);
  const [menuDietary, setMenuDietary] = useState<any>(null);
  const [inventoryUsage, setInventoryUsage] = useState<any>(null);
  const [seating, setSeating] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const res = await weddingsAPI.getAll().catch(() => ({ data: [] }));
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
            <TabsTrigger value="financial">Financial Reports</TabsTrigger>
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
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Month (YYYY-MM)</SelectItem>
                      <SelectItem value="year">Year (YYYY)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground">{period === 'month' ? 'Month (YYYY-MM)' : 'Year (YYYY)'}</label>
                  <Input 
                    value={value} 
                    onChange={(e) => {
                      setValue(e.target.value);
                      setFinancial(null);
                    }} 
                    placeholder={period === 'month' ? '2025-11' : '2025'} 
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
                {/* Income Statement */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Income Statement</CardTitle>
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <CardDescription>
                      {period === 'month' ? `For ${value}` : `For Year ${value}`}
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

                {/* Revenue by Package Type */}
                {financial.revenue_by_package_type && financial.revenue_by_package_type.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue by Package Type</CardTitle>
                      <CardDescription>Breakdown of revenue by package category</CardDescription>
                    </CardHeader>
                    <CardContent>
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


