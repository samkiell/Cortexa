import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('NEXTAUTH_SECRET is not set');
}

if (!process.env.GOOGLE_CLIENT_ID && process.env.NODE_ENV === 'production') {
    throw new Error('GOOGLE_CLIENT_ID is not set');
}

if (!process.env.GOOGLE_CLIENT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('GOOGLE_CLIENT_SECRET is not set');
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter an email and password');
        }

        await dbConnect();

        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error('No user found with that email');
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordCorrect) {
          throw new Error('Incorrect password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatarUrl,
          suspended: user.suspended,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          // Identify admin by email
          const role = user.email.toLowerCase() === 'samkiel.dev@gmail.com' ? 'admin' : 'user';
          await User.create({
            email: user.email,
            name: user.name,
            avatarUrl: user.image,
            role,
          });
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.image = user.image;
        token.suspended = user.suspended;
      }

      // For OAuth we need to fetch the DB user info on first sign in
      if (account?.provider === 'google' && !token.role) {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.suspended = dbUser.suspended;
          token.image = dbUser.avatarUrl;
        }
      }
      // Handle the 'update' trigger from useSession().update()
      if (trigger === "update" && session?.image) {
        token.image = session.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.image = token.image;
        session.user.suspended = token.suspended;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
