const S3 = require('aws-sdk/clients/s3');
// to use S3 Transfer Acceleration. Ref: "https://aws.amazon.com/s3/transfer-acceleration/"
const s3 = new S3({ useAccelerateEndpoint: true });
// ULIDs used as better alt to UUIDs. Ref: "https://www.trek10.com/blog/leveraging-ulids-to-create-order-in-unordered-datastores"
const ulid = require('ulid');

const { BUCKET_NAME } = process.env;

module.exports.handler = async (event) => {
    const id = ulid.ulid();
    let key = `${event.identity.username}/${id}`;

    const extension = event.arguments.extension
    if (extension) {
        if (extension.startsWith('.')) {
            key += extension
        } else {
            key += `.${extension}`
        }
    }

    const contentType = event.arguments.contentType || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
        throw new Error('content type should be an image')
    }

    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        ACL: 'public-read',
        ContentType: contentType
    }
    // The below "s3.getSignedUrl()" func is locally generated, thus not requiring a promise()
    // Also, to use this feat., we need to enable the PUT method on the S3 bucket's config.
    // NOTE: Alternatively, for more control on what can be uploaded to the Bucket (e.g. file size),
    //      ...you can use "s3.createPresignedPost()".
    //      Ref: "https://zaccharles.medium.com/s3-uploads-proxies-vs-presigned-urls-vs-presigned-posts-9661e2b37932"
    const signedUrl = s3.getSignedUrl('putObject', params);
    return signedUrl;
}