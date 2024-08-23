/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "bits-of-good-application",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const mongo_uri = new sst.Secret("MongoURI");

    const bucket = new sst.aws.Bucket("Bucket", {
      public: true,
    });

    const bucket_url = new sst.Linkable("BucketURL", {
      properties: {
        url: $interpolate`https://${bucket.domain}`,
      },
    });

    const hono = new sst.aws.Function("Hono", {
      url: true,
      handler: "src/index.handler",
      link: [bucket, mongo_uri, bucket_url],
      nodejs: {
        esbuild: {
          external: ["@node-rs/argon2", "@node-rs/bcrypt"],
        },
        install: ["@node-rs/argon2", "@node-rs/bcrypt"],
      },
    });

    return {
      api: hono.url,
      bucket: bucket_url.properties.url,
    };
  },
});
