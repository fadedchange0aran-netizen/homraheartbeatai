
export interface MessageTemplate {
  title: string;
  content: string;
}

export interface MessageLibrary {
  morning: MessageTemplate[];
  night: MessageTemplate[];
  love: MessageTemplate[];
  midnight: MessageTemplate[];
}

export interface ScheduleConfig {
  morningTime: string; // e.g. "07:30"
  nightTime: string;   // e.g. "22:30"
  randomInterval: number; // minutes, e.g. 30
}

export interface AppConfig {
  pushplusToken: string;
  notionToken: string;
  notionPageId: string;
  notionLink: string;
  vpsIp: string;
  library: MessageLibrary;
  schedule: ScheduleConfig;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  DIARY = 'diary',
  CONFIG = 'config',
  CODE = 'code'
}
