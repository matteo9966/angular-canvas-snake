import { Component, inject } from '@angular/core';
import { DialogComponent } from '../dialog/dialog.component';
import { SettingsFormComponent } from '../settings-form/settings-form.component';
import { Dialog, DialogModule, DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-settings-dialog',
  standalone: true,
  imports: [DialogComponent, SettingsFormComponent],
  templateUrl: './settings-dialog.component.html',
  styleUrl: './settings-dialog.component.scss',
})
export class SettingsDialogComponent {
  dialogComponent = inject(DialogRef);

  closeDialog() {
    console.log('should close')
    this.dialogComponent.close();
  }
}
