'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppLayout } from '@/components/br/AppLayout';
import { useAppStore } from '@/store';
import { DashboardPage } from '@/pages/DashboardPage';
import { NewEstimatePage } from '@/pages/NewEstimatePage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProductExplorerPage } from '@/pages/ProductExplorerPage';
import { EngineeringActivitiesPage } from '@/pages/EngineeringActivitiesPage';
import { EstimateSummaryPage } from '@/pages/EstimateSummaryPage';
import { TechnicalParamsPage } from '@/pages/TechnicalParamsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ComplexityPage } from '@/pages/ComplexityPage';
import { ComparePage } from '@/pages/ComparePage';
import {
  useKeyboardShortcuts,
  KeyboardShortcutsDialog,
} from '@/components/br/KeyboardShortcutsDialog';

function PageRouter() {
  const { currentPage } = useAppStore();

  const page = (() => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'new-estimate':
        return <NewEstimatePage />;
      case 'projects':
        return <ProjectsPage />;
      case 'product-explorer':
        return <ProductExplorerPage />;
      case 'technical-params':
        return <TechnicalParamsPage />;
      case 'engineering-activities':
        return <EngineeringActivitiesPage />;
      case 'complexity':
        return <ComplexityPage />;
      case 'estimate-summary':
        return <EstimateSummaryPage />;
      case 'compare':
        return <ComparePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  })();

  return (
    <motion.div
      key={currentPage}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
    >
      {page}
    </motion.div>
  );
}

export default function Home() {
  const { open, setOpen } = useKeyboardShortcuts();

  return (
    <AppLayout>
      <AnimatePresence mode='wait'>
        <PageRouter />
      </AnimatePresence>
      <KeyboardShortcutsDialog open={open} onOpenChange={setOpen} />
    </AppLayout>
  );
}