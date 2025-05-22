"use client"

import { useAuthStore } from "@/store/auth-store";
import { useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {toast} from "sonner"
export default function Wrapper({ children }: { children: React.ReactNode }) {

    const setUser = useAuthStore((state) => state.setUser)
    const setId = useAuthStore((state) => state.setId)
    const user = useAuthStore((state) => state.user);
    const setReport = useAuthStore((state) => state.setReport);
      const Emailid = user?.email;
      const router = useRouter();
      const fetchReports = async () => {
      const response = await axios.get(`https://speakup-api-v2.onrender.com/api/report/${Emailid}`);
      return response.data; 
    };
    
    useEffect(() => { 
      if (!user) {
        router.push("/login");
      }
    }, [router, user]);
    
    const { data, isPending, error } = useQuery({
      queryKey: ['rep'],
      queryFn: fetchReports,
    });
    
      if (isPending) {
        console.log("loading..")
      }
    
      if(error){
        toast.error(error.message);
      }
    useEffect(() => {
      if (data) {
        setReport(data);
      }
    }, [data, setReport]);
    

    useEffect(() => {
        const storedUser = Cookies.get('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                console.log(parsedUser);
                setUser(parsedUser);
                setId(parsedUser._id);
            } catch (error) {
                console.error('Failed to parse user cookie:', error);
            }
        }
    }, [setUser]);


    return <>{children}</>
    
}
