export interface ScopeProgressResponse {
  /**
   * Sum, across every one of the user's records, of each record's
   * completion fraction (0, 1/3, 2/3, or 1 — see
   * DashboardService.getScopeProgress). Not a percentage: the frontend
   * divides by the user's target scope and rounds/caps for display, the
   * same way it already did with a plain record count.
   */
  completionSum: number;
}
