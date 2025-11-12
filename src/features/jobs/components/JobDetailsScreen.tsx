import { QRScannerModal } from "@/src/components/qr/QRScannerModal";
import { Button, Card } from "@/src/components/ui";
import { useAuthStore } from "@/src/lib/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import * as FileSystem from "expo-file-system/legacy";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import type React from "react";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useJobActions, useJobDetails } from "../hooks";
import { ChecklistItem } from "./ChecklistItem";
import { styles } from "./jobDetailScreenStyle";

interface JobDetailsScreenProps {
  jobId: string;
}

export const JobDetailsScreen: React.FC<JobDetailsScreenProps> = ({
  jobId,
}) => {
  const router = useRouter();
  const { job, isLoading, error, refetch } = useJobDetails(jobId);
  const { startJob, isStartingJob } = useJobActions();
  const user = useAuthStore((state) => state.user);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const qrRef = useRef<any>(null);

  const isManager = user?.role === "manager";
  const isGeneralUser = user?.role === "general";

  const handleStartJob = async () => {
    Alert.alert(
      "Start Job",
      "We will request your location, then open the QR scanner to proceed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          onPress: async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== Location.PermissionStatus.GRANTED) {
              Alert.alert(
                "Permission Required",
                "Location permission is needed to start a job."
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
      if (data.startsWith("http://") || data.startsWith("https://")) {
        await fetch(data, { method: "GET" });
      } else if (data.startsWith("pristine-pnp://")) {
        await startJob(jobId);
      } else {
        // Fallback: try to start job if QR contains matching job id
        if (data.includes(`/job/${jobId}`) && data.includes("start")) {
          await startJob(jobId);
        } else {
          Alert.alert("Unrecognized QR", "The scanned QR is not supported.");
        }
      }
      await refetch();
      Alert.alert("Success", "Job action completed.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to process QR");
    }
  };

  const getJobStatusBadge = (): { label: string; color: string } => {
    if (!job) return { label: "Unknown", color: "gray" };

    const hasStarted = job.startAt !== null;
    const allCompleted = job.checklists.every((c) => c.status === "Completed");
    const hasInProgress = job.checklists.some((c) => c.status === "Ongoing");

    if (allCompleted) {
      return { label: "Completed", color: "green" };
    } else if (hasInProgress || hasStarted) {
      return { label: "In Progress", color: "blue" };
    } else {
      return { label: "Not Started", color: "yellow" };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingInner}>
          <View style={styles.loadingSpinnerWrap}>
            <ActivityIndicator size="large" color="#0D9488" />
          </View>
          <Text style={styles.loadingTitle}>
            Loading job details
          </Text>
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
        <Text style={styles.errorMessage}>
          {errorMessage}
        </Text>
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
  const canStart = job.status === "scheduled" && isGeneralUser;
  const completionPercentage =
    job.checklists.length > 0
      ? (job.checklists.filter((c) => c.status === "Completed").length /
          job.checklists.length) *
        100
      : 0;

  // Generate QR code URL for job start
  const jobStartUrl = `pristine-pnp://job/${jobId}/start`;

  return (
    <>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
          {/* Header with Gradient Background */}
          <View style={styles.headerWrap}>
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
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>

              {/* QR Code Button for Managers */}
              {isManager && (
                <TouchableOpacity
                  onPress={() => setShowQRModal(true)}
                  style={[{ height: 40 }, styles.qrBtn]}
                  activeOpacity={0.8}
                >
                  <Ionicons name="qr-code" size={20} color="#0D9488" />
                  <Text style={styles.qrBtnText}>
                    QR Code
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.headerTitleRow}>
              <View style={styles.headerTitleCol}>
                <Text style={styles.headerTitle}>
                  {job.title}
                </Text>
                <View style={styles.jobNumberPill}>
                  <Ionicons name="document-text" size={14} color="#000000" />
                  <Text style={styles.jobNumberText}>
                    #{job.jobNumber}
                  </Text>
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
                    <Text style={styles.statusBadgeText}>{statusBadge.label}</Text>
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
                  <Text style={styles.statusBadgeText}>{statusBadge.label}</Text>
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
                            completionPercentage === 100 ? "#10B981" : "#14B8A6",
                        },
                      ]}
                    />
                  </View>
                </View>
              </Card>
            )}

            {/* Site Information */}
            {job.site && (
              <Card style={styles.cardBase}>
                <View style={styles.cardBody}>
                  <View style={styles.rowCenterMB4}>
                    <View style={styles.siteIconWrap}>
                      <Ionicons name="location" size={24} color="#0D9488" />
                    </View>
                    <Text style={styles.cardTitle}>
                      Site Location
                    </Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxTitle}>
                      {job.site.address}
                    </Text>
                    <View style={styles.rowCenter}>
                      <Ionicons name="business" size={16} color="#64748B" />
                      <Text style={styles.infoBoxSubtitle}>
                        {job.site.city}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            )}

            {/* Job Timeline */}
            <Card style={styles.cardBase}>
              <View style={styles.cardBody}>
                <View style={styles.rowCenterMB5}>
                  <View style={styles.siteIconWrap}>
                    <Ionicons name="time" size={24} color="#0D9488" />
                  </View>
                  <Text style={styles.cardTitle}>
                    Timeline
                  </Text>
                </View>
                <View style={styles.vGap3}>
                  <View style={styles.infoBox}>
                    <View style={styles.rowBetweenMB2}>
                      <View style={styles.rowCenterFlex1}>
                        <View style={styles.timelineIconSmall}>
                          <Ionicons
                            name="add-circle"
                            size={20}
                            color="#0D9488"
                          />
                        </View>
                        <Text style={styles.timelineLabel}>
                          Created
                        </Text>
                      </View>
                      <Text style={styles.timelineDate}>
                        {format(new Date(job.createdAt), "MMM dd, yyyy")}
                      </Text>
                    </View>
                    <Text style={styles.timelineTime}>
                      {format(new Date(job.createdAt), "h:mm a")}
                    </Text>
                  </View>

                  {job.startAt && (
                    <View style={styles.infoBoxSuccess}>
                      <View style={styles.rowBetweenMB2}>
                        <View style={styles.rowCenterFlex1}>
                          <View style={styles.timelineIconSmallSuccess}>
                            <Ionicons
                              name="play-circle"
                              size={20}
                              color="#059669"
                            />
                          </View>
                          <Text style={styles.timelineLabel}>
                            Started
                          </Text>
                        </View>
                        <Text style={styles.timelineDateSuccess}>
                          {format(new Date(job.startAt), "MMM dd, yyyy")}
                        </Text>
                      </View>
                      <Text style={styles.timelineTimeSuccess}>
                        {format(new Date(job.startAt), "h:mm a")}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Card>

            {/* Start Job Button */}
            {canStart && (
              <View
                style={styles.startWrap}
              >
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
                        <Text style={styles.startText}>
                          Start Job
                        </Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Checklists Section */}
            <View style={styles.mb2}>
              <View style={styles.rowCenterMB5}>
                <View style={styles.siteIconWrap}>
                  <Ionicons name="checkmark-circle" size={24} color="#0D9488" />
                </View>
                <Text style={styles.sectionTitle}>
                  Checklist Items
                </Text>
              </View>

              <View style={styles.vGap3}>
                {job.checklists.map((checklist, index) => (
                  <View key={checklist.id}>
                    <ChecklistItem
                      checklist={checklist}
                      index={index}
                      jobStarted={job.status !== "scheduled"}
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
      <Modal
        visible={showQRModal}
        transparent={true}
        animationType="slide"
        style={{ width: "70%" }}
        onRequestClose={() => setShowQRModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowQRModal(false)}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={styles.modalContentWrap}>
            <View style={styles.qrHeader}> 
              <Text style={styles.qrTitle}>Start Job QR</Text>
              <Text style={styles.qrSubtitle}>Have your staff scan this code to start the job</Text>
            </View>

            <View style={styles.qrBox}>
              <QRCode
                value={jobStartUrl}
                size={220}
                backgroundColor="white"
                color="black"
                getRef={(c: any) => (qrRef.current = c)}
              />
            </View>

            <View style={styles.qrJobInfo}>
              <Text style={styles.qrJobTitle}>{job.title}</Text>
              <Text style={styles.qrJobNumber}>#{job.jobNumber}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { marginTop: 8 },
                  statusBadge.color === "green"
                    ? { backgroundColor: "#10B981" }
                    : statusBadge.color === "blue"
                    ? { backgroundColor: "#06B6D4" }
                    : { backgroundColor: "#F59E0B" },
                ]}
              >
                <Text style={styles.statusBadgeText}>{statusBadge.label}</Text>
              </View>
            </View>

            <View style={styles.qrActionsRow}>
              <TouchableOpacity
                onPress={async () => {
                  console.log("QR Code saved to Photos");
                  if (!qrRef.current) return;
                  await new Promise<void>((resolve, reject) => {
                    try {
                      qrRef.current.toDataURL(async (data: string) => {
                        try {
                          const baseDir = (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || '';
                          const fileUri = `${baseDir}job-${job.jobNumber}-qr.png`;
                          console.log(fileUri, "------", baseDir);
                          await FileSystem.writeAsStringAsync(fileUri, data, { encoding: FileSystem.EncodingType?.Base64 || 'base64' });
                          console.log("QR Code saved to Photos");
                          try {
                            console.log("MediaLibrary");
                            const { status } = await MediaLibrary.requestPermissionsAsync(true);
                            console.log(status);
                            if (status !== 'granted') {
                              throw new Error('Permission to access Photos was denied');
                            }
                            const asset = await MediaLibrary.createAssetAsync(fileUri);
                            await MediaLibrary.createAlbumAsync('Pristine PNP', asset, false).catch(async () => {
                              await MediaLibrary.addAssetsToAlbumAsync([asset], (await MediaLibrary.getAlbumAsync('Pristine PNP')) || undefined, false).catch(() => {});
                            });
                            Alert.alert('Saved', 'QR code saved to Photos');
                          } catch (saveErr) {
                            console.log(saveErr);
                            let shareUrl = fileUri;
                            if (Platform.OS === 'android' && (FileSystem as any).getContentUriAsync) {
                              try {
                                shareUrl = await (FileSystem as any).getContentUriAsync(fileUri);
                              } catch {}
                            }
                            console.log("shareUrl", shareUrl);
                            await Share.share({ url: shareUrl });
                          }
                          resolve();
                        } catch (err) {
                          reject(err);
                        }
                      });
                    } catch (e) {
                      reject(e as any);
                    }
                  });
                }}
                style={styles.qrDownloadIconBtn}
                activeOpacity={0.9}
              >
                <Ionicons name="download" size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowQRModal(false)} style={[styles.qrCloseBtn, styles.qrCloseBtnWide]} activeOpacity={0.9}>
                <Text style={styles.qrCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* QR Scanner Modal */}
      <QRScannerModal
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScanned={handleScanned}
      />
    </>
  );
};
