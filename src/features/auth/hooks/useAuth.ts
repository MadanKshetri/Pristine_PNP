import {
  useAuthControllerGetMeUser,
  useAuthControllerLogin,
  useAuthControllerVerifyUserOtp,
} from "@/fetchers/queriesComponents";
import type {
  GetMeDto,
  LoginUserRequestDto,
  VerrifyOtpDto,
} from "@/fetchers/queriesSchemas";
import {
  useAuthStore,
  type ApiUserRole,
  type User,
  type UserRole,
} from "@/src/lib/store/authStore";

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    setAuth,
    logout: storeLogout,
  } = useAuthStore();

  const staffLoginMutation = useAuthControllerLogin({});
  const managerLoginMutation = useAuthControllerLogin({});

  const verifyUserOtpMutation = useAuthControllerVerifyUserOtp({});
  const verifyManagerOtpMutation = useAuthControllerVerifyUserOtp({});
  const isManager = user?.role === "manager";

  const { isLoading: isLoadingUser, refetch: refetchUser } =
    useAuthControllerGetMeUser(
      {},
      {
        enabled: !isManager && isAuthenticated && !!token,
      }
    );

  const { isLoading: isLoadingManager, refetch: refetchManager } =
    useAuthControllerGetMeUser(
      {},
      {
        enabled: isManager && isAuthenticated && !!token,
      }
    );

  /**
   * Send OTP to user's email
   */
  const sendOtp = async (email: string) => {
    try {
      const payload: LoginUserRequestDto = {
        email,
      };

      const loginMutation = staffLoginMutation;

      const response = await loginMutation.mutateAsync({
        body: payload,
      });

      return { success: true, message: response.message };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || "Failed to send OTP",
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
      const response = await verifyUserOtpMutation.mutateAsync({
        body: payload,
      });

      if (response.data) {
        const apiRole = response.data.user.role as ApiUserRole;
        const mappedRole: UserRole =
          apiRole === "cleaner"
            ? "general"
            : apiRole === "admin"
              ? "manager"
              : apiRole;
        const user: User = {
          id: response.data.user.id,
          email: response.data.user.email,
          oneSignalId: response.data.user.oneSignalId,
          fullName: response.data.user.fullName,
          role: mappedRole,
          apiRole,
        };

        // Save to Zustand store
        setAuth(user, response.data.token);

        // Navigation will be handled by the component
        return { success: true, userId: user.id };
      }

      return { success: false, message: "Invalid OTP" };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || "Failed to verify OTP",
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

  const mapProfileToUser = (profile: GetMeDto): User => {
    const apiRole = profile.role as ApiUserRole;
    const mappedRole: UserRole =
      apiRole === "cleaner"
        ? "general"
        : apiRole === "admin"
          ? "manager"
          : apiRole;
    return {
      id: profile.id,
      email: profile.email,
      oneSignalId: profile.oneSignalId,
      fullName: profile.fullName,
      role: mappedRole,
      apiRole,
      image: profile.image
        ? {
            id: profile.image.id,
            name: profile.image.name,
            url: profile.image.url,
          }
        : null,
    };
  };

  const refreshProfile = async () => {
    try {
      const response = await refetchUser();
      if (response.data?.data) {
        const nextUser = mapProfileToUser(response.data.data);
        if (token) {
          setAuth(nextUser, token);
        }
        return { success: true };
      }
      return { success: false, message: "Failed to load profile" };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message || "Failed to load profile",
      };
    }
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
    refreshProfile,
    logout,
    refetchUser: isManager ? refetchManager : refetchUser,

    // Mutation states
    isSendingOtp:
      staffLoginMutation.isPending || managerLoginMutation.isPending,
    isVerifyingOtp:
      verifyUserOtpMutation.isPending || verifyManagerOtpMutation.isPending,
  };
};
