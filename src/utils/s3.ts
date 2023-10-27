import { S3Client, PutObjectCommand, DeleteObjectCommand, PutObjectCommandOutput, DeleteObjectCommandOutput } from "@aws-sdk/client-s3";

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKeyId = process.env.BUCKET_ACCESS_KEY_ID;
const secretAccessKey = process.env.BUCKET_SECRET_ACCESS_KEY;

const config = {
    region: bucketRegion,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
}

const s3 = new S3Client([config]);

const uploadS3File = async (file: any): Promise<PutObjectCommandOutput | undefined>  => {
    const params = {
        Bucket: bucketName,
        Key: file.originalname,
        Body: file.buffer,
    };

    try {
        const result = await s3.send(new PutObjectCommand(params));
        console.log(result);
        return result;
    } catch (err) {
        console.log(err)
        return undefined
    }
}

const deleteS3File = async (fileName: string): Promise<DeleteObjectCommandOutput | undefined> => {
    const params = {
        Bucket: bucketName,
        Key: fileName,
    };

    try {
        const result = await s3.send(new DeleteObjectCommand(params));
        console.log(result);
        return result;
    } catch (err) {
        console.log(err);
    }
}

export { uploadS3File, deleteS3File };