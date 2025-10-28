import React, { useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { List, Trash2, Inbox, RefreshCw } from 'lucide-react';
import { useInventoryStore } from '@/hooks/use-inventory';
import { format } from 'date-fns';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/hooks/use-auth';
import { useTranslation } from 'react-i18next';
export function InventoryLogPage() {
  const { t } = useTranslation();
  const { logs, products, clients, loadingLogs, loadingProducts, loadingB2BClients, fetchLogs, fetchProducts, fetchB2BClients, clearLogs } = useInventoryStore();
  const currentUser = useAuthStore((state) => state.currentUser);
  useEffect(() => {
    fetchLogs();
    fetchProducts();
    fetchB2BClients();
  }, [fetchLogs, fetchProducts, fetchB2BClients]);
  const productMap = useMemo(() => new Map(products.map(p => [p.id, p.name])), [products]);
  const clientMap = useMemo(() => new Map(clients.map(c => [c.clientId, c.clientName])), [clients]);
  const getProductName = (serialNumber: string) => {
    const serialStr = String(serialNumber);
    const parts = serialStr.split('-');
    const productId = parts.length > 1 ? parts.slice(0, -1).join('-') : serialStr;
    return productMap.get(productId) || t('inventoryLog.unknownProduct');
  };
  const handleRefresh = () => {
    fetchLogs();
    fetchProducts();
    fetchB2BClients();
  };
  const renderContent = () => {
    const isLoading = loadingLogs || (loadingProducts && products.length === 0) || (loadingB2BClients && clients.length === 0);
    if (isLoading && logs.length === 0) {
      return <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
    }
    if (logs.length === 0) {
      return (
        <div className="text-center py-16">
          <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">{t('inventoryLog.empty.title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t('inventoryLog.empty.description')}</p>
        </div>
      );
    }
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('inventoryLog.table.productName')}</TableHead>
              <TableHead>{t('inventoryLog.table.serialNumber')}</TableHead>
              <TableHead>{t('inventoryLog.table.scanEvent')}</TableHead>
              <TableHead>{t('inventoryLog.table.location')}</TableHead>
              <TableHead>{t('inventoryLog.table.client')}</TableHead>
              <TableHead className="text-right">{t('inventoryLog.table.timestamp')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log, index) => (
              <TableRow key={`${log.timestamp}-${index}`}>
                <TableCell>{getProductName(log.serialNumber)}</TableCell>
                <TableCell className="font-mono">{log.serialNumber}</TableCell>
                <TableCell>{log.scanEvent.replace(/_/g, ' ')}</TableCell>
                <TableCell>{log.location}</TableCell>
                <TableCell>{log.clientId ? clientMap.get(log.clientId) || log.clientId : 'N/A'}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {format(new Date(log.timestamp), "MMM d, yyyy 'at' h:mm:ss a")}
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
            <h1 className="text-4xl font-bold tracking-tight">{t('inventoryLog.title')}</h1>
            <p className="text-lg text-muted-foreground">{t('inventoryLog.description')}</p>
          </header>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><List className="h-5 w-5" /><span>{t('inventoryLog.cardTitle')}</span></CardTitle>
                <CardDescription>{t('inventoryLog.cardDescription', { count: logs.length })}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loadingLogs}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${loadingLogs ? 'animate-spin' : ''}`} />
                  {t('inventoryLog.refresh')}
                </Button>
                {currentUser?.role === 'Warehouse Manager' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={logs.length === 0 || loadingLogs}>
                        <Trash2 className="mr-2 h-4 w-4" /> {t('inventoryLog.clearLog')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('inventoryLog.dialog.title')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('inventoryLog.dialog.description')}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('inventoryLog.dialog.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => clearLogs()}>{t('inventoryLog.dialog.confirm')}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
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
