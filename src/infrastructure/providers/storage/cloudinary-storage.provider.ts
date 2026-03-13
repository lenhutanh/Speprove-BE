import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'
import { singleton } from 'tsyringe'
import { env } from '~/common/config'

type ResourceType = 'image' | 'video' | 'raw'

@singleton()
export class CloudinaryStorageProvider {
  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET
    })
  }

  async uploadImage(fileBuffer: Buffer, folder: string): Promise<{ url: string; publicId: string; bytes: number }> {
    const result = await this.uploadFile(fileBuffer, folder, 'image')
    return {
      url: result.secure_url,
      publicId: result.public_id,
      bytes: result.bytes
    }
  }

  async uploadAudio(fileBuffer: Buffer, folder: string): Promise<{ url: string; publicId: string; bytes: number }> {
    const result = await this.uploadFile(fileBuffer, folder, 'video', 'mp3')
    return {
      url: result.secure_url,
      publicId: result.public_id,
      bytes: result.bytes
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    folder: string,
    resourceType: ResourceType = 'raw',
    format?: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
          format,
          transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }]
        },
        (error, result) => {
          if (error) return reject(error)
          resolve(result)
        }
      )
      streamifier.createReadStream(fileBuffer).pipe(stream)
    })
  }

  async deleteFile(publicId: string, resourceType: ResourceType = 'image'): Promise<void> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
        if (error) return reject(error)
        resolve()
      })
    })
  }
}
