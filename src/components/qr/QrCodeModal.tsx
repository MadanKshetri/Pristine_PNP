import { Ionicons } from "@expo/vector-icons";
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  Alert,
  Platform,
  Share,
  StyleSheet,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
import { useRef } from "react";
import { GetJobDto } from "@/fetchers/queriesSchemas";

export default function QrCodeModal({
  job,
  statusBadge,
  showQRModal,
  setShowQRModal,
  isLoadingQrToken,
}: {
  job: GetJobDto;
  statusBadge: { label: string; color: string };
  showQRModal: boolean;
  setShowQRModal: (show: boolean) => void;
  isLoadingQrToken: boolean;
}) {
  const qrRef = useRef<any>(null);

  return (
    <Modal
      visible={showQRModal}
      transparent={true}
      animationType="slide"
      style={{ width: "70%" }}
      onRequestClose={() => setShowQRModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowQRModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={styles.modalContentWrap}
        >
          <View style={styles.qrHeader}>
            <Text style={styles.qrTitle}>Start Job QR</Text>
            <Text style={styles.qrSubtitle}>
              Have your staff scan this code to start the job
            </Text>
          </View>

          <View style={styles.qrBox}>
            {isLoadingQrToken ? (
              <ActivityIndicator size="large" color="#0D9488" />
            ) : (
              <View style={styles.qrEmptyState}>
                <Ionicons name="qr-code-outline" size={40} color="#94a3b8" />
                <Text style={styles.qrEmptyTitle}>QR unavailable</Text>
                <Text style={styles.qrEmptyText}>
                  QR generation is not enabled for this role.
                </Text>
              </View>
            )}
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
                        const baseDir =
                          (FileSystem as any).cacheDirectory ||
                          (FileSystem as any).documentDirectory ||
                          "";
                        const fileUri = `${baseDir}job-${job.jobNumber}-qr.png`;
                        console.log(fileUri, "------", baseDir);
                        await FileSystem.writeAsStringAsync(fileUri, data, {
                          encoding: FileSystem.EncodingType?.Base64 || "base64",
                        });
                        console.log("QR Code saved to Photos");
                        try {
                          console.log("MediaLibrary");
                          const { status } =
                            await MediaLibrary.requestPermissionsAsync(true);
                          console.log(status);
                          if (status !== "granted") {
                            throw new Error(
                              "Permission to access Photos was denied",
                            );
                          }
                          const asset =
                            await MediaLibrary.createAssetAsync(fileUri);
                          await MediaLibrary.createAlbumAsync(
                            "Pristine PNP",
                            asset,
                            false,
                          ).catch(async () => {
                            await MediaLibrary.addAssetsToAlbumAsync(
                              [asset],
                              (await MediaLibrary.getAlbumAsync(
                                "Pristine PNP",
                              )) || undefined,
                              false,
                            ).catch(() => {});
                          });
                          Alert.alert("Saved", "QR code saved to Photos");
                        } catch (saveErr) {
                          console.log(saveErr);
                          let shareUrl = fileUri;
                          if (
                            Platform.OS === "android" &&
                            (FileSystem as any).getContentUriAsync
                          ) {
                            try {
                              shareUrl = await (
                                FileSystem as any
                              ).getContentUriAsync(fileUri);
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
            <TouchableOpacity
              onPress={() => setShowQRModal(false)}
              style={[styles.qrCloseBtn, styles.qrCloseBtnWide]}
              activeOpacity={0.9}
            >
              <Text style={styles.qrCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalContentWrap: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  qrHeader: { alignItems: "center", marginBottom: 16 },
  qrTitle: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  qrSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    textAlign: "center",
  },
  qrBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  qrJobInfo: { marginTop: 12, alignItems: "center" },
  qrJobTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  qrJobNumber: { fontSize: 13, color: "#475569", marginTop: 4 },
  qrCloseWrap: { marginTop: 16 },
  qrCloseBtn: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
  qrCloseText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  qrActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  qrEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8,
  },
  qrEmptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  qrEmptyText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  qrDownloadIconBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  qrCloseBtnWide: { flex: 1 },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: "700", color: "#0F172A" },
});
