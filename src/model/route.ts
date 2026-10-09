export interface Route {
  id?: number;
  routing_run_id: number;
  rider_id?: number | null;
  distance_km: number;
  job_code_hash?: string | null;
}
