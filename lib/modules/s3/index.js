import {
  CreateBucketCommand,
  GetObjectCommand,
  ListBucketsCommand,
  S3Client,
}                              from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl }        from '@aws-sdk/s3-request-presigner';
import crypto                  from 'crypto';
import fs                      from 'fs';

export default class S3 {
  constructor() {
    this.SPACES_KEY    = fs.readFileSync('/run/secrets/S3_KEY').toString('utf-8').trim();
    this.SPACES_SECRET = fs.readFileSync('/run/secrets/S3_SECRET').toString('utf-8').trim();
    this.bucket        = process.env.BUCKET;
    this.endpoint      = process.env.S3_ENDPOINT;
    this.region        = process.env.S3_REGION;

    this.s3_config = {
      region: this.region,
      endpoint:    this.endpoint,
      credentials: {
        accessKeyId:     this.SPACES_KEY,
        secretAccessKey: this.SPACES_SECRET,
      },
    };

    this.s3 = new S3Client(this.s3_config);
  }

  async createBucket() {
    try {
      let found         = false;
      const { Buckets } = await this.s3.send(new ListBucketsCommand({}));
      for (const bucket of Buckets) {
        if (bucket.Name === this.bucket) {
          found = true;
        }
      }
      if (!found) {
        const data = await this.s3.send(new CreateBucketCommand({
          Bucket: this.bucket,
        }));
        console.log('Created Bucket', data);
      }

    } catch (e) {
      console.log(e);
    }

  }

  async upload({
    key = `tmp/${crypto.randomBytes(16).toString('hex')}`,
    user_id = null,
  }) {
    const Key        = key;
    const Fields     = {
      acl: 'private',
    };
    const Conditions = [
      { acl: 'private' },
      { bucket: process.env.BUCKET },
      ['starts-with', '$key', Key],
      ['starts-with', '$x-amz-meta-json', ''],
      { 'x-amz-meta-user-id': user_id },
    ];
    const s3         = new S3Client(this.s3_config);

    return await createPresignedPost(s3, {
      Bucket:  this.bucket,
      Key,
      Conditions,
      Fields,
      Expires: 300,
    });
  }

  async get(Key) {
    const command = new GetObjectCommand({
      Key,
      Bucket: this.bucket,
    });
    const url     = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    const signed  = new URL(url);
    signed.host   = process.env.CDN;
    return signed.href;
  }

}
