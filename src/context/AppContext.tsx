"use client";
import { createContext, useState, useReducer, useEffect } from "react";

import { State, Action, ActionKind } from "./context-types";

import reducer from "./reducer";

type AppContextType = {
  state: State;
  dispatch: React.Dispatch<Action>;
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AppContext = createContext<AppContextType>({
  state: { user: null, isUserVerified: false },
  dispatch: () => {},
  openModal: false,
  setOpenModal: () => {},
});

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [openModal, setOpenModal] = useState<boolean>(true);
  const [state, dispatch] = useReducer(reducer, {
    user: null,
    isUserVerified: false,
  });

  useEffect(() => {
    dispatch({ type: ActionKind.INFER_USER, payload: null });
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        openModal,
        setOpenModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
