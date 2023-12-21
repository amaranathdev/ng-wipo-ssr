

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) { }

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`http://localhost:4000/api/getCompanies`);
  }

  search(searchTerms: string): Observable<Patent[]> {
    return this.http.post<Patent[]>(`http://localhost:4000/api/search`, {searchTerms: searchTerms});
  }
}

export interface Patent {
  inns: string
  _company: CompanyInfo
  families: Family[]
}

export interface CompanyInfo {
  uid: string
  website: string
}

export interface Family {
  _id: string
  displayedTitle: string
}

export interface Company {
  _id: string
  uid: string
  displayedName: string
  website: string
  logoUrl: string
  extensions: any[]
}
