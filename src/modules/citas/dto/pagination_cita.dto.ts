export class DateFilterScheduleDto {
  private constructor(public readonly date: Date | null) {}

  static create(dateStr?: string | null): [string?, DateFilterScheduleDto?] {
    let parsedDate: Date | null = null;

    if (dateStr) {
      parsedDate = new Date(dateStr);
      if (isNaN(parsedDate.getTime())) {
        return ['Invalid date format'];
      }
    }

    return [undefined, new DateFilterScheduleDto(parsedDate)];
  }

  // Método auxiliar para obtener el día de la semana con la primera letra en mayúscula
  getDayOfWeek(): string | null {
    if (!this.date) return null;

    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[this.date.getDay()];
  }
}
