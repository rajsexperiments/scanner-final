import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { QrCode, Loader2, Info } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { useTranslation } from 'react-i18next';
export function LoginPage() {
  const { t } = useTranslation();
  const loginSchema = z.object({
    email: z.string().email({ message: t('login.validation.email') }),
    password: z.string().min(1, { message: t('login.validation.password') }),
  });
  type LoginFormValues = z.infer<typeof loginSchema>;
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  const onSubmit = async (data: LoginFormValues) => {
    const success = await login(data);
    if (success) {
      navigate('/');
    } else {
      form.setError("root", { type: "manual", message: t('login.error') });
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <QrCode className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-bold">StockLens</h1>
      </div>
      <Card className="w-full max-w-sm animate-fade-in">
        <CardHeader>
          <CardTitle>{t('login.title')}</CardTitle>
          <CardDescription>{t('login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {form.formState.errors.root && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                  {form.formState.errors.root.message}
                </div>
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('login.emailLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('login.emailPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('login.passwordLabel')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder={t('login.passwordPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {form.formState.isSubmitting ? t('login.submittingButton') : t('login.submitButton')}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground bg-muted p-4 rounded-b-lg">
          <Info className="h-4 w-4 mr-2 flex-shrink-0" />
          <p>
            <strong>{t('login.hintTitle')}</strong> {t('login.hintText')}
          </p>
        </CardFooter>
      </Card>
      <footer className="absolute bottom-4 text-center text-muted-foreground/80 text-sm">
        <p>Built with ❤️ at Cloudflare</p>
      </footer>
      <Toaster richColors closeButton />
    </div>
  );
}