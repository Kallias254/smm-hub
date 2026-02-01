import { generateBrandedImage } from '../../creative-engine/generator';
import path from 'path';
import fs from 'fs';
import { payload } from 'payload'; // This assumes payload is initialized globally or we pass config

export async function generateBrandedImageActivity(input: {
  mediaId: string;
  tenantId: string;
  data: any;
}): Promise<{ generatedMediaId: string }> {
  const { mediaId, tenantId, data } = input;

  // Note: Activities should ideally be stateless and receive all data needed,
  // but since we are on the same machine as Payload, we can use the local filesystem/DB.
  
  const media = await payload.findByID({
    collection: 'media',
    id: mediaId,
  });

  const tenant = await payload.findByID({
    collection: 'tenants',
    id: tenantId,
  });

  const imagePath = path.resolve(process.cwd(), 'media', media.filename as string);
  const imageBuffer = fs.readFileSync(imagePath);
  const mimeType = media.mimeType || 'image/png';
  const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

  let logoUrl = '';
  if (tenant.branding?.logo) {
    const logoId = typeof tenant.branding.logo === 'object' ? tenant.branding.logo.id : tenant.branding.logo;
    const logoMedia = await payload.findByID({
      collection: 'media',
      id: logoId
    });
    const logoPath = path.resolve(process.cwd(), 'media', logoMedia.filename as string);
    const logoBuffer = fs.readFileSync(logoPath);
    logoUrl = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  }

  const brandedBuffer = await generateBrandedImage({
    imageUrl: base64Image,
    agencyLogo: logoUrl || undefined,
    primaryColor: tenant.branding?.primaryColor || undefined,
    data: data,
  });

  const generatedMedia = await payload.create({
    collection: 'media',
    data: {
      alt: `Branded Image (Temporal)`,
      tenant: Number(tenantId),
    },
    file: {
      data: brandedBuffer,
      name: `temporal_branded_${media.filename}`,
      mimetype: 'image/png',
      size: brandedBuffer.length,
    },
  });

  return { generatedMediaId: String(generatedMedia.id) };
}

export async function updatePostMediaActivity(postId: string, mediaId: string): Promise<void> {
  await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      assets: {
        brandedMedia: mediaId,
      },
    },
  });
}
