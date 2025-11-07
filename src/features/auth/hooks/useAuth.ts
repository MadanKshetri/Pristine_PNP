import {
  useAuthControllerGetMeCustomer,
  useAuthControllerGetMeUser,
  useAuthControllerManagerLogin,
  useAuthControllerStaffLogin,
  useAuthControllerVerifyManagerOtp,
  useAuthControllerVerifyUserOtp
} from '@/fetchers/queriesComponents';
import type { LoginUserRequestDto, VerrifyOtpDto } from '@/fetchers/queriesSchemas';
import { useAuthStore, type User, type UserRole } from '@/src/lib/store/authStore';

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();

  const staffLoginMutation = useAuthControllerStaffLogin({});
  const managerLoginMutation = useAuthControllerManagerLogin({});

  const verifyUserOtpMutation = useAuthControllerVerifyUserOtp({});
  const verifyManagerOtpMutation = useAuthControllerVerifyManagerOtp({});
  const isManager = user?.role==='manager';

  const {
    isLoading: isLoadingUser,
    refetch: refetchUser,
  } = useAuthControllerGetMeUser(
    {},
    {
      enabled: !isManager &&isAuthenticated && !!token,
    }
  );

  const {
    isLoading: isLoadingManager,
    refetch: refetchManager,
  } = useAuthControllerGetMeCustomer(
    {},
    {
      enabled: isManager && isAuthenticated && !!token,
    }
  );

  /**
   * Send OTP to user's email
   */
  const sendOtp = async (email: string, role: UserRole) => {
    try {
      const payload: LoginUserRequestDto = {
        email,
      };

      const loginMutation = role === 'manager' ? managerLoginMutation : staffLoginMutation;
      
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
  const verifyOtp = async (email: string, otp: string, role: UserRole) => {
    try {
      const payload: VerrifyOtpDto = {
        email,
        otp,
      };

      if(role === 'manager'){
      const response = await verifyManagerOtpMutation.mutateAsync({
        body: payload,
      });

      if (response.data) {
        const user = {
          id: response.data.user.id,
          email: response.data.user.email,
          fullName: response.data.user.fullName,
          customerId: response.data.user.customerId,
          role: role, // Use the role passed from login screen
        };

        // Save to Zustand store
        setAuth(user, response.data.token);

        // Navigation will be handled by the component
        return { success: true };
      }
    }

    if(role === 'general'){
      const response = await verifyUserOtpMutation.mutateAsync({
        body: payload,
      });

      if (response.data) {
        const user: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          fullName: response.data.user.fullName,
          role: role, // Use the role passed from login screen
        };

        // Save to Zustand store
        setAuth(user, response.data.token);

        // Navigation will be handled by the component
        return { success: true };
      }
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
    isLoadingUser: isLoadingUser || isLoadingManager,

    // Actions
    sendOtp,
    verifyOtp,
    logout,
    refetchUser : isManager ? refetchManager : refetchUser,

    // Mutation states
    isSendingOtp: staffLoginMutation.isPending || managerLoginMutation.isPending,
    isVerifyingOtp: verifyUserOtpMutation.isPending || verifyManagerOtpMutation.isPending,
  };
};
