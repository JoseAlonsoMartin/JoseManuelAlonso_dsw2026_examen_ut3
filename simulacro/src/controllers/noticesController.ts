import { NextFunction } from "express";
import * as noticesService from "../services/noticesService.js";
import { AppError } from "../errors/AppError.js";
import type { Request, Response } from "express";



export function list(req: Request, res: Response, next: NextFunction): void {
  try {
    // req.query always arrives as text: the controller converts it.
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    res.json(noticesService.list(page, limit));
  } catch (err) {
    next(err);
  }
}

export function getById(req: Request, res: Response, next: NextFunction): void {
  try {
    const notice = noticesService.getById(String(req.params.noticeId));
    if (!notice) {
      throw new AppError(404, `Notice with id '${req.params.noticeId}' not found`, 'NOT_FOUND');
    }
    res.json({ data: notice });
  } catch (err) {
    next(err);
  }
}

export function create(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const { title, description } = req.body;

    if (!title || typeof title !== 'string') {
      throw new AppError(400, 'Missing required field: title', 'BAD_REQUEST');
    }

    const notice = noticesService.create(
      title.trim(),
      typeof description === 'string' ? description.trim() : '',
    );

    res.status(201).json({ data: notice });
  } catch (err) {
    next(err);
  }
}

export function update(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  try {
    const body = req.body ?? {};
    const { title, description } = body;
    
    if ('title' in body) {
    if (typeof title !== 'string' || title.trim() === '') {
      res.status(400).json({
          error: 'INVALID_TITLE',
          message: 'Title must be a non-empty string',
        
          });
          return;
      }
    }

    if (title !== undefined && typeof title !== 'string') {
      throw new AppError(400, 'Invalid title', 'BAD_REQUEST');
    }

    if (description !== undefined && typeof description !== 'string') {
      throw new AppError(400, 'Invalid description', 'BAD_REQUEST');
    }

    const notice = noticesService.update(
      String(req.params.noticeId),
      {
        title: typeof title === 'string' ? title.trim() : undefined,
        description:
          typeof description === 'string' ? description.trim() : undefined,
      },
    );

    if (!notice) {
      throw new AppError(
        404,
        `Notice with id '${req.params.noticeId}' not found`,
        'NOT_FOUND',
      );
    }

    res.json({ data: notice });
  } catch (err) {
    next(err);
  }
}
