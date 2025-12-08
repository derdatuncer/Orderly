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

export const addItemToTicket = async (ticketId, itemId, quantity, unitPrice) => {
  const response = await api.post(`/tickets/${ticketId}/items`, {
    itemId,
    quantity,
    unitPrice,
  });
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

export default api;

