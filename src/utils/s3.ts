import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Constants } from './constants'

const config = {
  region: Constants.BUCKET_REGION,
  credentials: {
    accessKeyId: Constants.BUCKET_ACCESS_KEY_ID,
    secretAccessKey: Constants.SECRET_ACCESS_KEY
  }
}

const s3 = new S3Client(config)

const generateS3UploadUrl = async (userId: string, filename: string): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: filename
  })

  const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
  return url
}

export { generateS3UploadUrl }
