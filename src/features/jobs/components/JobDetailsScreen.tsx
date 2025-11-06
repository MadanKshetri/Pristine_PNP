import { Button, Card } from "@/src/components/ui"
import { useAuthStore } from "@/src/lib/store/authStore"
import { Ionicons } from "@expo/vector-icons"
import { format } from "date-fns"
import { useRouter } from "expo-router"
import type React from "react"
import { useState } from "react"
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native"
import QRCode from "react-native-qrcode-svg"
import { SafeAreaView } from "react-native-safe-area-context"
import { useJobActions, useJobDetails } from "../hooks"
import { ChecklistItem } from "./ChecklistItem"

interface JobDetailsScreenProps {
  jobId: string
}

export const JobDetailsScreen: React.FC<JobDetailsScreenProps> = ({ jobId }) => {
  const router = useRouter()
  const { job, isLoading, error, refetch } = useJobDetails(jobId)
  const { startJob, isStartingJob } = useJobActions()
  const user = useAuthStore((state) => state.user)
  const [showQRModal, setShowQRModal] = useState(false)

  const isManager = user?.role === "manager"
  const isGeneralUser = user?.role === "general"

  const handleStartJob = async () => {
    Alert.alert("Start Job", "Are you sure you want to start this job? Your location will be recorded.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Start",
        onPress: async () => {
          const result = await startJob(jobId)
          if (result.success) {
            refetch()
          }
        },
      },
    ])
  }

  const getJobStatusBadge = (): { label: string; color: string } => {
    if (!job) return { label: "Unknown", color: "gray" }

    const hasStarted = job.startAt !== null
    const allCompleted = job.checklists.every((c) => c.status === "Completed")
    const hasInProgress = job.checklists.some((c) => c.status === "Ongoing")

    if (allCompleted) {
      return { label: "Completed", color: "green" }
    } else if (hasInProgress || hasStarted) {
      return { label: "In Progress", color: "blue" }
    } else {
      return { label: "Not Started", color: "yellow" }
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <View className="items-center">
          <View className="w-20 h-20 rounded-full bg-teal-100 items-center justify-center mb-4">
            <ActivityIndicator size="large" color="#0D9488" />
          </View>
          <Text className="text-base font-semibold text-slate-900">Loading job details</Text>
          <Text className="text-sm text-slate-500 mt-1">Please wait...</Text>
        </View>
      </View>
    )
  }

  if (error || !job) {
    const errorMessage = error
      ? (error as any)?.payload || "Failed to load job details."
      : "Job not found. It may have been deleted or you may not have access."

    return (
      <View className="flex-1 justify-center items-center bg-slate-50 px-6">
        <View className="w-28 h-28 rounded-full bg-red-100 items-center justify-center mb-6">
          <Ionicons name="alert-circle-outline" size={56} color="#DC2626" />
        </View>
        <Text className="text-2xl font-bold text-slate-900 mb-3">{error ? "Error Loading Job" : "Job Not Found"}</Text>
        <Text className="text-base text-slate-600 text-center mb-8 px-4 leading-6">{errorMessage}</Text>
        <View className="flex-row gap-3">
          <Button onPress={() => router.back()} variant="outline">
            <View className="flex-row items-center px-2">
              <Ionicons name="arrow-back" size={18} color="#64748B" />
              <Text className="text-slate-700 font-semibold ml-2">Go Back</Text>
            </View>
          </Button>
          {error && (
            <Button onPress={() => refetch()} variant="primary">
              <View className="flex-row items-center px-2">
                <Ionicons name="refresh" size={18} color="#FFFFFF" />
                <Text className="text-white font-semibold ml-2">Retry</Text>
              </View>
            </Button>
          )}
        </View>
      </View>
    )
  }

  const statusBadge = getJobStatusBadge()
  const hasStarted = job.startAt !== null
  const canStart = !hasStarted && isGeneralUser
  const completionPercentage =
    job.checklists.length > 0
      ? (job.checklists.filter((c) => c.status === "Completed").length / job.checklists.length) * 100
      : 0

  // Generate QR code URL for job start
  const jobStartUrl = `pristine-pnp://job/${jobId}/start`

  return (
    <>
      <SafeAreaView className="flex-1 bg-slate-50" edges={["top"]}>
        <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
          {/* Header with Gradient Background */}
          <View  className="bg-gradient-to-b from-teal-600 to-teal-700 px-6 ">
            <View style={{ flex: 1 , flexDirection: 'row' , justifyContent:'space-between' }} className="flex flex-row items-center justify-between mb-8 ">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex-row items-center bg-white/15 px-3 py-2.5 rounded-xl backdrop-blur-sm"
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={20} color="#000000" />
                <Text className="text-base font-semibold  ml-2">Back</Text>
              </TouchableOpacity>

              {/* QR Code Button for Managers */}
              {isManager && (
                <TouchableOpacity
                  onPress={() => setShowQRModal(true)}
                  style={{height: 40}}
                  className="bg-white px-4 py-2.5 rounded-xl flex-row items-center shadow-lg"
                  activeOpacity={0.8}
                >
                  <Ionicons name="qr-code" size={20} color="#0D9488" />
                  <Text className="text-teal-600 text-sm font-bold ml-2">QR Code</Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-4">
                <Text className="text-3xl font-bold mb-3 leading-tight ">{job.title}</Text>
                <View className="flex-row items-center bg-white/20 self-start px-3 py-2 rounded-lg">
                  <Ionicons name="document-text" size={14} color="#000000" />
                  <Text className="text-sm font-medium  ml-1.5">#{job.jobNumber}</Text>
                </View>
              </View>
              <View
                className={`px-4 py-2.5 rounded-xl font-semibold ${
                  statusBadge.color === "green"
                    ? "bg-emerald-500"
                    : statusBadge.color === "blue"
                      ? "bg-cyan-500"
                      : "bg-amber-500"
                }`}
              >
                <Text className="text-xs font-bold ">{statusBadge.label}</Text>
              </View>
            </View>

            {job.description && <Text className="text-sm  leading-5 mt-4">{job.description}</Text>}
          </View>

          {/* Content Section */}
          <View className="px-6 py-6 gap-5">
            {/* Progress Card */}
            {job.checklists.length > 0 && (
              <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <View className="p-5">
                  <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center flex-1">
                      <View className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 items-center justify-center">
                        <Ionicons name="stats-chart" size={24} color="#FFFFFF" />
                      </View>
                      <View className="ml-4 flex-1">
                        <Text className="text-lg font-bold text-slate-900">Overall Progress</Text>
                        <Text className="text-sm text-slate-500 mt-1">
                          {job.checklists.filter((c) => c.status === "Completed").length} of {job.checklists.length}{" "}
                          tasks completed
                        </Text>
                      </View>
                    </View>
                    <Text className="text-3xl font-bold text-teal-600 ml-2">{Math.round(completionPercentage)}%</Text>
                  </View>

                  {/* Progress Bar */}
                  <View className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <View
                      className={`h-full rounded-full ${
                        completionPercentage === 100 ? "bg-emerald-500" : "bg-gradient-to-r from-teal-500 to-cyan-500"
                      }`}
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </View>
                </View>
              </Card>
            )}

            {/* Site Information */}
            {job.site && (
              <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <View className="p-5">
                  <View className="flex-row items-center mb-4">
                    <View className="w-12 h-12 rounded-xl bg-teal-100 items-center justify-center">
                      <Ionicons name="location" size={24} color="#0D9488" />
                    </View>
                    <Text className="text-lg font-bold text-slate-900 ml-4">Site Location</Text>
                  </View>
                  <View className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <Text className="text-base text-slate-900 font-semibold mb-2">{job.site.address}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="business" size={16} color="#64748B" />
                      <Text className="text-sm text-slate-600 ml-2">{job.site.city}</Text>
                    </View>
                  </View>
                </View>
              </Card>
            )}

            {/* Job Timeline */}
            <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
              <View className="p-5">
                <View className="flex-row items-center mb-5">
                  <View className="w-12 h-12 rounded-xl bg-teal-100 items-center justify-center">
                    <Ionicons name="time" size={24} color="#0D9488" />
                  </View>
                  <Text className="text-lg font-bold text-slate-900 ml-4">Timeline</Text>
                </View>
                <View className="gap-3">
                  <View className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 rounded-lg bg-teal-100 items-center justify-center">
                          <Ionicons name="add-circle" size={20} color="#0D9488" />
                        </View>
                        <Text className="text-sm font-semibold text-slate-900 ml-3">Created</Text>
                      </View>
                      <Text className="text-sm font-bold text-slate-900">
                        {format(new Date(job.createdAt), "MMM dd, yyyy")}
                      </Text>
                    </View>
                    <Text className="text-xs text-slate-500 ml-13">{format(new Date(job.createdAt), "h:mm a")}</Text>
                  </View>

                  {hasStarted && job.startAt && (
                    <View className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center flex-1">
                          <View className="w-10 h-10 rounded-lg bg-emerald-100 items-center justify-center">
                            <Ionicons name="play-circle" size={20} color="#059669" />
                          </View>
                          <Text className="text-sm font-semibold text-slate-900 ml-3">Started</Text>
                        </View>
                        <Text className="text-sm font-bold text-emerald-700">
                          {format(new Date(job.startAt), "MMM dd, yyyy")}
                        </Text>
                      </View>
                      <Text className="text-xs text-emerald-700 ml-13">{format(new Date(job.startAt), "h:mm a")}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Card>

            {/* Start Job Button */}
            {canStart && (
              <View className="mb-2">
                <TouchableOpacity
                  onPress={handleStartJob}
                  disabled={isStartingJob}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-5 active:from-emerald-600 active:to-teal-600 shadow-lg"
                  activeOpacity={0.9}
                >
                  <View className="flex-row items-center justify-center">
                    {isStartingJob ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <View className="w-12 h-12 rounded-lg bg-white/20 items-center justify-center">
                          <Ionicons name="play-circle" size={28} color="#FFFFFF" />
                        </View>
                        <Text className="text-white text-xl font-bold ml-4">Start Job</Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* Checklists Section */}
            <View className="mb-2">
              <View className="flex-row items-center mb-5">
                <View className="w-12 h-12 rounded-xl bg-teal-100 items-center justify-center">
                  <Ionicons name="checkmark-circle" size={24} color="#0D9488" />
                </View>
                <Text className="text-xl font-bold text-slate-900 ml-4">Checklist Items</Text>
              </View>

              <View className="gap-3">
                {job.checklists.map((checklist, index) => (
                  <View key={checklist.id}>
                    <ChecklistItem
                      checklist={checklist}
                      index={index}
                      jobStarted={hasStarted}
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
        style={{width: '70%'}}
        onRequestClose={() => setShowQRModal(false)}
      >
        <TouchableOpacity style={{backgroundColor: 'transparent'}} className="flex-1 bg-transparent" activeOpacity={1} onPress={() => setShowQRModal(false)}>
          <View className="">
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View className="bg-transparent rounded-t-3xl shadow-2xl w-fit">
                {/* Modal Header */}

                {/* QR Code Container */}
                <View style={{marginTop: 42 ,flex:1, flexDirection:'row' , justifyContent:'flex-end'}} className="flex flex-row items-end ">
                  <View style={{borderRadius:30 ,backgroundColor:'#ffffff', height:270}} className="bg-white p-8 border-teal-200 h-full shadow-md">
                    <QRCode value={jobStartUrl} size={220} backgroundColor="white" color="black"  />
                  </View>
                </View>

                {/* Job Info Card */}
                {/* <View className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-5 mb-5 border-2 border-teal-200">
                  <View className="flex-row items-center mb-4">
                    <View className="w-10 h-10 rounded-lg bg-teal-200 items-center justify-center">
                      <Ionicons name="briefcase" size={20} color="#0D9488" />
                    </View>
                    <Text className="text-base font-bold text-teal-900 ml-3">Job Information</Text>
                  </View>
                  <View>
                    <View className="flex-row items-start mb-3">
                      <Text className="text-sm text-teal-700 font-bold w-20">Job:</Text>
                      <Text className="text-sm text-teal-900 font-semibold flex-1">{job.title}</Text>
                    </View>
                    <View className="flex-row items-start">
                      <Text className="text-sm text-teal-700 font-bold w-20">Number:</Text>
                      <Text className="text-sm text-teal-900 font-semibold">#{job.jobNumber}</Text>
                    </View>
                  </View>
                </View> */}

                {/* Instructions */}
                {/* <View className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200">
                  <View className="flex-row items-start">
                    <Ionicons name="help-circle" size={22} color="#64748B" />
                    <Text className="text-sm text-slate-700 leading-5 ml-3 flex-1">
                      Open the Pristine PNP app and scan this QR code to instantly start this job
                    </Text>
                  </View>
                </View> */}

                {/* Close Button */}
                {/* <Button onPress={() => setShowQRModal(false)} variant="primary" fullWidth>
                  <View className="py-1">
                    <Text className="text-white font-bold text-base">Close</Text>
                  </View>
                </Button> */}
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  )
}
