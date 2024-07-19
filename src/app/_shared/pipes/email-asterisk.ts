import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'emailAsterisk' })
export class EmailAsteriskPipe implements PipeTransform {

  transform(value: string): string {
    return value
      ? value.replace(/\B.+@/g, (c, ) => c.split('').slice(0, -1).map(v => '*').join('') + '@')
      : value;
  }

}
