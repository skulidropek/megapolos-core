import { Request, Response } from 'express';
import { Context } from '../graphql/server';
import AppExportImportRepo from '../../features/repository/appExportImport.repository';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../domain/config/config';
import UserRepo from '../../features/repository/user/user.repository';
import path from 'path';

const DOWNLOAD_DIR = path.join(__dirname, '../../../uploads');

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
    if (!metadata) throw new Error('Exported app not found');
    const filePath = path.resolve(DOWNLOAD_DIR, metadata.filename);
    // TODO: Проверка существования файла (Добавить)
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(metadata.originalName)}.json"`
    );
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(filePath);
  } catch (error) {
    console.error('Download failed:', error);
    res.status(404).json({ error: 'File not found or access denied' });
  }
};
