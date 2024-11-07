"use server";

import { S3Object } from "@/interface/s3interface";
import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  Bucket,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// Configure S3 client on server side
const s3Client = new S3Client({
  endpoint: "http://localhost:4566",
  region: "us-east-1",
  credentials: {
    accessKeyId: "test",
    secretAccessKey: "test",
  },
  forcePathStyle: true,
});

export async function listBuckets() {
  const command = new ListBucketsCommand({});
  const response = await s3Client.send(command);
  return response.Buckets as unknown as Bucket[];
}

export async function listObjects(bucketName: string) {
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
  });
  const response = await s3Client.send(command);
  return response.Contents as unknown as S3Object[];
}

export async function getSignedUrl(bucketName: string, key: string) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);

  return `http://localhost:4566/${bucketName}/${key}`;
}

export async function uploadFile(bucketName: string, file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: file.name,
    Body: Buffer.from(arrayBuffer),
    ContentType: file.type,
  });

  await s3Client.send(command);
  return true;
}


export async function deleteFile(bucketName: string, key: string) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  await s3Client.send(command);
  return true;
}