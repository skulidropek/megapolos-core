import { Request, Response } from 'express';
import { Context } from '../graphql/server';
import AppExportImportRepo from '../../features/repository/appExportImport.repository';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../domain/config/config';
import UserRepo from '../../features/repository/user/user.repository';

const authenticate = async (req: Request, res: Response): Promise<Context> => {
  const token = req.headers.token || '';
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

export const downloadExportedApp = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const ctx = await authenticate(req, res);
    const repo = new AppExportImportRepo(ctx, id);
    const metadata = await repo.getEntity();
    if (!metadata)
      return res.status(404).json({ error: 'Exported app not found' });
    const jsonData = metadata.manifest;
    if (!jsonData) {
      return res.status(404).json({ error: 'File content is missing' });
    }

    const filename = `${encodeURIComponent(metadata.name)}.json`;
    const formatted = JSON.stringify(jsonData, null, 2);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.status(200).send(formatted);
  } catch (error) {
    console.error('Download failed:', error);
    res.status(404).json({ error: 'File not found or access denied' });
  }
};
