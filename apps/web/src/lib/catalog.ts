import type { CatalogItem, Course, Program } from '@cee/types';

export type CatalogKindFilter = 'all' | 'course' | 'program';

/** Campos compartidos entre Course y Program para componentes de landing. */
export type ProductLandingInfo = Pick<
  Course,
  | 'title'
  | 'category'
  | 'modality'
  | 'level'
  | 'shortDescription'
  | 'description'
  | 'price'
  | 'originalPrice'
  | 'imageUrl'
  | 'startDate'
  | 'academicHours'
  | 'certification'
  | 'rating'
  | 'enrolledCount'
  | 'graduateProfile'
  | 'benefits'
  | 'syllabus'
  | 'slug'
>;

export function toProductLandingInfo(product: Course | Program): ProductLandingInfo {
  return product;
}

export function filterCatalogItems(
  items: CatalogItem[],
  kind: CatalogKindFilter,
): CatalogItem[] {
  if (kind === 'all') return items;
  if (kind === 'course') return items.filter((i) => i.kind === 'course');
  return items.filter((i) => i.kind === 'program');
}

export function catalogItemSlug(item: CatalogItem): string {
  return item.kind === 'course' ? item.course.slug : item.program.slug;
}

export function catalogItemTitle(item: CatalogItem): string {
  return item.kind === 'course' ? item.course.title : item.program.title;
}
