import React, { useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, Package, ScanLine, Inbox, RefreshCw } from 'lucide-react';
import { useInventoryStore } from '@/hooks/use-inventory';
import { Toaster } from '@/components/ui/sonner';
import { motion, Variants } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};
export function SummaryPage() {
  const { t } = useTranslation();
  const summary = useInventoryStore((state) => state.summary);
  const loadingSummary = useInventoryStore((state) => state.loadingSummary);
  const fetchSummary = useInventoryStore((state) => state.fetchSummary);
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);
  const { totalItems, uniqueProducts } = useMemo(() => {
    const total = summary.reduce((acc, item) => acc + item.count, 0);
    return {
      totalItems: total,
      uniqueProducts: summary.length,
    };
  }, [summary]);
  const renderKPIs = () => {
    if (loadingSummary && summary.length === 0) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      );
    }
    return (
      <motion.div
        className="grid gap-4 md:grid-cols-2"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('summary.kpi.totalItems')}</CardTitle>
              <ScanLine className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('summary.kpi.uniqueProducts')}</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueProducts}</div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  };
  const renderSummaryGrid = () => {
    if (loadingSummary && summary.length === 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      );
    }
    if (summary.length === 0) {
      return (
        <div className="text-center py-16 col-span-full">
          <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">{t('summary.empty.title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('summary.empty.description')}
          </p>
        </div>
      );
    }
    return (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {summary.map((item) => (
          <motion.div key={item.productId} variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg truncate" title={item.productName}>
                  {item.productName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{item.count}</p>
                <p className="text-xs text-muted-foreground">{t('summary.itemsScanned')}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    );
  };
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="space-y-8">
          <header className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{t('summary.title')}</h1>
            <p className="text-lg text-muted-foreground">
              {t('summary.description')}
            </p>
          </header>
          {renderKPIs()}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <span>{t('summary.cardTitle')}</span>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={fetchSummary} disabled={loadingSummary}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loadingSummary ? 'animate-spin' : ''}`} />
                {t('summary.refresh')}
              </Button>
            </CardHeader>
            <CardContent>
              {renderSummaryGrid()}
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}