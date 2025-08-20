// services/api/BaseEntityService.js
import { baseService } from './baseService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Base service class for common CRUD operations
 * @param {string} entityName - Name of the entity (e.g., 'maps', 'ghosts')
 * @param {Function} validateCreate - Optional validation function for create operations
 * @param {Function} validateUpdate - Optional validation function for update operations
 * @param {Function} processCreate - Optional processing function before create
 * @param {Function} processUpdate - Optional processing function before update
 */
export class BaseEntityService {
  constructor(entityName, options = {}) {
    this.entityName = entityName;
    this.validateCreate = options.validateCreate || (() => true);
    this.validateUpdate = options.validateUpdate || (() => true);
    this.processCreate = options.processCreate || ((data) => data);
    this.processUpdate = options.processUpdate || ((data) => data);
    this.onDelete = options.onDelete || (() => {});
  }

  async getAll() {
    await delay(100);
    const data = await baseService.loadData();
    return [...data[this.entityName]];
  }

  async getById(id) {
    await delay(50);
    const data = await baseService.loadData();
    return data[this.entityName].find(item => item.id === id);
  }

  async getActive() {
    await delay(50);
    const data = await baseService.loadData();
    return data[this.entityName].filter(item => item.isActive !== false);
  }

  async create(itemData) {
    await delay(100);
    const data = await baseService.loadData();
    
    // Run validation
    const validationResult = await this.validateCreate(itemData, data[this.entityName]);
    if (validationResult !== true) {
      throw new Error(validationResult);
    }
    
    // Process the data
    const processedData = await this.processCreate(itemData, data);
    
    const newItem = {
      ...processedData,
      id: baseService.getNextId(data[this.entityName])
    };
    
    data[this.entityName].push(newItem);
    await baseService.saveData(data);
    return newItem;
  }

  async update(id, itemData) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data[this.entityName].findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`${this.entityName.slice(0, -1)} not found`);
    }

    // Run validation
    const validationResult = await this.validateUpdate(itemData, data[this.entityName], id);
    if (validationResult !== true) {
      throw new Error(validationResult);
    }
    
    // Process the data
    const processedData = await this.processUpdate(itemData, data, id);
    
    data[this.entityName][index] = { ...processedData, id };
    await baseService.saveData(data);
    return data[this.entityName][index];
  }

  async delete(id) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data[this.entityName].findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`${this.entityName.slice(0, -1)} not found`);
    }
    
    const deleted = data[this.entityName].splice(index, 1)[0];
    
    // Run custom delete logic
    await this.onDelete(id, data);
    
    await baseService.saveData(data);
    return deleted;
  }

  async toggleActive(id) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data[this.entityName].findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`${this.entityName.slice(0, -1)} not found`);
    }
    
    data[this.entityName][index].isActive = !data[this.entityName][index].isActive;
    await baseService.saveData(data);
    return data[this.entityName][index];
  }
}

// Validation helpers
export const validateUniqueName = (name, existingItems, excludeId = null) => {
  const duplicate = existingItems.find(item => 
    item.id !== excludeId && 
    item.name.toLowerCase() === name.toLowerCase()
  );
  
  if (duplicate) {
    return `Item with name "${name}" already exists`;
  }
  
  return true;
};