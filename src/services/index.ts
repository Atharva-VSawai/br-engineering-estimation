/**
 * Placeholder services for future backend integration.
 * These will be replaced with actual API calls when the backend is implemented.
 */

import type { ProjectConfig, Project, BRProduct } from '@/types';
import { SAMPLE_PROJECTS, BR_PRODUCTS } from '@/data';

export const estimateService = {
  /**
   * Future: Calculate engineering effort based on project configuration.
   * Currently returns a placeholder analysis.
   */
  calculateEstimate(_config: ProjectConfig) {
    console.log('[estimateService] calculateEstimate called — backend not yet connected');
    return {
      status: 'prototype' as const,
      message: 'Effort estimation engine — planned for future integration',
    };
  },

  /**
   * Future: Get validated engineering hours from company database.
   */
  getValidatedHours(_config: ProjectConfig) {
    console.log('[estimateService] getValidatedHours — backend not yet connected');
    return null;
  },
};

export const projectService = {
  /**
   * Future: Save project to backend.
   */
  async save(_project: Project) {
    console.log('[projectService] save — backend not yet connected');
    return { success: true as const, id: 'local-save' };
  },

  /**
   * Future: Load projects from backend.
   */
  async list() {
    console.log('[projectService] list — returning local data');
    return SAMPLE_PROJECTS;
  },

  /**
   * Future: Export project configuration.
   */
  exportConfig(_config: ProjectConfig) {
    console.log('[projectService] exportConfig — backend not yet connected');
    return JSON.stringify(_config, null, 2);
  },
};

export const productService = {
  /**
   * Future: Fetch B&R product catalog from backend.
   */
  async getProducts() {
    console.log('[productService] getProducts — returning local data');
    return BR_PRODUCTS;
  },

  /**
   * Future: Search products.
   */
  search(_query: string) {
    console.log('[productService] search — backend not yet connected');
    return BR_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(_query.toLowerCase()) ||
        p.description.toLowerCase().includes(_query.toLowerCase())
    );
  },
};

export const jiraService = {
  /**
   * Future: Create Jira tasks from engineering estimate.
   */
  createTasks(_config: ProjectConfig) {
    console.log('[jiraService] createTasks — backend not yet connected');
    return { status: 'planned' as const };
  },
};

export const excelService = {
  /**
   * Future: Export estimate to Excel.
   */
  exportToExcel(_config: ProjectConfig) {
    console.log('[excelService] exportToExcel — backend not yet connected');
    return { status: 'planned' as const };
  },
};
