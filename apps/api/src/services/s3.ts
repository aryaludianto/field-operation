import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const bucket = process.env.S3_BUCKET ?? 'ecofieldops-media';
const region = process.env.S3_REGION ?? 'eu-west-1';
const endpoint = process.env.S3_ENDPOINT ?? 'http://localhost:4566';
const accessKeyId = process.env.S3_ACCESS_KEY_ID ?? 'test';
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY ?? 'test';
const signedUrlTtl = Number(process.env.S3_SIGNED_URL_TTL ?? 900);

export const s3Client = new S3Client({
  region,
  endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export type SignedUploadParams = {
  key: string;
  contentType?: string;
};

export async function createSignedUpload({ key, contentType }: SignedUploadParams) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: signedUrlTtl });

  return {
    bucket,
    key,
    url,
    expiresIn: signedUrlTtl,
  };
}
