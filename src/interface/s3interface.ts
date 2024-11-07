export interface S3Object {
  Key?: string;
  Size?: number;
  LastModified?: Date;
}

export interface Bucket {
  Name?: string;
  CreationDate?: Date;
}