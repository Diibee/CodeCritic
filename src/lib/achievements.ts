export type AchievementKey =
  | 'first_project'
  | 'first_review_given'
  | 'first_review_received'
  | 'profile_complete'
  | 'reviewer_5'
  | 'reviewer_25'
  | 'reviewer_100'
  | 'reviewer_500'
  | 'creator_3'
  | 'creator_10'
  | 'popular_10'
  | 'popular_50'
  | 'popular_100'
  | 'popular_500'
  | 'popular_1000'
  | 'rising_star'
  | 'top_rated'
  | 'gold_standard'
  | 'ai_reviewed'
  | 'early_adopter'
  | 'leaderboard_top3'
  | 'all_tech'
  | 'staff_reviewed'

export interface Achievement {
  key: AchievementKey
  name: string
  description: string
  emoji: string
  category: string
}

export const ACHIEVEMENTS: Achievement[] = [
  // Getting Started
  { key: 'first_project',        name: 'First Project',       description: 'Submit your first project',              emoji: '🚀', category: 'Getting Started' },
  { key: 'first_review_given',   name: 'First Review',        description: 'Leave your first review',                emoji: '✍️', category: 'Getting Started' },
  { key: 'first_review_received',name: 'First Feedback',      description: 'Receive your first review',              emoji: '💬', category: 'Getting Started' },
  { key: 'profile_complete',     name: 'Full Profile',        description: 'Add avatar and bio to your profile',     emoji: '👤', category: 'Getting Started' },

  // Reviewer
  { key: 'reviewer_5',   name: 'Helpful',          description: 'Leave 5 reviews',   emoji: '📝', category: 'Reviewer' },
  { key: 'reviewer_25',  name: 'Dedicated',        description: 'Leave 25 reviews',  emoji: '📋', category: 'Reviewer' },
  { key: 'reviewer_100', name: 'Review Expert',    description: 'Leave 100 reviews', emoji: '🏅', category: 'Reviewer' },
  { key: 'reviewer_500', name: 'Review Legend',    description: 'Leave 500 reviews', emoji: '👑', category: 'Reviewer' },

  // Creator
  { key: 'creator_3',  name: 'Builder',          description: 'Submit 3 projects',  emoji: '🔨', category: 'Creator' },
  { key: 'creator_10', name: 'Prolific Builder', description: 'Submit 10 projects', emoji: '🏗️', category: 'Creator' },

  // Popularity
  { key: 'popular_10',   name: 'Getting Noticed',     description: 'Receive 10 reviews',   emoji: '👀', category: 'Popularity' },
  { key: 'popular_50',   name: 'Community Favorite',  description: 'Receive 50 reviews',   emoji: '⭐', category: 'Popularity' },
  { key: 'popular_100',  name: 'Rising Star',         description: 'Receive 100 reviews',  emoji: '🌟', category: 'Popularity' },
  { key: 'popular_500',  name: 'Superstar',           description: 'Receive 500 reviews',  emoji: '💫', category: 'Popularity' },
  { key: 'popular_1000', name: 'Legend',              description: 'Receive 1000 reviews', emoji: '🔥', category: 'Popularity' },

  // Quality
  { key: 'rising_star',   name: 'Rising Star',    description: '4.0+ avg rating (min 3 reviews)',  emoji: '⭐', category: 'Quality' },
  { key: 'top_rated',     name: 'Top Rated',      description: '4.5+ avg rating (min 10 reviews)', emoji: '🥇', category: 'Quality' },
  { key: 'gold_standard', name: 'Gold Standard',  description: '4.8+ avg rating (min 25 reviews)', emoji: '🏆', category: 'Quality' },

  // AI
  { key: 'ai_reviewed', name: 'AI Insights', description: 'Generate your first AI review', emoji: '🤖', category: 'AI' },

  // Special
  { key: 'early_adopter',    name: 'Early Adopter',   description: 'One of the first to join CodeCritic',            emoji: '🌱', category: 'Special' },
  { key: 'leaderboard_top3', name: 'Top 3',            description: 'Reach top 3 on the leaderboard',                 emoji: '🎖️', category: 'Special' },
  { key: 'all_tech',         name: 'Polyglot',         description: 'Use 5+ different tech stacks across projects',   emoji: '🌐', category: 'Special' },
  { key: 'staff_reviewed',   name: 'Staff Approved',   description: 'Receive a review from a CodeCritic staff member', emoji: '🏅', category: 'Special' },
]

export const ACHIEVEMENT_MAP = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.key, a])
) as Record<AchievementKey, Achievement>

export const CATEGORIES = [
  'Getting Started',
  'Reviewer',
  'Creator',
  'Popularity',
  'Quality',
  'AI',
  'Special',
]
