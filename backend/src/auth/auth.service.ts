import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  async signup(signupDto: SignupDto) {
    const { email, password } = signupDto;

    try {
      const { data, error } = await this.db.getClient().auth.signUp({
        email,
        password,
      });

      if (error) {
        throw new BadRequestException(error.message);
      }

      return {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          created_at: data.user?.created_at,
        },
        session: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          token_type: data.session?.token_type,
          expires_in: data.session?.expires_in,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Signup failed');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      const { data, error } = await this.db
        .getClient()
        .auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        throw new UnauthorizedException(error.message);
      }

      return {
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
        session: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          token_type: data.session?.token_type,
          expires_in: data.session?.expires_in,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }

  async refresh(refreshDto: RefreshDto) {
    const { refreshToken } = refreshDto;

    try {
      const { data, error } = await this.db.getClient().auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        throw new UnauthorizedException(error?.message ?? 'Invalid refresh token');
      }

      return {
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          token_type: data.session.token_type,
          expires_in: data.session.expires_in,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Refresh failed');
    }
  }
}
