import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable()
export class RestProvider {

  constructor(public http: HttpClient) {}

    putData(endpoint, data){
      return this.http.put(endpoint, data)
    }

    getData(endpoint){
      return this.http.get(endpoint)
    }
}
