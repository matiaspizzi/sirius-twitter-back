import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { Constants } from './constants'
import crypto from 'crypto'

const config = {
  region: Constants.BUCKET_REGION,
  credentials: {
    accessKeyId: Constants.BUCKET_ACCESS_KEY_ID,
    secretAccessKey: Constants.SECRET_ACCESS_KEY
  }
}

const s3 = new S3Client(config)

const uploadS3Image = async (file: any): Promise<string | undefined> => {
  const name = crypto.randomBytes(16).toString('hex') + '.' + (file.mimetype.split('/')[1] as string)
  const params = {
    Bucket: Constants.BUCKET_NAME,
    Key: name,
    Body: file.buffer,
    ContentType: file.mimetype
  }

  const result = await s3.send(new PutObjectCommand(params))
  if (result.$metadata.httpStatusCode !== 200) throw new Error('Error uploading avatar to s3')
  return name
}

// const deleteS3File = async (file: any): Promise<DeleteObjectCommandOutput | undefined> => {
//   const params = {
//     Bucket: Constants.BUCKET_NAME,
//     Key: fileName
//   }

//   try {
//     const result = await s3.send(new DeleteObjectCommand(params))
//     console.log(result)
//     return result
//   } catch (err) {
//     console.log(err)
//   }
// }

export { uploadS3Image }
