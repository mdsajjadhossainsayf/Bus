
export interface BusDetail {
  name: string;
  startPoint: string;
  endPoint: string;
}

export interface RouteSuggestion {
  from: string;
  to: string;
  suggestedBuses: BusDetail[];
  distance: string;
  estimatedFare: string;
  travelTime: string;
  tips: string;
  timestamp?: number;
}
