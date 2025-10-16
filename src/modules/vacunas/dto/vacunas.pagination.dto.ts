export class VacunasPaginationDto {
  private constructor(
    public readonly page: number,
    public readonly limit: number,
    public readonly petName?: string,
    public readonly species?: string,
    public readonly veterinarianName?: string,
    public readonly state_payment?: string,
    public readonly dateFrom?: string,
    public readonly dateTo?: string
  ) {}

  static create(
    page = 1,
    limit = 10,
    petName?: string,
    species?: string,
    veterinarianName?: string,
    state_payment?: string,
    dateFrom?: string,
    dateTo?: string
  ): [string?, VacunasPaginationDto?] {
    if (isNaN(page) || isNaN(limit)) return ['Page and limit must be number']
    if (page <= 0) return ['Page must be greater than 0']
    if (limit <= 0) return ['Limit must be greater than 0']

    return [
      undefined,
      new VacunasPaginationDto(
        page,
        limit,
        petName,
        species,
        veterinarianName,
        state_payment,
        dateFrom,
        dateTo
      ),
    ]
  }
}
