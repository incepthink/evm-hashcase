import { Action, ActionKind, State } from "./context-types";
import Cookies from "js-cookie";

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionKind.SET_USER:
      Cookies.set("user", JSON.stringify(action.payload[0]), {
        expires: new Date(new Date().getTime() + 30 * 60 * 1000),
      });
      Cookies.set("jwt", action.payload[1], {
        expires: new Date(new Date().getTime() + 30 * 60 * 1000),
      });
      return {
        ...state,
        user: action.payload[0],
        isUserVerified: true,
      };
    case ActionKind.UNSET_USER:
      Cookies.remove("user");
      Cookies.remove("jwt");
      return {
        ...state,
        user: null,
        isUserVerified: false,
      };
    case ActionKind.INFER_USER:
      const user = Cookies.get("user");
      const jwt = Cookies.get("jwt");
      if (user && jwt) {
        return {
          ...state,
          user: JSON.parse(user),
          isUserVerified: true,
        };
      }
      return { ...state, isUserVerified: false };
    default:
      return state;
  }
};

export default reducer;
