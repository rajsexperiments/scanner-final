import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Settings, Trash2, PlusCircle, Inbox, Loader2, Pencil, X, ShieldAlert } from 'lucide-react';
import { useInventoryStore } from '@/hooks/use-inventory';
import { useAuthStore } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@shared/types';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
const productSchema = z.object({
  id: z.string().min(1, "Product ID is required."),
  name: z.string().min(1, "Product Name is required."),
  category: z.string().optional(),
  unitOfMeasure: z.string().optional(),
  unitCost: z.coerce.number().min(0).optional(),
  supplierName: z.string().optional(),
  reorderLevel: z.coerce.number().int().min(0).optional(),
  reorderQuantity: z.coerce.number().int().min(0).optional(),
  storageLocation: z.string().optional(),
  shelfLifeDays: z.coerce.number().int().min(0).optional(),
  isPerishable: z.boolean().default(false),
});
type ProductFormData = Product;
const defaultFormValues: ProductFormData = {
  id: "", name: "", category: "", unitOfMeasure: "", unitCost: 0,
  supplierName: "", reorderLevel: 0, reorderQuantity: 0,
  storageLocation: "", shelfLifeDays: 0, isPerishable: false,
};
export function SettingsPage() {
  const { t } = useTranslation();
  const { products, loadingProducts, fetchProducts, addProduct, deleteProduct } = useInventoryStore();
  const { currentUser } = useAuthStore();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormData>,
    defaultValues: defaultFormValues,
  });
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  useEffect(() => {
    if (editingProduct) {
      form.reset(editingProduct);
    } else {
      form.reset(defaultFormValues);
    }
  }, [editingProduct, form]);
  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    await addProduct(data as Product);
    setEditingProduct(null);
  };
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleCancelEdit = () => {
    setEditingProduct(null);
  };
  if (currentUser?.role !== 'Warehouse Manager') {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
          <Card className="text-center p-8">
            <CardHeader>
              <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
              <CardTitle className="mt-4">{t('settings.accessDenied.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('settings.accessDenied.description')}</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }
  const renderProductList = () => {
    if (loadingProducts && products.length === 0) {
      return <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;
    }
    if (products.length === 0) {
      return (
        <div className="text-center py-16"><Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">{t('settings.list.empty.title')}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t('settings.list.empty.description')}</p>
        </div>
      );
    }
    return (
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader><TableRow><TableHead>{t('settings.list.table.id')}</TableHead><TableHead>{t('settings.list.table.name')}</TableHead><TableHead>{t('settings.list.table.category')}</TableHead><TableHead>{t('settings.list.table.supplier')}</TableHead><TableHead className="text-right">{t('settings.list.table.actions')}</TableHead></TableRow></TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-mono">{product.id}</TableCell><TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell><TableCell>{product.supplierName}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}><Pencil className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>{t('settings.list.dialog.title', { name: product.name })}</AlertDialogTitle><AlertDialogDescription>{t('settings.list.dialog.description')}</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>{t('settings.list.dialog.cancel')}</AlertDialogCancel><AlertDialogAction onClick={() => deleteProduct(product.id)} className="bg-destructive hover:bg-destructive/90">{t('settings.list.dialog.confirm')}</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
          <header className="space-y-2"><h1 className="text-4xl font-bold tracking-tight">{t('settings.title')}</h1><p className="text-lg text-muted-foreground">{t('settings.description')}</p></header>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5" /><span>{editingProduct ? t('settings.form.editTitle') : t('settings.form.addTitle')}</span></CardTitle><CardDescription>{editingProduct ? t('settings.form.editingDescription', { name: editingProduct.name }) : t('settings.form.description')}</CardDescription></CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField control={form.control} name="id" render={({ field }) => (<FormItem><FormLabel>{t('settings.form.labels.id')}</FormLabel><FormControl><Input placeholder="e.g., OLV-001" {...field} disabled={!!editingProduct} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>{t('settings.form.labels.name')}</FormLabel><FormControl><Input placeholder="e.g., Olive Oil, 5L Can" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>{t('settings.form.labels.category')}</FormLabel><FormControl><Input placeholder="e.g., Oils" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="unitOfMeasure" render={({ field }) => (<FormItem><FormLabel>{t('settings.form.labels.unitOfMeasure')}</FormLabel><FormControl><Input placeholder="e.g., Can" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="unitCost" render={({ field }) => (<FormItem><FormLabel>{t('settings.form.labels.unitCost')}</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 25.50" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="supplierName" render={({ field }) => (<FormItem><FormLabel>{t('settings.form.labels.supplierName')}</FormLabel><FormControl><Input placeholder="e.g., SYSCO" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="reorderLevel" render={({ field }) => (<FormItem><FormLabel>{t('settings.form.labels.reorderLevel')}</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="reorderQuantity" render={({ field }) => (<FormItem><FormLabel>{t('settings.form.labels.reorderQuantity')}</FormLabel><FormControl><Input type="number" placeholder="e.g., 24" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="storageLocation" render={({ field }) => (<FormItem><FormLabel>{t('settings.form.labels.storageLocation')}</FormLabel><FormControl><Input placeholder="e.g., Dry Storage Shelf 3" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="shelfLifeDays" render={({ field }) => (<FormItem><FormLabel>{t('settings.form.labels.shelfLifeDays')}</FormLabel><FormControl><Input type="number" placeholder="e.g., 365" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="isPerishable" render={({ field }) => (<FormItem className="flex flex-col pt-2"><FormLabel className="mb-2">{t('settings.form.labels.isPerishable')}</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                  </div>
                  <div className="flex items-center gap-4">
                    <Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t('settings.form.save')}</Button>
                    {editingProduct && <Button type="button" variant="outline" onClick={handleCancelEdit}><X className="mr-2 h-4 w-4" />{t('settings.form.cancel')}</Button>}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /><span>{t('settings.list.title')}</span></CardTitle></CardHeader><CardContent>{renderProductList()}</CardContent></Card>
        </div>
      </div>
      <Toaster richColors closeButton />
    </AppLayout>
  );
}