// context/TokenContext.ts
import { createContext } from "react";

interface TokenContextType {
  token: string;
}

export const TokenContext = createContext<TokenContextType>({ token: "" });
