import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/expenses";

export interface Expense {
    _id: string;
    name: string;
    description: string;
    amount: number;
    paidBy: string;
    participants: { name: string; amount: number }[];
    createdAt: string;
}

export const expenseApi = {
    getAllExpenses: async () => {
        const response = await axios.get(`${API_BASE_URL}/`);
        return response.data;
    },
    createExpense: async (expenseData: any) => {
        const response = await axios.post(`${API_BASE_URL}/`, expenseData);
        return response.data;
    },
    getBalances: async () => {
        const response = await axios.get(`${API_BASE_URL}/balances`);
        return response.data;
    },
};
