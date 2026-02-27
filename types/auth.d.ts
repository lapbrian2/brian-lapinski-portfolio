declare module '#auth-utils' {
  interface User {
    id: string
    name: string
    avatar: string
    provider: 'github' | 'google'
  }
}

export {}
