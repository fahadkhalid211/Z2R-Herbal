export type PauseReason = "hover" | "focus" | "hidden" | "offscreen" | "user" | "reduced-motion";

export interface SliderState {
  index: number;
  count: number;
  previous: number | null;
  direction: 1 | -1;
  pausedBy: PauseReason[];
}

export type SliderAction =
  | { type: "next" }
  | { type: "prev" }
  | { type: "goto"; index: number }
  | { type: "pause"; reason: PauseReason }
  | { type: "resume"; reason: PauseReason }
  | { type: "toggleUser" };

export function initSlider(count: number): SliderState {
  return { index: 0, count, previous: null, direction: 1, pausedBy: [] };
}

export const isPlaying = (state: SliderState): boolean => state.pausedBy.length === 0;

export const isStopped = (state: SliderState): boolean =>
  state.pausedBy.includes("user") || state.pausedBy.includes("reduced-motion");

const move = (state: SliderState, index: number, direction: 1 | -1): SliderState => ({
  ...state,
  index,
  previous: state.index,
  direction,
});

export function sliderReducer(state: SliderState, action: SliderAction): SliderState {
  switch (action.type) {
    case "next":
      return move(state, (state.index + 1) % state.count, 1);
    case "prev":
      return move(state, (state.index - 1 + state.count) % state.count, -1);
    case "goto":
      if (action.index === state.index) return state;
      return move(state, action.index, action.index > state.index ? 1 : -1);
    case "pause":
      return state.pausedBy.includes(action.reason)
        ? state
        : { ...state, pausedBy: [...state.pausedBy, action.reason] };
    case "resume":
      return { ...state, pausedBy: state.pausedBy.filter((r) => r !== action.reason) };
    case "toggleUser":
      return isStopped(state)
        ? { ...state, pausedBy: state.pausedBy.filter((r) => r !== "user" && r !== "reduced-motion") }
        : sliderReducer(state, { type: "pause", reason: "user" });
  }
}
