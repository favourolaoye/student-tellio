import { create } from "zustand"


interface User {
  _id: string
  name: string
  email: string
}

interface T {
  report: string, 
  category: string,
  _id: string,
}
interface  IAuth {
    user:  User | null;
    id: null | number;
    loading:  boolean;
    token: string | null;
    error:  string | null;
    report: Array<T> |[];
    setUser: (user: User | null ) => void,
    setError: (error: string | null ) => void,
    setLoading: (loading: boolean) => void,
    setToken: (token: string | null) => void,
    setReport: (report: Array<T> | []) => void,
    setId: (id: number| null) => void
}

export const useAuthStore = create<IAuth>((set) => ({
    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
    setLoading: (loading) => set({ loading }),
    setReport: (report) => set({report}),
    setError: (error) => set({error}),
    setId: (id) => set({id}),
    user: null,
    token: null,
    loading: false,
    error: null,
    report: [],
    id: null
}));


