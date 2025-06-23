import React, { createContext, useContext } from "react";
import { useContracts as useContractsHook } from "../hooks/useContracts";

const ContractsContext = createContext<ReturnType<
  typeof useContractsHook
> | null>(null);

export const ContractsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const contracts = useContractsHook();
  return (
    <ContractsContext.Provider value={contracts}>
      {children}
    </ContractsContext.Provider>
  );
};

export const useContracts = () => {
  const ctx = useContext(ContractsContext);
  if (!ctx)
    throw new Error("useContracts must be used within a ContractsProvider");
  return ctx;
};
