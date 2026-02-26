import type { Artwork } from './artwork'

// --- Generic API Response ---

export interface ApiResponse<T> {
  success: boolean
  data: T
}

// --- Admin Types ---

export interface Credential {
  id: number
  name: string
  type: string
  sortOrder: number
}

export interface ContentEntry {
  key: string
  value: string
  section: string
}

export interface DailyData {
  date: string
  views: number
  uniqueVisitors: number
}

export interface ArtworkView {
  artworkId: string
  views: number
}

export interface Referrer {
  referrer: string
  views: number
}

export interface DashboardStat {
  label: string
  value: string | number
}

// --- Admin API Responses ---

export type ArtworksApiResponse = ApiResponse<Artwork[]>
export type ArtworkApiResponse = ApiResponse<Artwork>
export type CredentialsApiResponse = ApiResponse<Credential[]>
export type ContentApiResponse = ApiResponse<ContentEntry[]>
export type SubmissionsApiResponse = ApiResponse<import('./submission').Submission[]>

// --- Analytics API Responses ---

export interface AnalyticsOverviewData {
  totalViews: number
  todayViews: number
  weekViews: number
  uniqueVisitors30d: number
}

export type AnalyticsOverviewResponse = ApiResponse<AnalyticsOverviewData>
export type AnalyticsDailyResponse = ApiResponse<DailyData[]>
export type AnalyticsArtworksResponse = ApiResponse<ArtworkView[]>
export type AnalyticsReferrersResponse = ApiResponse<Referrer[]>
