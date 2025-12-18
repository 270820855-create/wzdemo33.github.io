
export type Category = 'ALL' | 'COLLECTION' | 'AI' | 'DESIGN' | 'FRONTEND' | 'MEDIA' | 'TOOLS' | 'GAME';

export type Language = 'zh-CN' | 'en-US' | 'ja-JP';

export interface NavLink {
  id: string;
  title: string;
  url: string;
  color: string;
  icon?: string;
  category: Category;
  isFavorite?: boolean;
}

export enum PetMood {
  IDLE = 'IDLE',
  HAPPY = 'HAPPY',
  SLEEP = 'SLEEP',
  SURPRISED = 'SURPRISED',
  ANGRY = 'ANGRY',
  LOVE = 'LOVE'
}

export interface PetStats {
  hunger: number;   // 0-100 (0 = Starving)
  happiness: number; // 0-100 (0 = Depressed)
  health: number;   // 0-100 (0 = Sick)
  level: number;
  experience: number;
  maxExp: number;
  lastUpdate: number; // For offline decay calculation
}

export type PetSkinId = 'girl-white' | 'girl-pink' | 'cat-orange' | 'goth-bunny';

export interface PetSkin {
  id: PetSkinId;
  name: string;
  avatarColor: string; // CSS color for the preview circle
  description: string;
}

export type GameId = 'snake' | 'tetris3d' | '2048' | 'minesweeper';

export interface BuiltInGame {
  id: GameId;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'pet' | 'achievement';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}
