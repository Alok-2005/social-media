import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, User, AtSign, X, ImageIcon } from "lucide-react"
import axios from "axios"

const API_URL = "http://localhost:5000/api"

const SubmissionForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({ name: "", socialHandle: "" })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [previewUrls, setPreviewUrls] = useState([])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)
  }

  const removeImage = (index) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index))
    setPreviewUrls((urls) => urls.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formPayload = new FormData()
    formPayload.append("name", formData.name)
    formPayload.append("socialHandle", formData.socialHandle)
    selectedFiles.forEach((file) => formPayload.append("images", file))

    try {
      const response = await axios.post(`${API_URL}/submissions`, formPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      onSubmit(response.data)
      setFormData({ name: "", socialHandle: "" })
      setSelectedFiles([])
      setPreviewUrls([])
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ""
    } catch (err) {
      setError(err.response?.data?.error || "Submission failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 transition-colors duration-200"
    >
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Share Your Story</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Submit your social media information and images</p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-200 rounded-lg flex items-center"
          >
            <span className="flex-1">{error}</span>
            <button onClick={() => setError("")} className="ml-2">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span className="flex items-center gap-2">
              <User size={16} />
              Name
            </span>
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={loading}
            placeholder="Enter your name"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span className="flex items-center gap-2">
              <AtSign size={16} />
              Social Media Handle
            </span>
          </label>
          <input
            name="socialHandle"
            value={formData.socialHandle}
            onChange={handleInputChange}
            required
            disabled={loading}
            placeholder="@username"
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-2"
        >
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <span className="flex items-center gap-2">
              <ImageIcon size={16} />
              Upload Images
            </span>
          </label>
          <div className="relative">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
            >
              <Upload className="mr-2" size={20} />
              <span className="text-gray-600 dark:text-gray-400">Choose files or drag & drop</span>
            </label>
          </div>
        </motion.div>

        <AnimatePresence>
          {previewUrls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-2 gap-4"
            >
              {previewUrls.map((url, index) => (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative aspect-video group"
                >
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    className="rounded-lg object-cover w-full h-full"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-3 rounded-lg transition ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:from-blue-600 hover:to-blue-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit"}
        </motion.button>
      </form>
    </motion.div>
  )
}

export default SubmissionForm

