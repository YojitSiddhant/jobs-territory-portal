export type AiRequestState<T> = {
  value: T | null;
  error: string | null;
  loading: boolean;
};

export type AiRequestAction<T> =
  | { type: "start" }
  | { type: "success"; value: T }
  | { type: "failure"; message: string }
  | { type: "dismiss" };

export function createAiRequestState<T>(): AiRequestState<T> {
  return { value: null, error: null, loading: false };
}

export function aiRequestReducer<T>(state: AiRequestState<T>, action: AiRequestAction<T>): AiRequestState<T> {
  switch (action.type) {
    case "start":
      return { ...state, error: null, loading: true };
    case "success":
      return { value: action.value, error: null, loading: false };
    case "failure":
      return { ...state, error: action.message, loading: false };
    case "dismiss":
      return { ...state, error: null };
  }
}
