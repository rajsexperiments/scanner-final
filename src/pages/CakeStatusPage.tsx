import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Cake, Inbox, RefreshCw, Search } from 'lucide-react';
import { useInventoryStore } from '@/hooks/use-inventory';
import { formatDistanceToNow } from 'date-fns';
import { Toaster } from '@/components/ui/sonner';
import { useTranslation } from 'react-i18next';
export function CakeStatusPage() {
  const { t } = useTranslation();
  const { cakeStatus, loadingCakeStatus, fetchCakeStatus } = useInventoryStore();
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    fetchCakeStatus();
  }, [fetchCakeStatus]);
  const filteredStatus = useMemo(() => {
    return cakeStatus.filter(cake =>
      cake.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime());
  }, [cakeStatus, searchTerm]);
  const renderContent = () => {
    if (loadingCakeStatus && cakeStatus.length === 0) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      );
    }
    if (cakeStatus.length === 0) {
      return (
        <div className="text-center py-16">
          <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">{t('cakeStatus.empty.title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t('cakeStatus.empty.description')}</p>
        </div>
      );
    }
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('cakeStatus.table.serialNumber')}</TableHead>
              <TableHead>{t('cakeStatus.table.status')}</TableHead>
              <TableHead>{t('cakeStatus.table.location')}</TableHead>
              <TableHead className="text-right">{t('cakeStatus.table.lastUpdate')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStatus.map((cake) => (
              <TableRow key={cake.serialNumber}>
                <TableCell className="font-mono">{cake.serialNumber}</TableCell>
                <TableCell>{cake.status}</TableCell>
                <TableCell>{cake.currentLocation}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDistanceToNow(new Date(cake.lastUpdate), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="space-y-8">
          <header className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{t('cakeStatus.title')}</h1>
            <p className="text-lg text-muted-foreground">{t('cakeStatus.description')}</p>
          </header>
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2"><Cake className="h-5 w-5" /><span>{t('cakeStatus.cardTitle')}</span></CardTitle>
                <CardDescription>{t('cakeStatus.cardDescription', { count: cakeStatus.length })}</CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('cakeStatus.searchPlaceholder')}
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={fetchCakeStatus} disabled={loadingCakeStatus}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${loadingCakeStatus ? 'animate-spin' : ''}`} />
                  {t('cakeStatus.refresh')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>{renderContent()}</CardContent>
          </Card>
        </div>
      </div>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}