export type UserRole = "Founder" | "Developer" | "Designer" | "Investor";

export type StartupStage =
  | "Idea"
  | "Validating"
  | "Building"
  | "Launched"
  | "Scaling";

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  emailVerified: boolean;
  onboardingComplete: boolean;
  country?: string;
  role?: UserRole;
  skills?: string[];
  interests?: string[];
  startupStage?: StartupStage;
  followerCount: number;
  followingCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface ProfileDoc {
  uid: string;
  displayName: string;
  photoURL: string | null;
  bio: string;
  socialLinks: {
    website?: string;
    twitter?: string;
    linkedin?: string;
  };
  skills: string[];
  role: UserRole | "";
  experienceYears: number;
  industry: string;
  location: string;
  availability: "Full-time" | "Part-time" | "Weekends" | "Not available";
  lookingFor: string;
  achievements: string[];
  startupProjects: string[];
  createdAt: number;
  updatedAt: number;
}

export interface PostDoc {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  content: string;
  imageURL: string | null;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: number;
  updatedAt: number;
  edited: boolean;
}

export interface CommentDoc {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorPhotoURL: string | null;
  content: string;
  createdAt: number;
}

export interface ConnectionDoc {
  id: string;
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  status: "pending" | "accepted" | "declined";
  message: string;
  createdAt: number;
}

export interface ChatDoc {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string | null>;
  lastMessage: string;
  lastMessageAt: number;
  lastSenderId: string;
  unreadCount: Record<string, number>;
  typing: Record<string, boolean>;
}

export interface MessageDoc {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: number;
  seenBy: string[];
}

export interface BusinessPlanInputs {
  businessName: string;
  problem: string;
  solution: string;
  targetMarket: string;
  revenueModel: string;
  competitors: string;
  pricing: string;
  goals: string;
}

export interface BusinessPlanDoc {
  id: string;
  userId: string;
  inputs: BusinessPlanInputs;
  executiveSummary: string;
  businessPlan: string;
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  canvas: Record<string, string>;
  financialProjection: { year: string; revenue: string; costs: string; profit: string }[];
  marketingSummary: string;
  legalChecklist: string[];
  startupChecklist: string[];
  createdAt: number;
  updatedAt: number;
}

export interface MarketingPlanInputs {
  businessName: string;
  product: string;
  audience: string;
  budget: string;
  goals: string;
}

export interface MarketingPlanDoc {
  id: string;
  userId: string;
  inputs: MarketingPlanInputs;
  contentCalendar: { day: number; theme: string; platform: string; idea: string }[];
  instagramStrategy: string;
  tiktokStrategy: string;
  linkedinStrategy: string;
  emailCampaign: string[];
  launchPlan: string[];
  salesFunnel: { stage: string; action: string }[];
  seoPlan: string[];
  createdAt: number;
  updatedAt: number;
}

export interface NotificationDoc {
  id: string;
  userId: string;
  type: "like" | "comment" | "connection" | "message" | "system";
  message: string;
  link: string;
  read: boolean;
  createdAt: number;
}

export interface BookmarkDoc {
  id: string;
  userId: string;
  postId: string;
  createdAt: number;
}
