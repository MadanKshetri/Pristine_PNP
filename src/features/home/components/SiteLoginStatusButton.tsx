import {
  useStaffControllerGetSiteLoginStatus,
  useStaffControllerLogInTOSite,
  useStaffControllerLogOutOfSite,
} from "@/fetchers/queriesComponents";
import { QRScannerModal } from "@/src/components/qr/QRScannerModal";
import { useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import { Building2, LogIn, LogOut } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const SiteLoginStatusButton: React.FC = () => {
  const queryClient = useQueryClient();

  // ── Status query ──
  const { data: statusData, isLoading: isLoadingStatus } =
    useStaffControllerGetSiteLoginStatus({});

  const isLoggedIn = statusData?.data?.isLoggedIn ?? false;
  const siteName = statusData?.data?.site?.title ?? null;

  // ── Mutations ──
  const loginMutation = useStaffControllerLogInTOSite();
  const logoutMutation = useStaffControllerLogOutOfSite();

  // ── Local state ──
  const [scannerVisible, setScannerVisible] = useState(false);
  const [pulseAnim] = useState(() => new Animated.Value(1));

  // Subtle pulse animation for the status dot
  React.useEffect(() => {
    if (isLoggedIn) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isLoggedIn]);

  // ── Handlers ──
  const handlePress = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        Alert.alert(
          "Location Required",
          "Location permission is needed to check in/out of a site.",
        );
        return;
      }
      // Verify location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert(
          "Location Services Off",
          "Please enable location services to check in/out of a site.",
        );
        return;
      }

      setScannerVisible(true);
    } catch {
      Alert.alert("Error", "Could not access location services.");
    }
  }, []);

  const handleScanned = useCallback(
    async (token: string) => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        if (isLoggedIn) {
          await logoutMutation.mutateAsync({
            body: { token, ...coords },
          });
          Alert.alert("Checked Out", "You have been checked out of the site.");
        } else {
          await loginMutation.mutateAsync({
            body: { token, ...coords },
          });
          Alert.alert("Checked In", "You have been checked in to the site.");
        }

        // Refresh status
        queryClient.invalidateQueries({
          queryKey: ["staff", "site", "login", "status"],
        });
      } catch (error: any) {
        const msg =
          error?.payload?.message ||
          error?.message ||
          `Failed to ${isLoggedIn ? "check out" : "check in"}`;
        Alert.alert("Error", msg);
      }
    },
    [isLoggedIn, loginMutation, logoutMutation, queryClient],
  );

  // ── Loading state ──
  if (isLoadingStatus) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#64748b" />
      </View>
    );
  }

  const isMutating = loginMutation.isPending || logoutMutation.isPending;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          isLoggedIn ? styles.containerLoggedIn : styles.containerLoggedOut,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
        disabled={isMutating}
      >
        {isMutating ? (
          <ActivityIndicator
            size="small"
            color={isLoggedIn ? "#059669" : "#64748b"}
          />
        ) : (
          <>
            {/* Status dot with pulse */}
            <View style={styles.iconWrap}>
              <Animated.View
                style={[
                  styles.statusDotPulse,
                  isLoggedIn
                    ? styles.statusDotPulseGreen
                    : styles.statusDotPulseRed,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <View
                style={[
                  styles.statusDot,
                  isLoggedIn ? styles.statusDotGreen : styles.statusDotRed,
                ]}
              />
              <Building2
                size={18}
                color={isLoggedIn ? "#059669" : "#94a3b8"}
                strokeWidth={2.2}
              />
            </View>

            {/* Label */}
            <View style={styles.labelWrap}>
              <Text
                style={[
                  styles.labelText,
                  isLoggedIn ? styles.labelTextGreen : styles.labelTextGray,
                ]}
                numberOfLines={1}
              >
                {isLoggedIn ? siteName || "On Site" : "Off Site"}
              </Text>
              <View style={styles.actionRow}>
                {isLoggedIn ? (
                  <LogOut size={10} color="#059669" strokeWidth={2.5} />
                ) : (
                  <LogIn size={10} color="#64748b" strokeWidth={2.5} />
                )}
                <Text
                  style={[
                    styles.actionText,
                    isLoggedIn ? styles.actionTextGreen : styles.actionTextGray,
                  ]}
                >
                  {isLoggedIn ? "Check out" : "Check in"}
                </Text>
              </View>
            </View>
          </>
        )}
      </TouchableOpacity>

      <QRScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanned={handleScanned}
        title={isLoggedIn ? "Scan to Check Out" : "Scan to Check In"}
        subtitle={
          isLoggedIn
            ? "Scan the site QR code to check out"
            : "Scan the site QR code to check in"
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    minWidth: 90,
  },
  containerLoggedIn: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  containerLoggedOut: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
  iconWrap: {
    position: "relative",
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDotPulse: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotPulseGreen: {
    backgroundColor: "rgba(16, 185, 129, 0.3)",
  },
  statusDotPulseRed: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  statusDot: {
    position: "absolute",
    top: -1,
    right: -1,
    width: 6,
    height: 6,
    borderRadius: 3,
    zIndex: 1,
  },
  statusDotGreen: {
    backgroundColor: "#10b981",
  },
  statusDotRed: {
    backgroundColor: "#ef4444",
  },
  labelWrap: {
    flexShrink: 1,
  },
  labelText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  labelTextGreen: {
    color: "#065f46",
  },
  labelTextGray: {
    color: "#334155",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 1,
  },
  actionText: {
    fontSize: 10,
    fontWeight: "600",
  },
  actionTextGreen: {
    color: "#059669",
  },
  actionTextGray: {
    color: "#64748b",
  },
});
