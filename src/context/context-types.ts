import { User } from "hashcase-sdk";

type State = {
  user: User | null;
  isUserVerified: boolean;
};

export enum ActionKind {
  SET_USER = "SET_USER",
  UNSET_USER = "UNSET_USER",
  INFER_USER = "INFER_USER",
}

type Action = {
  type: ActionKind;
  payload: any;
};

export type { State, Action };
