
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

export interface AppConfig {
  pushplusToken: string;
  notionToken: string;
  notionPageId: string;
  notionLink: string;
  vpsIp: string;
  library: MessageLibrary;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  DIARY = 'diary',
  CONFIG = 'config',
  CODE = 'code'
}
