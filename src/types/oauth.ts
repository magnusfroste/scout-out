
export interface OAuth2Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface EmailAuthSettings {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  redirectUri: string;
}
