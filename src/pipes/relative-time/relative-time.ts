import { Pipe, PipeTransform } from '@angular/core';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';


@Pipe({
  name: 'relativeTime',
})
export class RelativeTimePipe implements PipeTransform {
  //Para obtener la cantidad de tiempo que ha pasado entre que se el envio al entidad y la ve el usuario
  transform(value: string, ...args){
    return distanceInWordsToNow(new Date(value), {addSuffix: true});
  }
}
