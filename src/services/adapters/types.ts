export interface DataSource {
  products(): Promise<unknown>;
  trustBadges(): Promise<unknown>;
  heroFeatures(): Promise<unknown>;
  featureStrip(): Promise<unknown>;
  benefits(): Promise<unknown>;
  articles(limit: number): Promise<unknown>;
  activeOffer(): Promise<unknown>;
  siteConfig(): Promise<unknown>;
  subscribe(email: string): Promise<unknown>;
  categories(): Promise<unknown>;
  collections(): Promise<unknown>;
  ingredients(): Promise<unknown>;
  videos(): Promise<unknown>;
  heroProducts?(): Promise<unknown>;
}
