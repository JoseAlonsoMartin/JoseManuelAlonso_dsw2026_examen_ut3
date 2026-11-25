 import { randomUUID } from 'node:crypto';
 export interface NoticeChanges {
  title?: string;
  description?: string;
}

 export interface Notice {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface ListNoticesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedNotices {
  data: Notice[];
  pagination: { // Match the pagination envelope required by the notices API.
    page: number; // Report the requested page.
    limit: number; // Report the requested page size.
    total: number; // Count matches before slicing the page.
  };
}


const notices: Notice[] = [
  {
    id: '22222222-2222-4222-8222-222222222221',
    title: 'Mantenimiento programado del servidor',
    description: 'El servidor principal estará en mantenimiento este domingo de 02:00 a 04:00.',
    createdAt: '2026-11-20T09:00:00.000Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    title: 'Mantenimiento de la base de datos',
    description: 'Se aplicarán parches de seguridad en la instancia de producción.',
    createdAt: '2026-11-21T10:30:00.000Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222223',
    title: 'Actualización de certificados SSL',
    description: 'Renovación automática de los certificados TLS del dominio.',
    createdAt: '2026-11-22T12:15:00.000Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222224',
    title: 'Mantenimiento de red interna',
    description: 'Posibles microcortes en la red de oficinas durante la tarde.',
    createdAt: '2026-11-23T15:45:00.000Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222225',
    title: 'Nueva política de copias de seguridad',
    description: 'Las copias incrementales pasarán a ejecutarse cada 6 horas.',
    createdAt: '2026-11-24T08:20:00.000Z',
  },
];


// GET /api/v1/notices?page=1&limit=2&search=examen: page selects the page, limit caps its notices, and search filters titles.
export function list(page: number, limit: number, search = ''): PaginatedNotices { // Accept the optional title filter.
  const normalizedSearch = search.trim().toLowerCase(); // Make title matching case-insensitive and ignore blank filters.
  const filteredNotices = normalizedSearch
    ? notices.filter((notice) => notice.title.toLowerCase().includes(normalizedSearch)) // Filter by title before counting and paging.
    : notices; // Leave the full list unchanged when search is blank.
  const start = (page - 1) * limit; // Convert the one-based page number to an array offset.

  return {
    data: filteredNotices.slice(start, start + limit), // Return an empty slice for pages beyond the last result.
    pagination: { // Include the requested paging values and pre-pagination count.
      page, // Echo the requested page.
      limit, // Echo the requested page size.
      total: filteredNotices.length, // Count only notices matching the title filter.
    }, // Close the pagination values.
  }; // Return the paginated, optionally filtered notices.
}

// Obtener documento por ID
export function getById(id: string): Notice | undefined {
  return notices.find((notice) => notice.id === id);
}

// Crear documento
export function create(title: string, description: string): Notice {
  const notice: Notice = {
    id: randomUUID(),
    title,
    description,
    createdAt: new Date().toISOString(),
  };

  notices.push(notice);

  return notice;
}

// Modificar documento
export function update(
  id: string,
  changes: NoticeChanges,
): Notice | undefined {
  const notice = getById(id);

  if (!notice) {
    return undefined;
  }

  if (changes.title !== undefined) {
    notice.title = changes.title;
  }

  if (changes.description !== undefined) {
    notice.description = changes.description;
  }

  return notice;
}
