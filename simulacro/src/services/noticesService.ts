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
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
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


export function list(page: number, limit: number) {
  const start = (page - 1) * limit;

  return {
    data: notices.slice(start, start + limit),
    meta: {
      page,
      limit,
      total: notices.length,
      totalPages: Math.ceil(notices.length / limit),
    },
  };
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
