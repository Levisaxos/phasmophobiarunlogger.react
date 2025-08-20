// services/evidenceService.js
import { baseService } from './baseService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const evidenceService = {
  async getEvidence() {
    await delay(100);
    const data = await baseService.loadData();
    return [...data.evidence];
  },

  async getEvidenceById(id) {
    await delay(50);
    const data = await baseService.loadData();
    return data.evidence.find(evidence => evidence.id === id);
  },

  async getActiveEvidence() {
    await delay(50);
    const data = await baseService.loadData();
    return data.evidence.filter(evidence => evidence.isActive);
  },

  async createEvidence(evidenceData) {
    await delay(100);
    const data = await baseService.loadData();
    
    // Check for duplicate names
    const existingEvidence = data.evidence.find(e => 
      e.name.toLowerCase() === evidenceData.name.toLowerCase()
    );
    if (existingEvidence) {
      throw new Error('Evidence with this name already exists');
    }
    
    const newEvidence = {
      ...evidenceData,
      id: baseService.getNextId(data.evidence),
      isActive: evidenceData.isActive !== undefined ? evidenceData.isActive : true,
      sequence: evidenceData.sequence !== undefined ? evidenceData.sequence : data.evidence.length + 1
    };
    
    data.evidence.push(newEvidence);
    await baseService.saveData(data);
    return newEvidence;
  },

  async updateEvidence(id, evidenceData) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.evidence.findIndex(evidence => evidence.id === id);
    
    if (index !== -1) {
      // Check for duplicate names (excluding current evidence)
      const existingEvidence = data.evidence.find(e => 
        e.id !== id && e.name.toLowerCase() === evidenceData.name.toLowerCase()
      );
      if (existingEvidence) {
        throw new Error('Evidence with this name already exists');
      }
      
      data.evidence[index] = { ...evidenceData, id };
      await baseService.saveData(data);
      return data.evidence[index];
    }
    
    throw new Error('Evidence not found');
  },

  async deleteEvidence(id) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.evidence.findIndex(evidence => evidence.id === id);
    
    if (index !== -1) {
      const deleted = data.evidence.splice(index, 1)[0];
      
      // Remove evidence from ghosts
      data.ghosts = data.ghosts.map(ghost => ({
        ...ghost,
        evidenceIds: (ghost.evidenceIds || []).filter(evidenceId => evidenceId !== id)
      }));
      
      // Remove evidence from runs
      data.runs = data.runs.map(run => ({
        ...run,
        evidenceIds: (run.evidenceIds || []).filter(evidenceId => evidenceId !== id)
      }));
      
      await baseService.saveData(data);
      return deleted;
    }
    
    throw new Error('Evidence not found');
  },

  async toggleEvidenceActive(id) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.evidence.findIndex(evidence => evidence.id === id);
    
    if (index !== -1) {
      data.evidence[index].isActive = !data.evidence[index].isActive;
      await baseService.saveData(data);
      return data.evidence[index];
    }
    
    throw new Error('Evidence not found');
  }
};