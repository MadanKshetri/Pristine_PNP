import {
    useAuthControllerGetMe,
    useAuthControllerLogin,
    useAuthControllerVerifyOtp,
} from '@/fetchers/queriesComponents';
import type { LoginUserRequestDto, VerrifyOtpDto } from '@/fetchers/queriesSchemas';
import { useAuthStore, type User, type UserRole } from '@/src/lib/store/authStore';

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();

  // Login mutation (send OTP)
  const loginMutation = useAuthControllerLogin({});

  // Verify OTP mutation
  const verifyOtpMutation = useAuthControllerVerifyOtp({});

  // Get current user query
  const {
    data: userData,
    isLoading: isLoadingUser,
    refetch: refetchUser,
  } = useAuthControllerGetMe(
    {},
    {
      enabled: isAuthenticated && !!token,
    }
  );

  /**
   * Send OTP to user's email
   */
  const sendOtp = async (email: string, role: UserRole) => {
    try {
      const payload: LoginUserRequestDto = {
        email,
        loginFor: role,
      };

      const response = await loginMutation.mutateAsync({
        body: payload,
      });

      return { success: true, message: response.message };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Failed to send OTP',
      };
    }
  };

  /**
   * Verify OTP and login
   */
  const verifyOtp = async (email: string, otp: string) => {
    try {
      const payload: VerrifyOtpDto = {
        email,
        otp,
      };

      const response = await verifyOtpMutation.mutateAsync({
        body: payload,
      });

      if (response.data) {
        // Determine role from email/context (you might need to adjust this based on your API)
        const userRole: UserRole = 'general'; // Default, should come from API

        const user: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          fullName: response.data.user.fullName,
          role: userRole,
        };

        // Save to Zustand store
        setAuth(user, response.data.token);

        // Navigation will be handled by the component
        return { success: true };
      }

      return { success: false, message: 'Invalid OTP' };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || 'Failed to verify OTP',
      };
    }
  };

  /**
   * Logout user
   */
  const logout = () => {
    storeLogout();
    // Navigation will be handled by the component
  };

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoadingUser,

    // Actions
    sendOtp,
    verifyOtp,
    logout,
    refetchUser,

    // Mutation states
    isSendingOtp: loginMutation.isPending,
    isVerifyingOtp: verifyOtpMutation.isPending,
  };
};
