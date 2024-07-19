import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Faqs } from '@app/_shared/models/faqs-model';
import { ApplicationContextService } from '@app/_shared/services/application-context.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-view-faq',
  templateUrl: './view-faq.component.html',
  styleUrls: ['./view-faq.component.scss']
})
export class ViewFaqComponent implements OnInit {

  panelOpenState = false;
  container: any = {};
  faqs: Faqs[] = [];

  constructor(
    public appContext: ApplicationContextService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.getFaqs();
  }

  getFaqs() {
    this.container['faqsLoading'] = true;
    this.http
      .get(`${environment.baseApiUrl}/faq`)
      .subscribe(
        (response: any) => {
          this.faqs = response.data;
          this.container['faqsLoading'] = false;
        },
        (errResp) => {
          this.container['faqsLoading'] = false;
        }
      );
  }

}
