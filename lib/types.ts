export type Visibility = 'public' | 'private';

export type AgentApp = {
  id: string;
  ownerSlug: string;
  name: string;
  slug: string;
  description: string;
  visibility: Visibility;
  repoUrl?: string;
  homepageUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type AgentDoc = {
  id: string;
  appId: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AppWithDocs = AgentApp & { docs: AgentDoc[] };

export type StoreData = {
  apps: AgentApp[];
  docs: AgentDoc[];
};
