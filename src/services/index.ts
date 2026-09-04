

import type { ProjectConfig, Project, BRProduct } from '@/types';
import { SAMPLE_PROJECTS, BR_PRODUCTS } from '@/data';

export const estimateService = {

  calculateEstimate(_config: ProjectConfig) {
    console.log('[estimateService] calculateEstimate called — backend not yet connected');
    return {
      status: 'prototype' as const,
      message: 'Effort estimation engine — planned for future integration',
    };
  },


  getValidatedHours(_config: ProjectConfig) {
    console.log('[estimateService] getValidatedHours — backend not yet connected');
    return null;
  },
};

export const projectService = {

  async save(_project: Project) {
    console.log('[projectService] save — backend not yet connected');
    return { success: true as const, id: 'local-save' };
  },


  async list() {
    console.log('[projectService] list — returning local data');
    return SAMPLE_PROJECTS;
  },


  exportConfig(_config: ProjectConfig) {
    console.log('[projectService] exportConfig — backend not yet connected');
    return JSON.stringify(_config, null, 2);
  },
};

export const productService = {

  async getProducts() {
    console.log('[productService] getProducts — returning local data');
    return BR_PRODUCTS;
  },


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

  createTasks(_config: ProjectConfig) {
    console.log('[jiraService] createTasks — backend not yet connected');
    return { status: 'planned' as const };
  },
};

export const excelService = {

  exportToExcel(_config: ProjectConfig) {
    console.log('[excelService] exportToExcel — backend not yet connected');
    return { status: 'planned' as const };
  },
};
