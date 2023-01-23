import { createContext, Dispatch, FC, useContext, useReducer, PropsWithChildren } from "react";
import { networthReducer, initialState, NetworthState } from "../reducers/networth";
import { NetworthActions } from "../reducers/networth/actionTypes";

interface NetworthContextValues {
  state: NetworthState;
  dispatch: Dispatch<NetworthActions>;
}

const NetworthContext = createContext<NetworthContextValues>({ state: initialState, dispatch: () => {} });

export const NetworthContextProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [state, dispatch] = useReducer(networthReducer, initialState);
  return <NetworthContext.Provider value={{ state, dispatch }}>{children}</NetworthContext.Provider>;
};

export const useNetworth = () => {
  const context = useContext(NetworthContext);
  if (!context) {
    throw new Error("useNetworthContext must be used within a NetworthContextProvider");
  }
  return context;
};
