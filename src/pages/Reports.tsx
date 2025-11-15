import { BarChart3, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Reports = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            View analytics and reports for your wedding business
          </p>
        </div>

        {/* Report Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Revenue Report</CardTitle>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Financial performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View detailed revenue breakdowns and financial analytics
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Guest Analytics</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Guest attendance and RSVP trends</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track guest engagement and RSVP patterns over time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Wedding Trends</CardTitle>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>Seasonal patterns and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analyze wedding booking patterns and seasonal trends
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder for charts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics Dashboard
            </CardTitle>
            <CardDescription>Comprehensive business analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Charts and graphs will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;


