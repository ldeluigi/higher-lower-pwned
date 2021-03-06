import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.scss']
})
export class LinksComponent implements OnInit {

  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'instagram',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/instagram.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'get-from-google-play',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/google-play-badge.svg')
    );
  }

  ngOnInit(): void {
  }

}
