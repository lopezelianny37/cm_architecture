declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        aud?: string;
      };
      accessToken?: string;
    }
  }
}

export {};
