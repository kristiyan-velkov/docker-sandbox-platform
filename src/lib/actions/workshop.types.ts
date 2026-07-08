export type RegisterState = {
  ok: boolean;
  message: string;
  fieldErrors?: Partial<
    Record<"name" | "email" | "company" | "role" | "password" | "confirm_password", string>
  >;
};

export const initialRegisterState: RegisterState = {
  ok: false,
  message: "",
};

export type QuestionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Partial<Record<"email" | "lab_id" | "question", string>>;
};

export const initialQuestionState: QuestionState = {
  ok: false,
  message: "",
};

export type LoginState = {
  ok: boolean;
  message: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
};

export const initialLoginState: LoginState = {
  ok: false,
  message: "",
};

/** @deprecated use LoginState */
export type UnlockState = LoginState;

/** @deprecated use initialLoginState */
export const initialUnlockState = initialLoginState;
