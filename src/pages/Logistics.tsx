import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ingredientsAPI } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const Logistics = () => {
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Restock form
  const [restockId, setRestockId] = useState<string>('');
  const [restockDelta, setRestockDelta] = useState<string>('');

  // Add ingredient form
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newReorder, setNewReorder] = useState('');

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const res = await ingredientsAPI.getAll();
      if (res && res.data) {
        setIngredients(res.data);
      } else if (res && Array.isArray(res)) {
        setIngredients(res);
      } else {
        setIngredients([]);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.error || 'Failed to fetch ingredients', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleRestock = async () => {
    const idNum = parseInt(restockId, 10);
    const deltaNum = parseFloat(restockDelta);
    if (!idNum || !deltaNum) {
      toast({ title: 'Validation', description: 'Select ingredient and enter non-zero delta', variant: 'destructive' });
      return;
    }
    try {
      await ingredientsAPI.restock(idNum, deltaNum);
      toast({ title: 'Success', description: 'Ingredient restocked' });
      setRestockDelta('');
      await fetchIngredients();
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.error || 'Failed to restock', variant: 'destructive' });
    }
  };

  const handleAdd = async () => {
    if (!newName || !newUnit || newStock === '' || newReorder === '') {
      toast({ title: 'Validation', description: 'Fill all fields', variant: 'destructive' });
      return;
    }
    try {
      await ingredientsAPI.create({
        ingredient_name: newName,
        unit: newUnit,
        stock_quantity: parseFloat(newStock),
        re_order_level: newReorder,
      });
      toast({ title: 'Success', description: 'Ingredient added' });
      setNewName('');
      setNewUnit('');
      setNewStock('');
      setNewReorder('');
      await fetchIngredients();
    } catch (e: any) {
      toast({ title: 'Error', description: e.response?.data?.error || 'Failed to add ingredient', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Ingredient Restock</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ingredient Restock Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value="restock" className="w-full">
              <TabsList>
                <TabsTrigger value="restock">Restock Ingredients</TabsTrigger>
              </TabsList>
              <TabsContent value="restock" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ingredients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-[420px] overflow-auto border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Unit</TableHead>
                              <TableHead>Stock</TableHead>
                              <TableHead>Reorder</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loading ? (
                              <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
                            ) : ingredients.length === 0 ? (
                              <TableRow><TableCell colSpan={4}>No ingredients</TableCell></TableRow>
                            ) : ingredients.map((ing: any) => (
                              <TableRow key={ing.ingredient_id} onClick={() => setRestockId(String(ing.ingredient_id))} className="cursor-pointer">
                                <TableCell className="font-medium">{ing.ingredient_name}</TableCell>
                                <TableCell>{ing.unit}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span>{ing.stock_quantity}</span>
                                    {parseFloat(ing.stock_quantity) <= parseFloat(ing.re_order_level) ? (
                                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Low</Badge>
                                    ) : null}
                                  </div>
                                </TableCell>
                                <TableCell>{ing.re_order_level}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Restock Selected</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm text-muted-foreground">Ingredient ID</label>
                        <Input value={restockId} onChange={(e) => setRestockId(e.target.value)} placeholder="Select from table or enter ID" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Delta (+/-)</label>
                        <Input type="number" value={restockDelta} onChange={(e) => setRestockDelta(e.target.value)} placeholder="+10 or -5" />
                      </div>
                      <Button onClick={handleRestock}>Apply Restock</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Add Ingredient</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <label className="text-sm text-muted-foreground">Name</label>
                        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Flour" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Unit</label>
                        <Input value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="e.g., kg, pcs, L" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm text-muted-foreground">Initial Stock</label>
                          <Input type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)} placeholder="0" />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">Reorder Level</label>
                          <Input value={newReorder} onChange={(e) => setNewReorder(e.target.value)} placeholder="e.g., 10" />
                        </div>
                      </div>
                      <Button onClick={handleAdd}>Add Ingredient</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Logistics;


