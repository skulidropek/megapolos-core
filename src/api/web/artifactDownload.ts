import { Request, Response } from 'express';
import { Context } from '../graphql/server';
import ArtifactRepo from '../../features/repository/artifact.repository';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../domain/config/config';
import UserRepo from '../../features/repository/user/user.repository';
import fse from 'fs-extra';

const authenticate = async (req: Request, res: Response): Promise<Context> => {
  const token = req.headers.token || req.query.token || '';
  let decoded: JwtPayload & { id: string };
  try {
    decoded = jwt.verify(token as string, config.secret) as JwtPayload & {
      id: string;
    };
  } catch (err) {
    if (config.allowUnauthorized) {
      return new Context({ req, res, user: undefined });
    } else {
      throw new Error('Unauthorized');
    }
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
  const { file } = req.query;
  try {
    const ctx = await authenticate(req, res);
    const repo = new ArtifactRepo(ctx, id);
    const path = await repo.getPath();
    
    const fileName = (file as string) || 'export.zip';
    const filePath = path + '/' + fileName;

    if (!(await fse.pathExists(filePath))) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, fileName);
  } catch (error) {
    console.error('Download failed:', error);
    res.status(403).json({ error: 'Access denied' });
  }
};
