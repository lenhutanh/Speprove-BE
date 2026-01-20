import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'
import { env } from '~/config/env.config'

cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
})

const uploadImage = (fileBuffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'image' }, (error, result) => {
      if (error) reject(error)
      else resolve(result?.secure_url || '')
    })
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

const uploadAudio = (fileBuffer: Buffer, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'video',
        format: 'mp3',
        transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }]
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result?.secure_url || '')
      }
    )
    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}

export const CloudinaryProvider = { uploadImage, uploadAudio }
