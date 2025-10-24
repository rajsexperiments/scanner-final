import React, { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Package, Truck, ShoppingCart, Building2 } from 'lucide-react';
import { useInventoryStore } from '@/hooks/use-inventory';
import { Toaster } from '@/components/ui/sonner';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};
const KpiCard = ({ title, value, icon: Icon }: { title: string; value: number | string; icon: React.ElementType }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);
export function LiveOperationsPage() {
  const { t } = useTranslation();
  const { liveOperationsData, loadingLiveOperations, fetchLiveOperationsData } = useInventoryStore();
  useEffect(() => {
    fetchLiveOperationsData();
  }, [fetchLiveOperationsData]);
  const renderContent = () => {
    if (loadingLiveOperations && !liveOperationsData) {
      return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}</div>;
    }
    if (!liveOperationsData) {
      return <div className="text-center py-16">No operations data available.</div>;
    }
    const { productionSummary, inventoryByLocation, salesSummary } = liveOperationsData;
    return (
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants}>
          <Card className="h-full"><CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5" />{t('liveOps.productionTitle')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <KpiCard title={t('liveOps.kpi.producedToday')} value={productionSummary.producedToday} icon={Package} />
              <KpiCard title={t('liveOps.kpi.totalProduced')} value={productionSummary.totalProduced} icon={Package} />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="h-full"><CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" />{t('liveOps.inventoryTitle')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <KpiCard title={t('liveOps.kpi.inWarehouse')} value={inventoryByLocation.inProductionWarehouse} icon={Building2} />
              <KpiCard title={t('liveOps.kpi.inTransit')} value={inventoryByLocation.inTransit} icon={Truck} />
              <KpiCard title={t('liveOps.kpi.atBoutique')} value={inventoryByLocation.atBoutique} icon={ShoppingCart} />
              <KpiCard title={t('liveOps.kpi.atMarche')} value={inventoryByLocation.atMarche} icon={ShoppingCart} />
              <KpiCard title={t('liveOps.kpi.atSaleya')} value={inventoryByLocation.atSaleya} icon={ShoppingCart} />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="h-full"><CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" />{t('liveOps.salesTitle')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <KpiCard title={t('liveOps.kpi.soldB2C')} value={salesSummary.soldTodayB2C} icon={ShoppingCart} />
              <KpiCard title={t('liveOps.kpi.deliveredB2B')} value={salesSummary.deliveredTodayB2B} icon={Truck} />
              <KpiCard title={t('liveOps.kpi.totalSold')} value={salesSummary.totalSoldDelivered} icon={ShoppingCart} />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="space-y-8">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">{t('liveOps.title')}</h1>
              <p className="text-lg text-muted-foreground">{t('liveOps.description')}</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchLiveOperationsData} disabled={loadingLiveOperations}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loadingLiveOperations ? 'animate-spin' : ''}`} />
              {t('liveOps.refresh')}
            </Button>
          </header>
          {renderContent()}
        </div>
      </div>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}