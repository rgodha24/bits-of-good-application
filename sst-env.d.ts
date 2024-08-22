/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "Bucket": {
      "name": string
      "type": "sst.aws.Bucket"
    }
    "BucketURL": {
      "type": "sst.sst.Linkable"
      "url": string
    }
    "MongoURI": {
      "type": "sst.sst.Secret"
      "value": string
    }
  }
}
export {}
