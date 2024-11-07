"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, File, ChevronRight, Download, RefreshCcw, Trash } from "lucide-react";
import { listBuckets, listObjects, getSignedUrl, deleteFile } from "../app/actions";
import { Bucket } from "@aws-sdk/client-s3";
import { S3Object } from "@/interface/s3interface";
import { FileUpload } from "./FileUpload";

export default function S3Browser() {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [currentBucket, setCurrentBucket] = useState<string>("");
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchBuckets = async () => {
    try {
      setLoading(true);
      const result = await listBuckets();
      setBuckets(result);
    } catch (error) {
      console.error("Error fetching buckets:", error);
      setError("Error fetching buckets. Make sure LocalStack is running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchObjects = async (bucketName: string) => {
    try {
      setLoading(true);
      const result = await listObjects(bucketName);
      setObjects(result);
      setCurrentBucket(bucketName);
      setError("");
    } catch (err) {
      console.error("Error fetching objects:", err);
      setError(`Error fetching objects from bucket ${bucketName}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (key: string) => {
    try {
      const result = await getSignedUrl(currentBucket, key);
      window.open(result, "_blank");
    } catch (err) {
      console.error("Error downloading file:", err);
      setError(`Error downloading file ${key}`);
    }
  };

  useEffect(() => {
    fetchBuckets();
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const deleteSelectedFile = async (key: string) => {
    try {
      await deleteFile(currentBucket, key);
      fetchObjects(currentBucket);
    } catch (err) {
      console.error("Error deleting file:", err);
      setError(`Error deleting file ${key}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>LocalStack S3 Browser</CardTitle>
          <div className="flex gap-2">
            {currentBucket && (
              <FileUpload 
                bucketName={currentBucket} 
                onUploadComplete={() => fetchObjects(currentBucket)} 
              />
            )}
            <Button 
              variant="outline" 
              onClick={() => currentBucket ? fetchObjects(currentBucket) : fetchBuckets()}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : currentBucket ? (
          <div>
            <div className="flex items-center mb-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setCurrentBucket("");
                  setObjects([]);
                }}
              >
                Back to Buckets
              </Button>
              <ChevronRight className="mx-2" />
              <span className="font-medium">{currentBucket}</span>
            </div>

            <div className="border rounded-lg">
              {!objects || objects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  This bucket is empty
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Size</th>
                      <th className="text-left p-3">Last Modified</th>
                      <th className="text-right p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {objects.map((obj) => (
                      <tr key={obj.Key} className="border-b hover:bg-gray-50">
                        <td className="p-3 flex items-center">
                          <File className="h-4 w-4 mr-2" />
                          {obj.Key}
                        </td>
                        <td className="p-3">
                          {obj.Size !== undefined ? formatBytes(obj.Size) : "-"}
                        </td>
                        <td className="p-3">
                          {obj.LastModified
                            ? formatDate(obj.LastModified)
                            : "-"}
                        </td>
                        <td className="p-3 text-right flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => obj.Key && downloadFile(obj.Key)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => obj.Key && deleteSelectedFile(obj.Key)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : (
          <div className="border rounded-lg">
            {buckets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No buckets found
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3">Bucket Name</th>
                    <th className="text-left p-3">Created</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {buckets.map((bucket) => (
                    <tr key={bucket.Name} className="border-b hover:bg-gray-50">
                      <td className="p-3 flex items-center">
                        <Folder className="h-4 w-4 mr-2" />
                        {bucket.Name}
                      </td>
                      <td className="p-3">
                        {bucket.CreationDate
                          ? formatDate(bucket.CreationDate)
                          : "-"}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            bucket.Name && fetchObjects(bucket.Name)
                          }
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
