import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookText, HelpCircle, Lightbulb } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
export function DocumentationPage() {
  const { t } = useTranslation();
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="space-y-12">
          <header className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{t('documentation.title')}</h1>
            <p className="text-lg text-muted-foreground">
              {t('documentation.description')}
            </p>
          </header>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookText className="h-6 w-6" /><span>{t('documentation.guide.title')}</span></CardTitle>
              <CardDescription>{t('documentation.guide.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{t('documentation.guide.loginTitle')}</h3>
                <p>{t('documentation.guide.loginText')}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{t('documentation.guide.scanTitle')}</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><Trans i18nKey="documentation.guide.scanStep1" components={{ strong: <strong /> }} /></li>
                  <li><Trans i18nKey="documentation.guide.scanStep2" components={{ strong: <strong /> }} /></li>
                  <li className="p-3 my-2 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-r-md"><Trans i18nKey="documentation.guide.scanStep2_5" components={{ strong: <strong /> }} /></li>
                  <li><Trans i18nKey="documentation.guide.scanStep3" components={{ strong: <strong /> }} /></li>
                  <li><Trans i18nKey="documentation.guide.scanStep4" components={{ strong: <strong /> }} /></li>
                  <li><Trans i18nKey="documentation.guide.scanStep5" components={{ strong: <strong /> }} /></li>
                  <li><Trans i18nKey="documentation.guide.scanStep5_5" components={{ strong: <strong /> }} /></li>
                  <li><Trans i18nKey="documentation.guide.scanStep6" components={{ strong: <strong /> }} /></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{t('documentation.guide.viewTitle')}</h3>
                <p>{t('documentation.guide.viewText')}</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li><Trans i18nKey="documentation.guide.viewStep1" components={{ strong: <strong /> }} /></li>
                  <li><Trans i18nKey="documentation.guide.viewStep2" components={{ strong: <strong /> }} /></li>
                  <li><Trans i18nKey="documentation.guide.viewStep3" components={{ strong: <strong /> }} /></li>
                  <li><Trans i18nKey="documentation.guide.viewStep4" components={{ strong: <strong /> }} /></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{t('documentation.guide.manageTitle')}</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><Trans i18nKey="documentation.guide.manageStep1" components={{ strong: <strong /> }} /></li>
                  <li><Trans i18nKey="documentation.guide.manageStep2" components={{ strong: <strong /> }} /></li>
                  <li><Trans i18nKey="documentation.guide.manageStep3" components={{ strong: <strong />, code: <code /> }} /></li>
                  <li><Trans i18nKey="documentation.guide.manageStep4" components={{ strong: <strong /> }} /></li>
                </ul>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HelpCircle className="h-6 w-6" /><span>{t('documentation.faq.title')}</span></CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>{t('documentation.faq.q1')}</AccordionTrigger>
                  <AccordionContent>{t('documentation.faq.a1')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>{t('documentation.faq.q2')}</AccordionTrigger>
                  <AccordionContent>{t('documentation.faq.a2')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>{t('documentation.faq.q3')}</AccordionTrigger>
                  <AccordionContent>{t('documentation.faq.a3')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>{t('documentation.faq.q4')}</AccordionTrigger>
                  <AccordionContent>{t('documentation.faq.a4')}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lightbulb className="h-6 w-6" /><span>{t('documentation.bestPractices.title')}</span></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <ul className="list-disc list-inside space-y-2">
                <li><Trans i18nKey="documentation.bestPractices.p1" components={{ strong: <strong />, code: <code /> }} /></li>
                <li><Trans i18nKey="documentation.bestPractices.p2" components={{ strong: <strong /> }} /></li>
                <li><Trans i18nKey="documentation.bestPractices.p3" components={{ strong: <strong /> }} /></li>
                <li><Trans i18nKey="documentation.bestPractices.p4" components={{ strong: <strong /> }} /></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}