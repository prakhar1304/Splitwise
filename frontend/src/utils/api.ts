import axios from "axios";

export const API_BASE_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api")
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function isNetworkError(err: unknown): boolean {
  const e = err as { message?: string; code?: string };
  return e?.message === "Network Error" || e?.code === "ERR_NETWORK";
}

/** URL for user avatar (backend generates SVG from user id). */
export function getAvatarUrl(userId: string): string {
  return `${API_BASE_URL}/users/${userId}/avatar`;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-logout"));
    }
    return Promise.reject(err);
  }
);

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

export interface SplitDetail {
  userId: string;
  amount: number;
}

export interface Expense {
  _id: string;
  name: string;
  description?: string;
  amount: number;
  paidBy: string;
  participants: string[];
  createdBy?: string;
  paidByUser?: string;
  groupId?: string;
  category?: string;
  splitType?: "equal" | "unequal" | "percentage";
  splitDetails?: SplitDetail[];
  date?: string;
  createdAt?: string;
}

export interface Group {
  _id: string;
  name: string;
  members: User[];
  createdBy: User;
}

export interface Settlement {
  sender: string;
  receiver: string;
  amount: number;
  statement: string;
}

export interface ApiResponse<T = unknown> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export const usersApi = {
  getAllUsers: async () => {
    const res = await api.get<ApiResponse<User[]>>("/users/all-users");
    return res.data;
  },
};

export const authApi = {
  register: async (name: string, email: string, password: string) => {
    const res = await api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      "/users/register",
      { name, email, password }
    );
    return res.data;
  },
  login: async (email: string, password: string) => {
    const res = await api.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      "/users/login",
      { email, password }
    );
    return res.data;
  },
  logout: async () => {
    await api.post("/users/logout");
  },
  getMe: async () => {
    const res = await api.get<ApiResponse<{ user: User }>>("/users/me");
    return res.data;
  },
};

export const expenseApi = {
  getAllExpenses: async () => {
    const res = await api.get<ApiResponse<Expense[]>>("/expenses/");
    return res.data;
  },
  getExpense: async (id: string) => {
    const res = await api.get<ApiResponse<Expense>>(`/expenses/${id}`);
    return res.data;
  },
  createExpense: async (expenseData: {
    name: string;
    amount: number;
    description?: string;
    paidBy: string;
    participants: string[];
  }) => {
    const res = await api.post<ApiResponse<Expense>>("/expenses/", expenseData);
    return res.data;
  },
  updateExpense: async (
    id: string,
    data: {
      name?: string;
      description?: string;
      amount?: number;
      paidBy?: string;
      paidByUser?: string;
      participants?: string[];
      category?: string;
      splitType?: "equal" | "unequal" | "percentage";
      splitDetails?: SplitDetail[];
      participantIds?: string[];
      date?: string;
    }
  ) => {
    const res = await api.put<ApiResponse<Expense>>(`/expenses/${id}`, data);
    return res.data;
  },
  deleteExpense: async (id: string) => {
    const res = await api.delete<ApiResponse<null>>(`/expenses/${id}`);
    return res.data;
  },
  getBalances: async () => {
    const res = await api.get<
      ApiResponse<Settlement[]>
    >("/expenses/balances");
    return res.data;
  },
};

export const groupsApi = {
  createGroup: async (name: string, memberIds?: string[]) => {
    const res = await api.post<ApiResponse<Group>>("/groups", {
      name,
      memberIds: memberIds ?? [],
    });
    return res.data;
  },
  getGroups: async () => {
    const res = await api.get<ApiResponse<Group[]>>("/groups");
    return res.data;
  },
  getGroup: async (id: string) => {
    const res = await api.get<ApiResponse<Group>>(`/groups/${id}`);
    return res.data;
  },
  addMember: async (groupId: string, userId: string) => {
    const res = await api.post<ApiResponse<Group>>(`/groups/${groupId}/members`, {
      userId,
    });
    return res.data;
  },
  getGroupExpenses: async (groupId: string) => {
    const res = await api.get<ApiResponse<Expense[]>>(`/expenses/group/${groupId}`);
    return res.data;
  },
  getGroupBalances: async (groupId: string) => {
    const res = await api.get<ApiResponse<Settlement[]>>(
      `/expenses/balances/group/${groupId}`
    );
    return res.data;
  },
  createGroupExpense: async (data: {
    name: string;
    amount: number;
    description?: string;
    paidBy: string;
    paidByUser: string;
    groupId: string;
    category?: string;
    splitType: "equal" | "unequal" | "percentage";
    participantIds?: string[];
    splitDetails?: SplitDetail[];
    date?: string;
  }) => {
    const res = await api.post<ApiResponse<Expense>>("/expenses", data);
    return res.data;
  },
};
