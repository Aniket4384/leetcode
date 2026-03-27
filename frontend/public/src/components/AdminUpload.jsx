import { useParams } from 'react-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utility/axiosClient';

function AdminUpload() {
  const { problemId } = useParams();
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors
  } = useForm();

  const selectedFile = watch('videoFile')?.[0];

  const onSubmit = async (data) => {
    const file = data.videoFile[0];
    
    setUploading(true);
    setUploadProgress(0);
    clearErrors();

    try {
      const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);

      const uploadResponse = await axios.post(upload_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const cloudinaryResult = uploadResponse.data;

      const metadataResponse = await axiosClient.post('/video/save', {
        problemId: problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

      setUploadedVideo(metadataResponse.data.videoSolution);
      reset();
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('root', {
        type: 'manual',
        message: err.response?.data?.message || 'Upload failed. Please try again.'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-8 px-4 sm:px-6">
      <div className="max-w-md mx-auto w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">
              Upload Video Solution
            </h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* File Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 block">
                  Choose video file
                </label>
                <input
                  type="file"
                  accept="video/*"
                  {...register('videoFile', {
                    required: 'Please select a video file',
                    validate: {
                      isVideo: (files) => {
                        if (!files || !files[0]) return 'Please select a video file';
                        const file = files[0];
                        return file.type.startsWith('video/') || 'Please select a valid video file';
                      },
                      fileSize: (files) => {
                        if (!files || !files[0]) return true;
                        const file = files[0];
                        const maxSize = 100 * 1024 * 1024;
                        return file.size <= maxSize || 'File size must be less than 100MB';
                      }
                    }
                  })}
                  className={`w-full p-3 rounded-lg bg-white/5 border ${
                    errors.videoFile ? 'border-red-500' : 'border-white/20'
                  } text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700`}
                  disabled={uploading}
                />
                {errors.videoFile && (
                  <p className="text-red-400 text-xs mt-1">{errors.videoFile.message}</p>
                )}
              </div>

              {/* Selected File Info */}
              {selectedFile && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-400">Selected File:</p>
                  <p className="text-xs text-gray-300 mt-1 break-all">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400 mt-1">Size: {formatFileSize(selectedFile.size)}</p>
                </div>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errors.root && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{errors.root.message}</p>
                </div>
              )}

              {/* Success Message */}
              {uploadedVideo && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <p className="text-green-400 font-medium text-sm">Upload Successful!</p>
                  <p className="text-xs text-gray-300 mt-1">Duration: {formatDuration(uploadedVideo.duration)}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Uploaded: {new Date(uploadedVideo.uploadedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Upload Button */}
              <button
                type="submit"
                disabled={uploading}
                className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                  uploading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25'
                }`}
              >
                {uploading ? 'Uploading...' : 'Upload Video'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUpload;