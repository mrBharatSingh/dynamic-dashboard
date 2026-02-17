import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-shortcut',
  templateUrl: './shortcut.component.html',
  styleUrls: ['./shortcut.component.scss'],
})
export class ShortcutComponent implements OnInit {
  @Input() name: string;
  @Input() url: string;
  @Input() isEditing: boolean;
  constructor() {}

  ngOnInit(): void {}
  goToLink(url: string) {
    if (!this.isEditing) {
      window.open(url, '_blank');
      console.log(url);
    }
  }
}
