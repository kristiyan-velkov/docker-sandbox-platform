export type LabProgressActionState = {
  ok: boolean;
  message: string;
};

export const initialLabProgressState: LabProgressActionState = {
  ok: false,
  message: "",
};
