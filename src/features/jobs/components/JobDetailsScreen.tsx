import { QRScannerModal } from "@/src/components/qr/QRScannerModal";
import { Button, Card, Input } from "@/src/components/ui";
import {
  AlertButton,
  AppAlertDialog,
} from "@/src/components/ui/AppAlertDialog";
import { useModal } from "@/src/context/modal-context";
import { useAuthStore } from "@/src/lib/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import * as ExpoLocation from "expo-location";
import { useRouter } from "expo-router";
import type React from "react";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useJobActions, useJobDetailsByRole } from "../hooks";
import { ChecklistItem } from "./ChecklistItem";
import { styles } from "./jobDetailScreenStyle";

interface JobDetailsScreenProps {
  jobId: string;
}

export const JobDetailsScreen: React.FC<JobDetailsScreenProps> = ({
  jobId,
}) => {
  const router = useRouter();

  const { open } = useModal();

  const user = useAuthStore((state) => state.user);
  const isManager =
    user?.role === "manager" || user?.role === "customer manager";
  const isCleaner = user?.role === "cleaner";

  const { job, isLoading, error, refetch } = useJobDetailsByRole(jobId);
  const { startJob, updateJobStatus, isStartingJob, isUpdatingJobStatus } =
    useJobActions();
  // const isLoadingQrToken = false;
  // const [showQRModal, setShowQRModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    title: "",
    description: "",
    action: "" as "Completed" | "Cancelled",
    onConfirm: async () => {},
  });

  const handleStartJob = async () => {
    Alert.alert(
      "Start Job",
      "We will request your location, then open the QR scanner to proceed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async () => {
            const { status } =
              await ExpoLocation.requestForegroundPermissionsAsync();
            if (status !== ExpoLocation.PermissionStatus.GRANTED) {
              Alert.alert(
                "Permission Required",
                "Location permission is needed to start a job.",
              );
              return;
            }
            setShowScanner(true);
          },
        },
      ],
    );
  };

  const handleScanned = async (data: string) => {
    try {
      setShowScanner(false);
      console.log(data);
      const result = await startJob(jobId, data);
      if (result.success) {
        Alert.alert("Success", "Job started successfully!");
        // setShowScanner(false);
        refetch();
      }
    } catch (error) {
      console.error("Error starting job:", error);
    }
  };

  const handleJobStatusChange = (status: "Completed" | "Cancelled", reason?: string) => {
    const action = status === "Completed" ? "Complete" : "Cancel";
    const actionLower = action.toLowerCase();

    setDialogConfig({
      isOpen: true,
      title: `${action} Job`,
      description: `Are you sure you want to ${actionLower} this job?`,
      action: status,
      onConfirm: async () => {
        const result = await updateJobStatus(jobId, status);
        if (result.success) {
          refetch();
          if (status === "Cancelled") {
            router.back();
          }
        }
      },
    });
  };

  const openManagerActionModal = (action: "Completed" | "Cancelled") => {
    open({
      key: "manager-job-update",
      data: {
        jobId,
        status: action,
        onSuccess: () => {
          refetch();
          if (action === "Cancelled") {
            router.back();
          }
        },
      },
    });
  };

  const getJobStatusBadge = (): { label: string; color: string } => {
    if (!job) return { label: "Unknown", color: "gray" };

    const today = new Date();
    const startDate = new Date(job.startAt!);
    const isDue = startDate < today;

    switch (job.status) {
      case "Completed":
        return { label: "Completed", color: "green" };
      case "Scheduled":
        return {
          label: isDue ? "Due" : "Scheduled",
          color: isDue ? "red" : "blue",
        };
      case "In Progress":
        return { label: "In Progress", color: "yellow" };
      default:
        return { label: "Not Started", color: "blue" };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingInner}>
          <View style={styles.loadingSpinnerWrap}>
            <ActivityIndicator size="large" color="#0D9488" />
          </View>
          <Text style={styles.loadingTitle}>Loading job details</Text>
          <Text style={styles.loadingSubtitle}>Please wait...</Text>
        </View>
      </View>
    );
  }

  if (error || !job) {
    const errorMessage = error
      ? (error as any)?.payload || "Failed to load job details."
      : "Job not found. It may have been deleted or you may not have access.";

    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconWrap}>
          <Ionicons name="alert-circle-outline" size={56} color="#DC2626" />
        </View>
        <Text style={styles.errorTitle}>
          {error ? "Error Loading Job" : "Job Not Found"}
        </Text>
        <Text style={styles.errorMessage}>{errorMessage}</Text>
        <View style={styles.errorActions}>
          <Button onPress={() => router.back()} variant="outline">
            <View style={styles.rowCenterPX2}>
              <Ionicons name="arrow-back" size={18} color="#64748B" />
              <Text style={styles.btnOutlineText}>Go Back</Text>
            </View>
          </Button>
          {error && (
            <Button onPress={() => refetch()} variant="primary">
              <View style={styles.rowCenterPX2}>
                <Ionicons name="refresh" size={18} color="#FFFFFF" />
                <Text style={styles.btnPrimaryText}>Retry</Text>
              </View>
            </Button>
          )}
        </View>
      </View>
    );
  }

  const statusBadge = getJobStatusBadge();
  const canStart = job.status === "Scheduled" && isCleaner;
  const canComplete = job.status === "In Progress" && isCleaner;
  const isJobActive = job.status !== "Completed" && job.status !== "Cancelled";
  
  const completionPercentage =
    job.checklists.length > 0
      ? (job.checklists.filter((c) => c.status === "Completed").length /
          job.checklists.length) *
        100
      : 0;

  // Generate QR code URL for job start

  const handleOpenMaps = () => {
    if (!job.site?.address) return;

    const { latitude, longitude, address } = job.site.address;
    let url = "";

    if (latitude && longitude) {
      url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        address,
      )}`;
    }

    Linking.openURL(url).catch((err) =>
      console.error("An error occurred", err),
    );
  };

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Gradient Background */}
          {/* ... (header content remains same) ... */}
          <View style={styles.headerWrap}>
            {/* ... existing header code ... */}
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color="#000000" />
              </TouchableOpacity>

              {/* QR Code Button for Managers */}
              {/* {isManager && ( */}
              {/*   <TouchableOpacity */}
              {/*     onPress={() => setShowQRModal(true)} */}
              {/*     style={[{ height: 40 }, styles.qrBtn]} */}
              {/*     activeOpacity={0.8} */}
              {/*   > */}
              {/*     <Ionicons name="qr-code" size={20} color="#0D9488" /> */}
              {/*     <Text style={styles.qrBtnText}>QR Code</Text> */}
              {/*   </TouchableOpacity> */}
              {/* )} */}
            </View>

            <View style={styles.headerTitleRow}>
              <View style={styles.headerTitleCol}>
                <Text style={styles.headerTitle}>{job.title}</Text>
                <View style={styles.jobNumberPill}>
                  <Ionicons name="document-text" size={14} color="#000000" />
                  <Text style={styles.jobNumberText}>#{job.jobNumber}</Text>
                </View>
                {isManager && (
                  <View
                    style={[
                      styles.statusBadge,
                      { alignSelf: "flex-start", marginTop: 10 },
                      statusBadge.color === "green"
                        ? { backgroundColor: "#10B981" }
                        : statusBadge.color === "blue"
                          ? { backgroundColor: "#06B6D4" }
                          : { backgroundColor: "#F59E0B" },
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>
                      {statusBadge.label}
                    </Text>
                  </View>
                )}
              </View>
              {!isManager && (
                <View
                  style={[
                    styles.statusBadge,
                    statusBadge.color === "green"
                      ? { backgroundColor: "#10B981" }
                      : statusBadge.color === "blue"
                        ? { backgroundColor: "#06B6D4" }
                        : { backgroundColor: "#F59E0B" },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>
                    {statusBadge.label}
                  </Text>
                </View>
              )}
            </View>

            {job.description && (
              <Text style={styles.description}>{job.description}</Text>
            )}
          </View>

          {/* Content Section */}
          <View style={styles.contentWrap}>
            {/* Progress Card */}
            {job.checklists.length > 0 && (
              <Card style={styles.cardBase}>
                <View style={styles.cardBody}>
                  <View style={styles.rowBetween}>
                    <View style={styles.rowCenterFlex1}>
                      <View style={styles.progressIconWrap}>
                        <Ionicons
                          name="stats-chart"
                          size={24}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={styles.progressTextWrap}>
                        <Text style={styles.progressTitle}>
                          Overall Progress
                        </Text>
                        <Text style={styles.progressSubtitle}>
                          {
                            job.checklists.filter(
                              (c) => c.status === "Completed",
                            ).length
                          }{" "}
                          of {job.checklists.length} tasks completed
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.progressPercent}>
                      {Math.round(completionPercentage)}%
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${completionPercentage}%`,
                          backgroundColor:
                            completionPercentage === 100
                              ? "#10B981"
                              : "#14B8A6",
                        },
                      ]}
                    />
                  </View>
                </View>
              </Card>
            )}

            {/* Site & Timeline (Combined) */}
            {(job.site || job.createdAt) && (
              <Card style={styles.cardBase}>
                <View style={styles.cardBody}>
                  <View style={styles.rowCenterMB4}>
                    <View style={styles.siteIconWrap}>
                      <Ionicons name="location" size={24} color="#1D4ED8" />
                    </View>
                    <Text style={styles.cardTitle}>Site & Timeline</Text>
                  </View>

                  {job.site && (
                    <View style={styles.infoBox}>
                      <Text style={styles.infoBoxTitle}>{job.site.title}</Text>
                      <View style={styles.rowCenter}>
                        <Ionicons name="business" size={16} color="#64748B" />
                        <Text style={styles.infoBoxSubtitle}>
                          {job.site.address.address}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={handleOpenMaps}
                        style={{
                          marginTop: 12,
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#EFF6FF",
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 8,
                          alignSelf: "flex-start",
                        }}
                      >
                        <Ionicons name="map" size={16} color="#2563EB" />
                        <Text
                          style={{
                            marginLeft: 6,
                            color: "#2563EB",
                            fontWeight: "600",
                            fontSize: 13,
                          }}
                        >
                          Open in Maps
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={{ marginTop: 12 }}>
                    <View style={styles.metaRow}>
                      <View style={styles.chip}>
                        <Ionicons name="add-circle" size={14} color="#1D4ED8" />
                        <Text style={styles.chipText}>
                          Created:{" "}
                          {format(new Date(job.createdAt), "MMM dd, yyyy")}
                        </Text>
                      </View>

                      {job.startAt && (
                        <View style={styles.chipSuccess}>
                          <Ionicons
                            name="play-circle"
                            size={14}
                            color="#047857"
                          />
                          <Text style={styles.chipTextSuccess}>
                            Start At:{" "}
                            {format(new Date(job.startAt), "MMM dd, yyyy")}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Assigned Staff */}
                  <Pressable
                    style={styles.assignedStaffRow}
                    onPress={() => {
                      open({
                        key: "select-cleaner",
                        data: {
                          siteId: job.site?.id ?? "",
                          jobId: job.id,
                        },
                      });
                    }}
                    disabled={!isManager}
                  >
                    <View style={styles.assignedStaffIconWrap}>
                      <Ionicons
                        name={job.assignedStaff ? "person" : "person-outline"}
                        size={20}
                        color={job.assignedStaff ? "#0D9488" : "#94A3B8"}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.assignedStaffLabel}>
                        Assigned Staff
                      </Text>
                      <Text
                        style={[
                          styles.assignedStaffName,
                          !job.assignedStaff && styles.assignedStaffUnassigned,
                        ]}
                      >
                        {job.assignedStaff
                          ? job.assignedStaff.name
                          : "No staff assigned"}
                      </Text>
                    </View>
                  </Pressable>
                </View>
              </Card>
            )}

            {/* Start Job Button */}
            {canStart && (
              <View style={styles.startWrap}>
                <TouchableOpacity
                  onPress={handleStartJob}
                  disabled={isStartingJob}
                  style={styles.startBtn}
                  activeOpacity={0.9}
                >
                  <View style={styles.rowCenterJustifyCenter}>
                    {isStartingJob ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <View style={styles.startIconWrap}>
                          <Ionicons
                            name="play-circle"
                            size={28}
                            color="white"
                          />
                        </View>
                        <Text style={styles.startText}>Start Job</Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Complete Job Button */}
            {canComplete && (
              <View style={{ marginTop: 8, marginBottom: 8 }}>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => handleJobStatusChange("Cancelled")}
                    disabled={isUpdatingJobStatus}
                    style={[
                      styles.startBtn,
                      { flex: 1, backgroundColor: "#EF4444", padding: 12 },
                    ]}
                    activeOpacity={0.9}
                  >
                    <View style={styles.rowCenterJustifyCenter}>
                      {isUpdatingJobStatus ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <View
                            style={[
                              styles.startIconWrap,
                              { width: 32, height: 32 },
                            ]}
                          >
                            <Ionicons
                              name="close-circle"
                              size={20}
                              color="white"
                            />
                          </View>
                          <Text
                            style={[
                              styles.startText,
                              { fontSize: 16, marginLeft: 8 },
                            ]}
                          >
                            Cancel
                          </Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleJobStatusChange("Completed")}
                    disabled={isUpdatingJobStatus}
                    style={[
                      styles.startBtn,
                      { flex: 1, backgroundColor: "#10B981", padding: 12 },
                    ]}
                    activeOpacity={0.9}
                  >
                    <View style={styles.rowCenterJustifyCenter}>
                      {isUpdatingJobStatus ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <View
                            style={[
                              styles.startIconWrap,
                              { width: 32, height: 32 },
                            ]}
                          >
                            <Ionicons
                              name="checkmark-done-circle"
                              size={20}
                              color="white"
                            />
                          </View>
                          <Text
                            style={[
                              styles.startText,
                              { fontSize: 16, marginLeft: 8 },
                            ]}
                          >
                            Complete
                          </Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {/* Manager Actions */}
            {isManager && isJobActive && (
               <View style={{ marginTop: 8, marginBottom: 8 }}>
                 <View style={{ flexDirection: "row", gap: 12 }}>
                   <TouchableOpacity
                     onPress={() => openManagerActionModal("Cancelled")}
                     disabled={isUpdatingJobStatus}
                     style={[
                       styles.startBtn,
                       { flex: 1, backgroundColor: "#EF4444", padding: 12 },
                     ]}
                     activeOpacity={0.9}
                   >
                     <View style={styles.rowCenterJustifyCenter}>
                       {isUpdatingJobStatus ? (
                         <ActivityIndicator size="small" color="#FFFFFF" />
                       ) : (
                         <>
                           <View
                             style={[
                               styles.startIconWrap,
                               { width: 32, height: 32 },
                             ]}
                           >
                             <Ionicons
                               name="close-circle"
                               size={20}
                               color="white"
                             />
                           </View>
                           <Text
                             style={[
                               styles.startText,
                               { fontSize: 16, marginLeft: 8 },
                             ]}
                           >
                             Cancel Job
                           </Text>
                         </>
                       )}
                     </View>
                   </TouchableOpacity>

                   <TouchableOpacity
                     onPress={() => openManagerActionModal("Completed")}
                     disabled={isUpdatingJobStatus}
                     style={[
                       styles.startBtn,
                       { flex: 1, backgroundColor: "#10B981", padding: 12 },
                     ]}
                     activeOpacity={0.9}
                   >
                     <View style={styles.rowCenterJustifyCenter}>
                       {isUpdatingJobStatus ? (
                         <ActivityIndicator size="small" color="#FFFFFF" />
                       ) : (
                         <>
                           <View
                             style={[
                               styles.startIconWrap,
                               { width: 32, height: 32 },
                             ]}
                           >
                             <Ionicons
                               name="checkmark-done-circle"
                               size={20}
                               color="white"
                             />
                           </View>
                           <Text
                             style={[
                               styles.startText,
                               { fontSize: 16, marginLeft: 8 },
                             ]}
                           >
                             Complete Job
                           </Text>
                         </>
                       )}
                     </View>
                   </TouchableOpacity>
                 </View>
               </View>
             )}

            {/* Checklists Section */}
            <View style={styles.mb2}>
              <View style={styles.rowCenterMB5}>
                <View style={styles.siteIconWrap}>
                  <Ionicons name="checkmark-circle" size={24} color="#0D9488" />
                </View>
                <Text style={styles.sectionTitle}>Checklist Items</Text>
              </View>

              <View style={styles.vGap3}>
                {job.checklists.map((checklist, index) => (
                  <View key={checklist.id}>
                    <ChecklistItem
                      checklist={checklist}
                      index={index}
                      jobStatus={job.status}
                      onUpdate={refetch}
                      isReadOnly={isManager}
                    />
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* QR Code Modal */}
      {/* <QrCodeModal */}
      {/*   showQRModal={showQRModal} */}
      {/*   setShowQRModal={setShowQRModal} */}
      {/*   job={job} */}
      {/*   statusBadge={statusBadge} */}
      {/*   isLoadingQrToken={isLoadingQrToken} */}
      {/* /> */}

      <QRScannerModal
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScanned={handleScanned}
      />

      <AppAlertDialog
        isOpen={dialogConfig.isOpen}
        onClose={() => setDialogConfig((prev) => ({ ...prev, isOpen: false }))}
        title={dialogConfig.title}
        description={dialogConfig.description}
        renderFooter={(onClose) => (
          <View className="flex flex-row items-baseline justify-between gap-2 ">
            <AlertButton
              variant={
                dialogConfig.action === "Cancelled" ? "danger" : "primary"
              }
              className="flex-1"
              onPress={() => {
                dialogConfig.onConfirm();
                onClose();
              }}
              autoClose={true}
            >
              Yes
            </AlertButton>
            <AlertButton
              variant="ghost"
              className="flex-1 border-none bg-gray-200"
              onPress={onClose}
            >
              No
            </AlertButton>
          </View>
        )}
      />
    </>
  );
};
