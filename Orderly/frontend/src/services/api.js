import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tables API
export const getTables = async () => {
  const response = await api.get('/tables');
  return response.data;
};

export const createTable = async (tableCode) => {
  const response = await api.post('/tables', { tableCode });
  return response.data;
};

export const getTableDetails = async (tableId) => {
  const response = await api.get(`/tables/${tableId}/details`);
  return response.data;
};

export const deleteTable = async (tableId) => {
  const response = await api.delete(`/tables/${tableId}`);
  return response.data;
};

// Tickets API
export const openTicket = async (tableId, userId = 1) => {
  const response = await api.post('/tickets/open', { tableId, userId });
  return response.data;
};

export const printTicket = async (ticketId) => {
  const response = await api.post(`/tickets/${ticketId}/print`);
  return response.data;
};

export const cancelTicket = async (ticketId) => {
  const response = await api.post(`/tickets/${ticketId}/cancel`);
  return response.data;
};

export const reopenTicket = async (ticketId) => {
  const response = await api.post(`/tickets/${ticketId}/reopen`);
  return response.data;
};

export const closeTicket = async (ticketId, paymentMethod, discount = 0, serviceCharge = 0, userId = 1) => {
  const response = await api.post(`/tickets/${ticketId}/close`, {
    paymentMethod,
    discount,
    serviceCharge,
    userId,
  });
  return response.data;
};

export const addItemToTicket = async (ticketId, itemId, quantity, unitPrice, options = null, specialInstructions = null) => {
  const payload = {
    itemId,
    quantity,
    unitPrice,
  };
  if (options && options.length > 0) {
    payload.options = options;
  }
  if (specialInstructions) {
    payload.specialInstructions = specialInstructions;
  }
  const response = await api.post(`/tickets/${ticketId}/items`, payload);
  return response.data;
};

export const removeItemFromTicket = async (itemId) => {
  const response = await api.delete(`/tickets/items/${itemId}`);
  return response.data;
};

// Menu API
export const getMenu = async () => {
  const response = await api.get('/menu');
  return response.data;
};

export const getTickets = async (status = 'open', date = null) => {
  const params = { status };
  if (date) {
    params.date = date;
  }
  const response = await api.get('/tickets', { params });
  return response.data;
};

export const getTicketItems = async (ticketId) => {
  const response = await api.get(`/tickets/${ticketId}/items`);
  return response.data;
};

// Menu Management API
export const getCategories = async () => {
  const response = await api.get('/menu/categories');
  return response.data;
};

export const createCategory = async (categoryName, sortOrder = 0) => {
  const response = await api.post('/menu/categories', {
    categoryName,
    sortOrder,
  });
  return response.data;
};

export const updateCategory = async (categoryId, categoryName, sortOrder) => {
  const response = await api.put(`/menu/categories/${categoryId}`, {
    categoryName,
    sortOrder,
  });
  return response.data;
};

export const deleteCategory = async (categoryId) => {
  const response = await api.delete(`/menu/categories/${categoryId}`);
  return response.data;
};

export const createItem = async (categoryId, itemName, price) => {
  const response = await api.post('/menu/items', {
    categoryId,
    itemName,
    price,
  });
  return response.data;
};

export const updateItem = async (itemId, categoryId, itemName, price) => {
  const response = await api.put(`/menu/items/${itemId}`, {
    categoryId,
    itemName,
    price,
  });
  return response.data;
};

export const deleteItem = async (itemId) => {
  const response = await api.delete(`/menu/items/${itemId}`);
  return response.data;
};

// Product Options API
export const getItemOptions = async (itemId) => {
  const response = await api.get(`/menu/items/${itemId}/options`);
  return response.data;
};

export const createItemOption = async (itemId, optionName, optionType, sortOrder = 0, isActive = true) => {
  const response = await api.post(`/menu/items/${itemId}/options`, {
    optionName,
    optionType,
    sortOrder,
    isActive,
  });
  return response.data;
};

export const updateItemOption = async (optionId, optionName, optionType, sortOrder, isActive) => {
  const response = await api.put(`/menu/options/${optionId}`, {
    optionName,
    optionType,
    sortOrder,
    isActive,
  });
  return response.data;
};

export const deleteItemOption = async (optionId) => {
  const response = await api.delete(`/menu/options/${optionId}`);
  return response.data;
};

export const createOptionValue = async (optionId, valueName, priceModifier = 0, sortOrder = 0, isActive = true) => {
  const response = await api.post(`/menu/options/${optionId}/values`, {
    valueName,
    priceModifier,
    sortOrder,
    isActive,
  });
  return response.data;
};

export const updateOptionValue = async (valueId, valueName, priceModifier, sortOrder, isActive) => {
  const response = await api.put(`/menu/option-values/${valueId}`, {
    valueName,
    priceModifier,
    sortOrder,
    isActive,
  });
  return response.data;
};

export const deleteOptionValue = async (valueId) => {
  const response = await api.delete(`/menu/option-values/${valueId}`);
  return response.data;
};

// Ticket Item Options API
export const getTicketItemOptions = async (itemId) => {
  const response = await api.get(`/tickets/items/${itemId}/options`);
  return response.data;
};

export const addTicketItemOption = async (itemId, optionId, optionValueId = null, customText = null, priceModifier = null) => {
  const payload = { optionId };
  if (optionValueId !== null) payload.optionValueId = optionValueId;
  if (customText !== null) payload.customText = customText;
  if (priceModifier !== null) payload.priceModifier = priceModifier;
  const response = await api.post(`/tickets/items/${itemId}/options`, payload);
  return response.data;
};

export const updateTicketItemOption = async (optionId, optionValueId = null, customText = null, priceModifier = null) => {
  const payload = {};
  if (optionValueId !== null) payload.optionValueId = optionValueId;
  if (customText !== null) payload.customText = customText;
  if (priceModifier !== null) payload.priceModifier = priceModifier;
  const response = await api.put(`/tickets/items/options/${optionId}`, payload);
  return response.data;
};

export const deleteTicketItemOption = async (optionId) => {
  const response = await api.delete(`/tickets/items/options/${optionId}`);
  return response.data;
};

// Users API
export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (username, password, role) => {
  const response = await api.post('/users', {
    username,
    password,
    role,
  });
  return response.data;
};

export const updateUser = async (userId, username, password, role) => {
  const response = await api.put(`/users/${userId}`, {
    username,
    password,
    role,
  });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// Reports API
export const getDailyRevenue = async (startDate = null, endDate = null) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get('/reports/daily-revenue', { params });
  return response.data;
};

export const getRevenueGrowth = async (startDate = null, endDate = null) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get('/reports/revenue-growth', { params });
  return response.data;
};

export const getSummary = async (startDate = null, endDate = null) => {
  const params = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await api.get('/reports/summary', { params });
  return response.data;
};

// Auth API
export const login = async (password) => {
  const response = await api.post('/users/login', { password });
  return response.data;
};

// Kitchen API
export const markMealReady = async (ticketId) => {
  const response = await api.post(`/tickets/${ticketId}/meal-ready`);
  return response.data;
};

export default api;

