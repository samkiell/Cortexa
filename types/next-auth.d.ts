import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
      suspended?: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: string;
    suspended?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    suspended?: boolean;
    image?: string | null;
  }
}
