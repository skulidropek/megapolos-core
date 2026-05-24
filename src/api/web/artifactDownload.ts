import { Request, Response } from 'express';
import { Context } from '../graphql/server';
import ArtifactRepo from '../../features/repository/artifact.repository';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../domain/config/config';
import UserRepo from '../../features/repository/user/user.repository';
import fse from 'fs-extra';
import path from 'path';
import AdmZip from 'adm-zip';
import { megapolosPath } from '../../..';

const authenticate = async (req: Request, res: Response, artifactId?: string): Promise<Context> => {
  const token = (req.headers.token || req.query.token || '') as string;
  let decoded: JwtPayload & { id: string; artifactId?: string };
  try {
    decoded = jwt.verify(token, config.secret) as any;
  } catch (err) {
    if (config.allowUnauthorized) {
      return new Context({ req, res, user: undefined });
    } else {
      throw new Error('Unauthorized');
    }
  }

  // If this is a temporary download token, it must match the artifactId
  if (decoded.artifactId && artifactId && decoded.artifactId !== artifactId) {
    throw new Error('Forbidden: Token is for a different artifact');
  }

  const user = new UserRepo(undefined, decoded.id);
  const userData = await user.getEntity();

  if (!userData) {
    throw new Error('Unauthorized');
  } else {
    return new Context({ user: userData, req, res });
  }
};

export const downloadArtifact = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const ctx = await authenticate(req, res, id);
    const repo = new ArtifactRepo(ctx, id);
    const artifact = await repo.getEntity();
    const artifactPath = await repo.getPath();

    if (!(await fse.pathExists(artifactPath))) {
      return res.status(404).json({ error: 'Artifact directory not found' });
    }

    const zip = new AdmZip();
    zip.addLocalFolder(artifactPath);

    const zipFileName = `${artifact.name || id}.zip`;
    const tempZipPath = path.join(megapolosPath, 'temp', `download_${id}.zip`);

    await fse.ensureDir(path.dirname(tempZipPath));
    zip.writeZip(tempZipPath);

    res.download(tempZipPath, zipFileName, async (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      // Cleanup temp zip after download
      try {
        await fse.remove(tempZipPath);
      } catch (cleanupErr) {
        console.error('Error cleaning up temp zip:', cleanupErr);
      }
    });
  } catch (error) {
    console.error('Download failed:', error);
    res.status(403).json({ error: 'Access denied' });
  }
};
