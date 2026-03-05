import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { Arg, Field, ID, InputType, Mutation, ObjectType, Resolver } from 'type-graphql';
import { createSignedUpload } from '../services/s3.js';

@InputType()
class UploadRequestInput {
  @Field(() => ID)
  missionId!: string;

  @Field(() => String)
  filename!: string;

  @Field(() => String, { nullable: true })
  contentType?: string;
}

@ObjectType()
class SignedUploadPayload {
  @Field(() => String)
  bucket!: string;

  @Field(() => String)
  key!: string;

  @Field(() => String)
  uploadUrl!: string;

  @Field(() => Number)
  expiresIn!: number;
}

@Resolver()
export class UploadResolver {
  @Mutation(() => SignedUploadPayload)
  async createMissionAssetUpload(
    @Arg('input', () => UploadRequestInput) input: UploadRequestInput,
  ): Promise<SignedUploadPayload> {
    const safeName = sanitizeFilename(input.filename);
    const fileExtension = extname(safeName) || '.bin';
    const key = `missions/${input.missionId}/${Date.now()}-${randomUUID()}${fileExtension}`;

    const signed = await createSignedUpload({ key, contentType: input.contentType });
    return {
      bucket: signed.bucket,
      key: signed.key,
      uploadUrl: signed.url,
      expiresIn: signed.expiresIn,
    };
  }
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}
