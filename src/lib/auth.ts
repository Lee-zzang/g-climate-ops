import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

// 데모 사용자 (해커톤용 하드코딩)
const DEMO_USERS = [
  {
    id: 'admin',
    password: 'admin123',
    name: '관리자',
    role: 'admin',
  },
  {
    id: 'operator',
    password: 'op123',
    name: '운영자',
    role: 'operator',
  },
];

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: '아이디', type: 'text' },
        password: { label: '비밀번호', type: 'password' },
      },
      authorize: async (credentials) => {
        const user = DEMO_USERS.find(
          (u) =>
            u.id === credentials?.username &&
            u.password === credentials?.password
        );

        if (user) {
          return {
            id: user.id,
            name: user.name,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24시간
  },
});
