export interface BlogPost {
  slug: string
  title: string
  published: string
  description: string
  image: string
  tags: string[]
  category: string
  draft: boolean
  content: string
}

export interface BlogMeta {
  title: string
  published: string
  description: string
  image: string
  tags: string[]
  category: string
  draft: boolean
}
