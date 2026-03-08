import { Component, OnInit, Input } from '@angular/core';

@Component({
  standalone: false,
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
    // Navigation is handled by the parent dashboard component
    // This prevents double-open when clicking a shortcut
  }
}
