import { DecimalPipe, PercentPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  AeCrudComponent,
  AeCrud,
  createCheckbox,
  createContainer,
  createDropdown,
  createNumberBox,
  createTextBox,
  CrudListSetting,
  DataType,
  ListSetting,
  createDatePicker,
  ObjectType,
  GridInfo,
  Dropdown,
  AeFormComponent,
  AeScrollbarComponent,
  IFormField,
} from '@super-app/shared';
import { MockDataService } from '../../services/mock.service';
import { CitiesService } from '../../services/cities.service';
import { PortfolioService } from '../../services/portfolio.service';
import { of, zip } from 'rxjs';
import { ListEventData } from 'modules/shared/src/lib/components/crud/ae-list/ae-list.component';
import { DMPhongService } from '../../services/dm-phong.service';
import { DMNhiemKyService } from '../../services/dm-nhiemky.service';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PdfViewerHoSoComponent } from '../pdf-viewer-hoso/pdf-viewer-hoso.component';
import { CheckRenderedComponent } from 'modules/shared/src/lib/components/check-rendered/check-rendered.component';

@Component({
  standalone: true,
  imports: [
    AeCrudComponent,
    DialogModule,
    AeScrollbarComponent,
    ButtonModule,
    PdfViewerHoSoComponent,
    AeFormComponent,
    CheckRenderedComponent,
  ],
  selector: 'app-portfolio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss'],
  providers: [DecimalPipe],
})
export class PortfolioComponent extends AeCrud implements OnInit {
  showImportDialog = false;
  showFileViewDialog = false;
  selectedDocument?: ObjectType;
  portfolioService = inject(PortfolioService);
  dmPhongService = inject(DMPhongService);
  dmNhiemKyService = inject(DMNhiemKyService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    const settings = new CrudListSetting();
    super(settings, {});
    settings.objectName = 'Hồ sơ';
    settings.sortMode = 'multiple';
    settings.schemas = [
      createTextBox('code', {
        label: 'Mã',
        fullLabel: 'Mã hồ sơ',
        columnWidth: 100,
        placeholder: 'Nhập mã',
        searchPlaceholder: 'Tìm mã',
        layoutWidth: 12,
      }),
      createTextBox('name', {
        label: 'Tiêu đề',
        layoutWidth: 12,
      }),
      createDropdown('departmentId', {
        label: 'Phông',
        hiddenInList: true,
        layoutWidth: 12,
      }),
      createDropdown('termId', {
        label: 'Nhiệm kỳ',
        hiddenInList: true,
        layoutWidth: 12,
      }),
      createDatePicker('startDate', {
        label: 'Ngày bắt đầu',
        columnWidth: 130,
        dataType: DataType.date,
        allowFilter: false,
        layoutWidth: 6,
      }),
      createDatePicker('endDate', {
        label: 'Ngày kết thúc',
        columnWidth: 130,
        allowFilter: false,
        layoutWidth: 6,
      }),
      createTextBox('thoiHanBaoQuan', {
        label: 'THBQ',
        columnWidth: 100,
        fullLabel: 'Thời hạn bảo quản',
        allowFilter: false,
        hiddenInForm: true,
        layoutWidth: 12,
      }),
      createCheckbox('isVinhVien', {
        label: 'Vĩnh viễn',
        hiddenInList: true,
        layoutWidth: 6,
      }),
      createNumberBox('retentionPeriod', {
        label: 'Thời hạn bảo quản',
        hiddenInList: true,
        suffix: 'năm',
        layoutWidth: 6,
      }),
    ];
    settings.pageSetting.pageSize = 15;
    settings.baseService = inject(PortfolioService);
    settings.fields = 'created';
    settings.afterGetData = (data) => {
      data.data.forEach((rowData) => {
        const item = <any>rowData;
        if (item.retentionPeriod == 0) {
          item.thoiHanBaoQuan = 'Vĩnh viễn';
        } else {
          item.thoiHanBaoQuan = item.retentionPeriod + ' năm';
        }

        if (item.startDate) {
          const startDate = new Date(item.startDate);
          item.startDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            0,
            0,
            0,
            0
          );
        }

        if (item.endDate) {
          const endDate = new Date(item.endDate);
          item.endDate = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
            0,
            0,
            0,
            0
          );
        }
      });
      return of(data);
    };
    settings.onEdit = (eventData: ListEventData) => {
      this.handleEditEvent(eventData);
    };
  }

  handleEditEvent(eventData: ListEventData) {
    eventData.handled = true;
    this.viewFile(eventData.data);
  }

  // File viewing methods
  async viewFile(rowData: any) {
    if (!rowData?.id) {
      console.error('No document ID provided');
      return;
    }
    if (!this.settings.baseService) return;
    zip(
      this.settings.baseService.getDetail(rowData.id),
      this.dmPhongService.getData(new GridInfo()),
      this.dmNhiemKyService.getData(new GridInfo())
    ).subscribe(([resDocument, resPhong, resNhiemKy]) => {
      let schema = <Dropdown>(
        this.settings.schemas.find((q) => q.field == 'departmentId')
      );
      if (resPhong.data)
        schema.options = resPhong.data.map((q: any) => ({
          ten: q.ten,
          id: q.id,
        }));
      schema = <Dropdown>this.settings.schemas.find((q) => q.field == 'termId');
      if (resNhiemKy.data)
        schema.options = resNhiemKy.data.map((q: any) => ({
          ten: q.ten,
          id: q.id,
        }));
      const item: any = resDocument.data;
      if (item) {
        item.isVinhVien = !item.retentionPeriod;
        const schemaRetentionPeriod = this.settings.schemas.find(
          (q) => q.field == 'retentionPeriod'
        );
        if (schemaRetentionPeriod)
          schemaRetentionPeriod.disabled = item.isVinhVien;
        if (item.startDate) {
          const startDate = new Date(item.startDate);
          item.startDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            0,
            0,
            0,
            0
          );
        }

        if (item.endDate) {
          const endDate = new Date(item.endDate);
          item.endDate = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
            0,
            0,
            0,
            0
          );
        }
      }
      this.selectedDocument = item;
      this.showFileViewDialog = true;

      // Manually trigger change detection
      this.cdr.detectChanges();
    });
  }

  closeFileViewDialog() {
    this.showFileViewDialog = false;
    this.selectedDocument = undefined;
  }

  downloadFile(rowData: any) {
    if (!rowData?.id) {
      console.error('No document ID provided');
      return;
    }

    // this.portfolioService.downloadFile(rowData.id).subscribe({
    //   next: (blob: Blob) => {
    //     const url = window.URL.createObjectURL(blob);
    //     const link = document.createElement('a');
    //     link.href = url;

    //     // Create filename from document info
    //     const filename = rowData.documentSymbol
    //       ? `${rowData.documentSymbol}.pdf`
    //       : `document_${rowData.id}.pdf`;

    //     link.download = filename;
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    //     window.URL.revokeObjectURL(url);
    //   },
    //   error: (error) => {
    //     console.error('Download error:', error);
    //     alert('Có lỗi xảy ra khi tải file');
    //   },
    // });
  }

  saveData() {
    if (!this.selectedDocument) return;
    const item = <any>this.selectedDocument;
    if (item.isVinhVien) {
      item.retentionPeriod = 0;
    }
    this.settings.baseService?.update(item.id, item).subscribe({
      next: (res) => {
        this.closeFileViewDialog();
        this.reload();
      },
      error: (error) => {
        console.error('Save error:', error);
        alert('Có lỗi xảy ra khi lưu dữ liệu');
      },
    });
  }

  handleFormChanged(schema: IFormField) {
    if (schema.field == 'isVinhVien') {
      const schemaRetentionPeriod = this.settings.schemas.find(
        (q) => q.field == 'retentionPeriod'
      );
      if (schemaRetentionPeriod)
        schemaRetentionPeriod.disabled =
          this.selectedDocument && this.selectedDocument[schema.field] == true;
      this.cdr.detectChanges();
    }
  }
}
