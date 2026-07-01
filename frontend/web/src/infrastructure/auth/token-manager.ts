class TokenManager {
  private cachedToken: string | null = null;

  isExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Consider expired if within 60 seconds of expiration
      return payload.exp * 1000 < Date.now() + 60000;
    } catch (e) {
      return true;
    }
  }

  getToken(): string | null {
    if (this.cachedToken && !this.isExpired(this.cachedToken)) {
      return this.cachedToken;
    }
    return null;
  }

  setToken(token: string): void {
    this.cachedToken = token;
  }

  clearToken(): void {
    this.cachedToken = null;
  }
}

export const tokenManager = new TokenManager();
