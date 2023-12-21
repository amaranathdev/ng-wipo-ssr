import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Observable, Subject, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { AppService, Company, Patent } from './app.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'WIPO';
  companies$!: Observable<Company[]>;
  withRefresh = false;
  patents$!: Observable<Patent[]>;
  private searchText$ = new Subject<string>();

  constructor(private appService:AppService) {}

  search(searchTerms: string) {
    console.log("search(searchTerms: string) => ", searchTerms);
    this.searchText$.next(searchTerms);
  }

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  ngOnInit(): void {
    this.companies$ = this.appService.getCompanies();
    this.patents$ = this.searchText$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(searchTerms =>
        this.appService.search(searchTerms)
      ));
  }
}
