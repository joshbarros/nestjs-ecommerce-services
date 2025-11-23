export class PaginationUtil {
  static paginate<T>(
    items: T[],
    page: number = 1,
    limit: number = 10,
  ): {
    data: T[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  } {
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const data = items.slice(skip, skip + limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }

  static calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  static calculateTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  }
}
