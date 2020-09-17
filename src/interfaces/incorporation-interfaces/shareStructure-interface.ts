export interface ShareClassIF {
  id: number | null;
  type?: string; // Indicates whether class or series
  name: string;
  priority: number;
  hasMaximumShares?: boolean;
  maxNumberOfShares: number | null;
  hasParValue?: boolean;
  parValue?: number | null;
  currency?: string;
  hasRightsOrRestrictions: boolean;
  series?: ShareClassIF[];
}
