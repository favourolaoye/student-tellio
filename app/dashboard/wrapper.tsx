"use client"

import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";
import Cookies from "js-cookie";



export default function Wrapper({ children }: { children: React.ReactNode }) {

    const setUser = useAuthStore((state) => state.setUser)

    useEffect(() => {
        const storedUser = Cookies.get('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log(parsedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Failed to parse user cookie:', error);
            }
        }
    }, [setUser]);


    return <>{children}</>
    
}
