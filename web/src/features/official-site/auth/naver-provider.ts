import type { OAuthConfig } from "next-auth/providers";

type NaverProfile = {
  response: {
    id: string;
    nickname: string;
    email?: string;
    profile_image?: string;
  };
};

export function NaverProvider(): OAuthConfig<NaverProfile> {
  return {
    id: "naver",
    name: "Naver",
    type: "oauth",
    authorization: {
      url: "https://nid.naver.com/oauth2.0/authorize",
      params: { response_type: "code" },
    },
    token: "https://nid.naver.com/oauth2.0/token",
    userinfo: {
      url: "https://openapi.naver.com/v1/nid/me",
      async request({
        tokens,
      }: {
        tokens: { access_token?: string | null };
      }) {
        const res = await fetch("https://openapi.naver.com/v1/nid/me", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        return (await res.json()) as NaverProfile;
      },
    },
    clientId: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    profile(profile) {
      const r = profile.response;
      return {
        id: r.id,
        name: r.nickname,
        email: r.email ?? `${r.id}@naver.user`,
        image: r.profile_image,
      };
    },
  };
}
