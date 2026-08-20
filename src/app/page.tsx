'use client';

import React from 'react';
import { AppLayout } from '@/components/br/AppLayout';
import { useAppStore } from '@/store';
import { DashboardPage } from '@/pages/DashboardPage';
import { NewEstimatePage } from '@/pages/NewEstimatePage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProductExplorerPage } from '@/pages/ProductExplorerPage';
import { EngineeringActivitiesPage } from '@/pages/EngineeringActivitiesPage';
import { ArchitecturePage } from '@/pages/ArchitecturePage';
import { EstimateSummaryPage } from '@/pages/EstimateSummaryPage';
import { TechnicalParamsPage } from '@/pages/TechnicalParamsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ComplexityPage } from '@/pages/ComplexityPage';

function PageRouter() {
  const { currentPage } = useAppStore();

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
    case 'settings':
      return <SettingsPage />;
    default:
      return <DashboardPage />;
  }
}

export default function Home() {
  return (
    <AppLayout>
      <PageRouter />
    </AppLayout>
  );
}