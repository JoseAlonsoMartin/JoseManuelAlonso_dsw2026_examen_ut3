import type { NextFunction, Request, Response } from 'express'; // Import request types without emitting runtime imports.
import * as noticesService from '../services/noticesService.js'; // Delegate notice data operations to the service.
import { AppError } from '../errors/AppError.js'; // Forward invalid input to the centralized handler.
import { ResourceNotFoundError } from '../errors/ResourceNotFoundError.js'; // Preserve the requested ID for missing notices.

export function list(req: Request, res: Response, next: NextFunction): void {
  try {
    const page = Number(req.query.page ?? 1); // Convert the optional query value before validating it.
    const limit = Number(req.query.limit ?? 2); // Apply the required default page size.
    const search = req.query.search; // Keep search optional while rejecting repeated/non-text values.

    if (!Number.isInteger(page) || page <= 0) { // Reject non-positive or fractional page numbers.
      throw new AppError(400, 'page must be a positive integer', 'BAD_REQUEST'); // Send query validation through the central handler.
    }
    if (!Number.isInteger(limit) || limit <= 0) { // Reject non-positive or fractional page sizes.
      throw new AppError(400, 'limit must be a positive integer', 'BAD_REQUEST'); // Send query validation through the central handler.
    }
    if (search !== undefined && typeof search !== 'string') { // Ensure the title filter is one text value.
      throw new AppError(400, 'search must be a string', 'BAD_REQUEST'); // Keep invalid query errors consistent.
    }

    res.json(noticesService.list(page, limit, search ?? '')); // Return the specified data and pagination structure.
  } catch (err) {
    next(err);
  }
}

export function getById(req: Request, res: Response, next: NextFunction): void {
  try {
    const notice = noticesService.getById(String(req.params.noticeId));
    if (!notice) {
      throw new ResourceNotFoundError(404, `Notice with id '${req.params.noticeId}' not found`, 'NOT_FOUND', String(req.params.noticeId)); // Preserve the requested identifier in the not-found error.
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
    const body = req.body ?? {}; // Normalize an absent body so validation returns a client error.
    const { title, description } = body; // Read only the supported creation fields.

    if (typeof title !== 'string' || title.trim() === '') { // Require a title with non-whitespace content.
      throw new AppError(400, 'title must be a non-empty string', 'BAD_REQUEST'); // Use the central error handler for invalid input.
    }
    if (description !== undefined && typeof description !== 'string') { // Reject supplied descriptions that are not strings.
      throw new AppError(400, 'description must be a string', 'BAD_REQUEST'); // Avoid silently discarding invalid client data.
    }
    const notice = noticesService.create(title.trim(), description ?? ''); // Store the trimmed title and default an omitted description.
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
    if (typeof body !== 'object' || Array.isArray(body)) { // Require a JSON object for a partial update.
      throw new AppError(400, 'Request body must be an object', 'BAD_REQUEST'); // Report malformed update shape centrally.
    }
    const { title, description } = body;

    if (Object.hasOwn(body, 'title') && typeof title === 'string' && title.trim() === '') { // Keep the requested direct response for an empty title only.
      res.status(400).json({
          error: 'INVALID_TITLE', // Identify the direct empty-title validation response.
          message: 'Title must be a non-empty string', // Explain the title rule to the client.
      }); // Keep the direct response required for the point-11 flow trace.
      return; // Stop before the service can mutate the notice.
    }

    if (title !== undefined && typeof title !== 'string') { // Reject non-string title values through AppError.
      throw new AppError(400, 'title must be a string', 'BAD_REQUEST'); // Route other title type errors through the central handler.
    }

    if (description !== undefined && typeof description !== 'string') {
      throw new AppError(400, 'description must be a string', 'BAD_REQUEST'); // Reject invalid descriptions without changing stored data.
    }

    const notice = noticesService.update(
      String(req.params.noticeId),
      {
        title: title === undefined ? undefined : title.trim(), // Preserve an omitted title and trim a supplied valid one.
        description, // Preserve the description exactly when supplied and leave it unchanged when omitted.
      },
    );

    if (!notice) {
      throw new ResourceNotFoundError( // Propagate the missing notice through the central error handler.
        404, // Return the resource-not-found status.
        `Notice with id '${req.params.noticeId}' not found`, // Name the requested notice in the error message.
        'NOT_FOUND', // Use the stable not-found error code.
        String(req.params.noticeId), // Include the actual requested identifier in the propagated error.
      );
    }

    res.json({ data: notice });
  } catch (err) {
    next(err);
  }
}
