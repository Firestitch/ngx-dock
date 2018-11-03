import { UploadFileStatus } from "./upload-file-status";
import { Subject } from "rxjs";


export class UploadFile {
  public file: File;
  public cancelSubject: Subject<void>;
  public statusSubject = new Subject();
  public percent = 0;
  public message = '';
  public icon = 'insert_drive_file';
  public status: UploadFileStatus;

  constructor(file: File, cancelSubject) {
    this.file = file;
    this.cancelSubject = cancelSubject;

    if (file.type.match(/^image/)) {
      this.icon = 'insert_photo';
    }

    if (file.type.match(/^video/)) {
      this.icon = 'videocam';
    }
  }

  public setStatus(status, message) {
    this.status = status;
    this.message = message;
    this.statusSubject.next(status);

    if (status===UploadFileStatus.Cancelled ||
        status===UploadFileStatus.Failed ||
        status===UploadFileStatus.Uploaded) {
          this.statusSubject.complete();
    }
  }

  public cancel() {
    this.cancelSubject.next();
    this.setStatus(UploadFileStatus.Cancelled,'Upload was cancelled');
  }
}