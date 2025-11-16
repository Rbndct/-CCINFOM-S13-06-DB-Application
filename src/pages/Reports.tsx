import { BarChart3, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { tablesAPI, weddingsAPI } from '@/api';
import api from '@/api';

const Reports = () => {
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [value, setValue] = useState<string>(''); // YYYY-MM or YYYY
  const [sales, setSales] = useState<any>(null);
  const [payments, setPayments] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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
      setSales(s.data || s);
      setPayments(p.data || p);
    } finally {
      setLoading(false);
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

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General Reports</TabsTrigger>
            <TabsTrigger value="wedding">Wedding-Specific Reports</TabsTrigger>
          </TabsList>

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


