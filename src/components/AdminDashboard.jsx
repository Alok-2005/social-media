import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { RefreshCw, Calendar, User, AtSign, ImageIcon, X } from "lucide-react"
import axios from "axios"

const API_URL = "http://localhost:5000/api"

const ImageModal = ({ image, onClose }) => {
  if (!image) return null

  return (
    <div
      className="fixed inset-0 bg-opacity-75 backdrop-blur-xl z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors">
          <X size={24} />
        </button>
        <img
          src={image.url || "/placeholder.svg"}
          alt="Full size preview"
          className="w-full h-auto rounded-lg shadow-2xl"
        />
      </div>
    </div>
  )
}

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const fetchSubmissions = async () => {
    setIsRefreshing(true)
    try {
      const response = await axios.get(`${API_URL}/submissions`)
      // Group submissions by socialHandle
      const groupedSubmissions = response.data.reduce((acc, submission) => {
        const existingSubmission = acc.find(s => s.socialHandle === submission.socialHandle)
        if (existingSubmission) {
          // Merge images and update timestamp if newer
          existingSubmission.images.push(...submission.images)
          if (new Date(submission.createdAt) > new Date(existingSubmission.createdAt)) {
            existingSubmission.createdAt = submission.createdAt
          }
        } else {
          acc.push(submission)
        }
        return acc
      }, [])
      
      // Sort by most recent first
      groupedSubmissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      
      setSubmissions(groupedSubmissions)
      setError("")
    } catch (err) {
      setError("Failed to fetch submissions")
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <RefreshCw size={32} className="text-blue-500 dark:text-blue-400" />
          </motion.div>
          <p className="text-gray-600 dark:text-gray-400">Loading submissions...</p>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`space-y-8 ${selectedImage ? "backdrop-blur-lg" : ""}`}
      >
        <div className="flex justify-between items-center">
          <motion.h2
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className="text-3xl font-bold text-gray-800 dark:text-gray-200"
          >
            Gallery ({submissions.length} users)
          </motion.h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchSubmissions}
            disabled={isRefreshing}
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center gap-2 text-gray-800 dark:text-gray-200"
          >
            <RefreshCw size={16} className={`${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </motion.button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-200 rounded-lg"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout className="grid gap-8">
          <AnimatePresence>
            {submissions.map((submission, index) => (
              <motion.div
                key={submission._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400 dark:text-gray-500" />
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{submission.name}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <AtSign size={16} className="text-gray-400 dark:text-gray-500" />
                        <p>{submission.socialHandle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar size={16} />
                      <time>{new Date(submission.createdAt).toLocaleString()}</time>
                    </div>
                  </div>

                  <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {submission.images.map((image, imageIndex) => (
                      <motion.div
                        key={`${submission._id}-${imageIndex}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: imageIndex * 0.1 }}
                        className="relative aspect-video group cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                      >
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={`Upload ${imageIndex + 1} by ${submission.name}`}
                          className="rounded-lg object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg" />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {submissions.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <ImageIcon size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">No submissions yet</p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AdminDashboard