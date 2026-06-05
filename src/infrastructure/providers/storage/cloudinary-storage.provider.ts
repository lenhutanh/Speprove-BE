import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'
import { singleton } from 'tsyringe'
import { env } from '~/common/config'
import { UPLOAD_PRESET_MAP, UploadConfig, UploadPreset } from './storage.constants'

@singleton()
export class CloudinaryStorageProvider {
  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET
    })
  }

  async upload(
    fileBuffer: Buffer,
    folder: string,
    preset: UploadPreset,
    override?: Partial<UploadConfig>
  ): Promise<{ url: string; publicId: string; bytes: number }> {
    const baseConfig = UPLOAD_PRESET_MAP[preset]

    const finalConfig: UploadConfig = {
      ...baseConfig,
      ...override
    }

    const result = await this._uploadStream(fileBuffer, folder, finalConfig)

    return {
      url: result.secure_url,
      publicId: result.public_id,
      bytes: result.bytes
    }
  }

  private async _uploadStream(fileBuffer: Buffer, folder: string, config: UploadConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: config.resource_type,
          ...(config.format ? { format: config.format } : {}),
          ...(config.transformation ? { transformation: config.transformation } : {})
        },
        (error, result) => {
          if (error) return reject(error)
          resolve(result)
        }
      )

      streamifier.createReadStream(fileBuffer).pipe(stream)
    })
  }

  async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image') {
    return new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
}
