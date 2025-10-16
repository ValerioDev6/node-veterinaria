export class PaginationDto {
  private constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly search: string,

  ) { }

  static create(page = 1, limit = 10, search = ''): [string?, PaginationDto?] {
    if (isNaN(page) || isNaN(limit)) return ['Page and limit must be number'];
    if (page <= 0) return ['Page must be greater than 0'];
    if (limit <= 0) return ['Limit must be greater than 0'];

    return [undefined, new PaginationDto(page, limit, search)];
  }
}
