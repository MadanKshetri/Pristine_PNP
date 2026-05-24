import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

interface QRScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanned: (data: string) => Promise<void> | void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  visible,
  onClose,
  onScanned,
}) => {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [lineAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    let mounted = true;
    if (visible) {
      setScanned(false);
      if (!permission?.granted) {
        requestPermission();
      }
      lineAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(lineAnim, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(lineAnim, {
            toValue: 0,
            duration: 1400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
    return () => {
      mounted = false;
    };
  }, [visible]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    try {
      console.log("QR Code scanned:", data);
      await onScanned(data);
    } finally {
      onClose();
    }
  };

  const { width, height } = Dimensions.get("window");
  const frameSize = Math.min(width * 0.75, 280);
  const frameLeft = (width - frameSize) / 2;
  const frameTop = (height - frameSize) / 2.4;
  const translateY = lineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, frameSize - 4],
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <View style={styles.cameraWrap}>
          {permission && permission.granted === false ? (
            <View style={styles.permissionWrap}>
              <Text style={styles.permissionText}>Camera access denied</Text>
              <TouchableOpacity onPress={onClose} style={styles.permissionBtn}>
                <Text style={styles.permissionBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <CameraView
              style={StyleSheet.absoluteFill}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={
                scanned
                  ? undefined
                  : (result: { data: string }) =>
                      handleBarCodeScanned({ data: result.data })
              }
            />
          )}

          <View
            style={[
              styles.overlay,
              { top: 0, left: 0, right: 0, height: frameTop },
            ]}
          />
          <View
            style={[
              styles.overlay,
              { top: frameTop, left: 0, width: frameLeft, height: frameSize },
            ]}
          />
          <View
            style={[
              styles.overlay,
              { top: frameTop, right: 0, width: frameLeft, height: frameSize },
            ]}
          />
          <View
            style={[
              styles.overlay,
              { top: frameTop + frameSize, left: 0, right: 0, bottom: 0 },
            ]}
          />

          <View
            style={[
              styles.frame,
              {
                width: frameSize,
                height: frameSize,
                top: frameTop,
                left: frameLeft,
              },
            ]}
          >
            <Animated.View
              style={[styles.scanLine, { transform: [{ translateY }] }]}
            />
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>

          <View style={styles.headerTextWrap}>
            <Text style={styles.headerText}>Scan QR Code</Text>
            <Text style={styles.instructionText}>
              Align the QR within the frame to start the job
            </Text>
          </View>

          <View style={styles.bottomWrap}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)" },
  cameraWrap: { flex: 1 },
  permissionWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  permissionText: { color: "#FFFFFF", fontSize: 16 },
  permissionBtn: {
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  permissionBtnText: { color: "#FFFFFF" },
  overlay: { position: "absolute", backgroundColor: "rgba(0,0,0,0.45)" },
  frame: {
    position: "absolute",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#22D3EE",
    overflow: "hidden",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#22D3EE",
    opacity: 0.9,
  },
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "#22D3EE",
  },
  cornerTL: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  cornerTR: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  cornerBL: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  cornerBR: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  headerTextWrap: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  headerText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  instructionText: { color: "#E5E7EB", fontSize: 13, marginTop: 6 },
  bottomWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 40,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  cancelText: { color: "#111827", fontSize: 16, fontWeight: "600" },
});
