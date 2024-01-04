import { Component, inject, EventEmitter } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  clickSave = new EventEmitter();
  dialogRef = inject(DialogRef);
  closeDialog() {
    this.dialogRef.close();
  }
}
