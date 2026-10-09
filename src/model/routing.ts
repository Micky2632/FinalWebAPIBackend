export type RoutingRunStatus = "draft" | "committed" | "superseded";

export interface RoutingRun {
  id?: number;
  status?: RoutingRunStatus;
  planned_departure: string;
}

export interface RouteStop {
  id?: number;
  route_id: number;
  order_id: number;
  stop_sequence: number;
  estimated_arrival_at: string;
}
