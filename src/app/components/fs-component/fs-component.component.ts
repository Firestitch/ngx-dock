import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { UploadFileStatus } from './../../classes/upload-file-status';

@Component({
  selector: 'fs-component',
  templateUrl: 'fs-component.component.html',
  styleUrls: [ 'fs-component.component.scss' ],
})
export class FsComponentComponent {

  public files = [];
  public failed = 0;
  public uploaded = 0;
  public cancelled = 0;
  public uploading = 0;
  private closingProgressInterval;
  public closingPercent = 0;
  public closingTimeout = 15;
  public closingSeconds = 0;
  public fileClasses = {  1: 'uploading',
                          2: 'processing',
                          3: 'complete',
                          4: 'failed',
                          5: 'cancelled' };

  constructor(public dialogRef: MatDialogRef<FsComponentComponent>,
              @Inject(MAT_DIALOG_DATA) public data) {

                this.data.files.subscribe(files => {

      this.files.push(...files);
      this.clearClosing();

      files.forEach(file => {

        file.statusSubject.subscribe(status => {

          if (status===UploadFileStatus.Uploading) {
            this.uploading++;
          }

          if (status===UploadFileStatus.Uploaded) {
            this.uploaded++;
            this.uploading--;
          }

          if (status===UploadFileStatus.Failed) {
            this.failed++;
            this.uploading--;
          }

          if (status===UploadFileStatus.Cancelled) {
            this.cancelled++;
            this.uploading--;
          }

          if (status!==UploadFileStatus.Failed && status!==UploadFileStatus.Cancelled && !this.uploading) {
            this.startClosing();
          }
        });
      });
    });
  }

  public cancel(file) {
    file.cancel();
  }

  public clearClosing() {
    clearInterval(this.closingProgressInterval);
    this.closingPercent = 0;
  }

  private startClosing() {

    if (this.failed) {
      return;
    }

    const interval = 100;
    this.clearClosing();
    this.closingProgressInterval = setInterval(() => {
      this.closingPercent += (interval / (this.closingTimeout * 1000)) * 100;
      this.closingSeconds = Math.floor(this.closingTimeout - ((this.closingPercent/ 100)  * this.closingTimeout));

      if (this.closingSeconds<=0) {
        this.clearClosing();
        this.dialogRef.close();
      }
    }, interval);
  }
}
