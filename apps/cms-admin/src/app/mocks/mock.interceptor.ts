import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';
import { MOCK_SITES } from './site.mock';
import type { Site } from '@site-factory/shared-models';

const SIMULATED_DELAY = 600;

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  // Ne mocker que les appels vers /api/
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }

  // GET /api/sites
  if (req.url === '/api/sites' && req.method === 'GET') {
    let sites = [...MOCK_SITES];

    const search = req.params.get('search');
    if (search) {
      const term = search.toLowerCase();
      sites = sites.filter(
        s =>
          s.name.toLowerCase().includes(term) ||
          s.slug.toLowerCase().includes(term) ||
          s.description?.toLowerCase().includes(term)
      );
    }

    const status = req.params.get('status');
    if (status) {
      sites = sites.filter(s => s.status === status);
    }

    const tenantId = req.params.get('tenantId');
    if (tenantId) {
      sites = sites.filter(s => s.tenantId === tenantId);
    }

    return of(
      new HttpResponse({
        status: 200,
        body: {
          data: sites,
          total: sites.length,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        },
      })
    ).pipe(delay(SIMULATED_DELAY));
  }

  // GET /api/sites/:id
  const siteByIdMatch = req.url.match(/^\/api\/sites\/(.+)$/);
  if (siteByIdMatch && req.method === 'GET') {
    const site = MOCK_SITES.find(s => s.id === siteByIdMatch[1]);
    if (site) {
      return of(
        new HttpResponse({
          status: 200,
          body: { data: site },
        })
      ).pipe(delay(SIMULATED_DELAY));
    }
    return of(
      new HttpResponse({
        status: 404,
        body: { code: 'NOT_FOUND', message: 'Site not found' },
      })
    ).pipe(delay(SIMULATED_DELAY));
  }

  // POST /api/sites
  if (req.url === '/api/sites' && req.method === 'POST') {
    const body = req.body as Record<string, unknown>;
    const newSite: Site = {
      id: crypto.randomUUID(),
      tenantId: (body['tenantId'] as string) ?? '',
      name: (body['name'] as string) ?? '',
      slug: (body['slug'] as string) ?? '',
      domain: (body['domain'] as string) ?? null,
      description: (body['description'] as string) ?? null,
      themeId: (body['themeId'] as string) ?? '',
      defaultLocale: (body['defaultLocale'] as string) ?? 'fr',
      status: 'draft' as Site['status'],
      config: null,
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    MOCK_SITES.push(newSite);

    return of(
      new HttpResponse({
        status: 201,
        body: { data: newSite },
      })
    ).pipe(delay(SIMULATED_DELAY));
  }

  // DELETE /api/sites/:id
  if (siteByIdMatch && req.method === 'DELETE') {
    const index = MOCK_SITES.findIndex(s => s.id === siteByIdMatch[1]);
    if (index >= 0) {
      MOCK_SITES.splice(index, 1);
    }
    return of(
      new HttpResponse({ status: 200, body: { data: null } })
    ).pipe(delay(SIMULATED_DELAY));
  }

  return next(req);
};