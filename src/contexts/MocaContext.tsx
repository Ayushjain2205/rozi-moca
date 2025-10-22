"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AirService, BUILD_ENV } from "@mocanetwork/airkit";

interface MocaContextType {
  airService: AirService | null;
  isInitialized: boolean;
  isLoggedIn: boolean;
  user: any | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const MocaContext = createContext<MocaContextType | undefined>(undefined);

export const useMoca = () => {
  const context = useContext(MocaContext);
  if (context === undefined) {
    throw new Error("useMoca must be used within a MocaProvider");
  }
  return context;
};

interface MocaProviderProps {
  children: ReactNode;
}

export const MocaProvider: React.FC<MocaProviderProps> = ({ children }) => {
  const [airService, setAirService] = useState<AirService | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAirService = async () => {
      try {
        console.log("Initializing Moca AIR Kit...");
        const partnerId = process.env.NEXT_PUBLIC_MOCA_PARTNER_ID || "YOUR_PARTNER_ID";
        console.log("Partner ID:", partnerId);
        
        const service = new AirService({
          partnerId,
        });

        console.log("Calling service.init()...");
        const result = await service.init({
          buildEnv: BUILD_ENV.SANDBOX,
          enableLogging: true,
          skipRehydration: false,
        });

        console.log("Moca AIR Kit initialized successfully:", result);
        setAirService(service);
        setIsInitialized(true);

        // Check if user is already logged in
        if (result && result.isLoggedIn) {
          console.log("User already logged in:", result);
          setIsLoggedIn(true);
          setUser({
            id: result.id,
            address: result.abstractAccountAddress,
            token: result.token,
          });
        }
      } catch (error) {
        console.error("Failed to initialize Moca AIR Kit:", error);
        // Still set initialized to true so the app can continue
        setIsInitialized(true);
      } finally {
        setLoading(false);
      }
    };

    initializeAirService();
  }, []);

  const login = async () => {
    if (!airService) {
      console.error("AIR Service not initialized");
      return;
    }

    setLoading(true);
    try {
      const result = await airService.login();
      setIsLoggedIn(true);
      setUser({
        id: result.id,
        address: result.abstractAccountAddress,
        token: result.token,
      });
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!airService) {
      return;
    }

    try {
      await airService.logout();
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const value: MocaContextType = {
    airService,
    isInitialized,
    isLoggedIn,
    user,
    login,
    logout,
    loading,
  };

  return <MocaContext.Provider value={value}>{children}</MocaContext.Provider>;
};
