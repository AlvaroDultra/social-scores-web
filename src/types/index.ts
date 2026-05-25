export interface User {
  id: string;
  email: string;
  nickname: string;
  bio: string;
  avatarUrl?: string;
  scoreBalance: number;
}

export interface UserSummary {
  id: string;
  nickname: string;
  email: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Post {
  id: string;
  authorId: string;
  authorNickname: string;
  targetId?: string;
  targetNickname?: string;
  content: string;
  imageUrl?: string;
  votingEndsAt: string;
  closed: boolean;
  finalScore?: number;
  currentScore: number;
  upvotes: number;
  downvotes: number;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  last: boolean;
}

export interface RankingEntry {
  id: string;
  nickname: string;
  avatarUrl?: string;
  score: number;
  scoreReachedAt?: string;
}

export interface UserProfile {
  id: string;
  nickname: string;
  bio: string;
  avatarUrl?: string;
  scoreBalance: number;
  bestOfMonth: number;
  bestOfDay: number;
  createdAt: string;
}

export interface PostPreview {
  id: string;
  contentPreview: string;
  authorNickname: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  delta: number;
  balanceAfter: number;
  origin: "OWN_POST" | "TARGETED_POST";
  recordedAt: string;
  post?: PostPreview;
}

export interface HistorySummary {
  totalGains: number;
  totalLosses: number;
  currentBalance: number;
  recentInteractions: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorNickname: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  postId?: string;
  read: boolean;
  createdAt: string;
}
