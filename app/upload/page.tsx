"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import UploadFormContent, { type UploadFormContentRef } from "@/app/components/UploadFormContent"
import { useStore } from "@/app/store" // Import useStore

export default function UploadPage() {
  const router = useRouter()
  const formRef = useRef<UploadFormContentRef>(null) // Create a ref for UploadFormContent
  const addUploadedContent = useStore((s) => s.addUploadedContent) // Get addUploadedContent from store

  const handleConfirmUploadPage = async () => {
    await formRef.current?.submit() // Call the submit method on the ref
    // The submit method in UploadFormContent already adds to the store and resets its internal state.
    // Now we can safely navigate
    router.push("/inbox")
  }

  const handleCancelUploadPage = () => {
    router.back()
  }

  return (
    <UploadFormContent
      ref={formRef} // Pass the ref to UploadFormContent
      onConfirm={handleConfirmUploadPage}
      onCancel={handleCancelUploadPage}
      // showFooter defaults to true, so no need to explicitly set it here
    />
  )
}
