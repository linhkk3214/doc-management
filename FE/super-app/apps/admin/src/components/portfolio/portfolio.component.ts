import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  AeCrudComponent,
  AeCrud,
  createCheckbox,
  createDropdown,
  createNumberBox,
  createTextBox,
  CrudListSetting,
  DataType,
  createDatePicker,
  ObjectType,
  GridInfo,
  Dropdown,
  AeFormComponent,
  AeScrollbarComponent,
  IFormField,
  ListData,
  Filter,
  FilterOperator,
  Sort,
} from '@super-app/shared';
import { PortfolioService } from '../../services/portfolio.service';
import { finalize, of, zip } from 'rxjs';
import {
  AeListComponent,
  ListEventData,
} from 'modules/shared/src/lib/components/crud/ae-list/ae-list.component';
import { DMPhongService } from '../../services/dm-phong.service';
import { DMNhiemKyService } from '../../services/dm-nhiemky.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PdfViewerHoSoComponent } from '../pdf-viewer-hoso/pdf-viewer-hoso.component';
import { CheckRenderedComponent } from 'modules/shared/src/lib/components/check-rendered/check-rendered.component';
import { AeMessageService } from 'modules/shared/src/lib/services/ae-message.service';
import { ExcelImportService } from '../../services/excel-import.service';
import { ProgressBarModule } from 'primeng/progressbar';
import { Tabs, TabsModule } from 'primeng/tabs';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';
import { DocumentService } from '../../services/document.service';
import { DocumentTypeService } from '../../services/document-type.service';

@Component({
  standalone: true,
  imports: [
    AeCrudComponent,
    DialogModule,
    AeScrollbarComponent,
    ButtonModule,
    PdfViewerHoSoComponent,
    PdfViewerComponent,
    AeFormComponent,
    TabsModule,
    ProgressBarModule,
    AeListComponent,
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
  selectedVanBan?: ObjectType;
  portfolioService = inject(PortfolioService);
  dmPhongService = inject(DMPhongService);
  dmNhiemKyService = inject(DMNhiemKyService);
  documentService = inject(DocumentService);
  documentTypeService = inject(DocumentTypeService);
  private cdr = inject(ChangeDetectorRef);
  messageService = inject(AeMessageService);
  excelImportService = inject(ExcelImportService);
  vanBanLienQuan = signal<ListData<ObjectType>>({ data: [], total: 0 });
  vanBanLienQuanSettings = signal<CrudListSetting>(new CrudListSetting());
  settingsVanBan = new CrudListSetting();
  @ViewChild('tabs') tabs!: Tabs;

  // Import signals
  importing = signal(false);
  importProgress = signal(0);
  importMessage = signal('');
  activeTab = 0;

  override ngOnInit() {
    super.ngOnInit();
  }

  constructor() {
    const settings = new CrudListSetting();
    super(settings, {});
    settings.objectName = 'Hồ sơ';
    settings.sortMode = 'multiple';
    settings.schemas = [
      createTextBox('originalPath', {
        label: 'Đường dẫn',
        //columnWidth: '30%',
        hiddenInForm: true,
        layoutWidth: 12,
      }),
      createTextBox('code', {
        label: 'Mã',
        fullLabel: 'Mã hồ sơ',
        columnWidth: 100,
        placeholder: 'Nhập mã',
        searchPlaceholder: 'Tìm mã',
        hiddenInList: true,
        layoutWidth: 12,
      }),
      createTextBox('name', {
        label: 'Tiêu đề',
        hiddenInList: true,
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
        hiddenInList: true,
        layoutWidth: 6,
      }),
      createDatePicker('endDate', {
        label: 'Ngày kết thúc',
        columnWidth: 130,
        allowFilter: false,
        hiddenInList: true,
        layoutWidth: 6,
      }),
      createTextBox('thoiHanBaoQuan', {
        label: 'THBQ',
        columnWidth: 100,
        fullLabel: 'Thời hạn bảo quản',
        allowFilter: false,
        hiddenInForm: true,
        hiddenInList: true,
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
    settings.allowImport = true;
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

    const vanBanLienQuanSettings = new CrudListSetting();
    vanBanLienQuanSettings.paginator = false;
    vanBanLienQuanSettings.showPageSettings = false;
    vanBanLienQuanSettings.hiddenRowIndex = true;
    vanBanLienQuanSettings.hiddenCheckbox = true;
    vanBanLienQuanSettings.hiddenFunctionColumn = true;
    vanBanLienQuanSettings.hiddenFilterRow = true;
    vanBanLienQuanSettings.selectionMode = 'single';
    vanBanLienQuanSettings.schemas = [
      createNumberBox('sequenceNumber', {
        label: 'STT',
        columnWidth: '10%',
      }),
      createTextBox('fileName', {
        label: 'Tên file',
      }),
    ];
    this.vanBanLienQuanSettings.set(vanBanLienQuanSettings);

    const settingsVanBan = new CrudListSetting();
    this.settingsVanBan = settingsVanBan;
    settingsVanBan.baseService = this.documentService;
    settingsVanBan.objectName = 'Tài liệu';
    settingsVanBan.hiddenRowIndex = true;
    settingsVanBan.sortMode = 'multiple';
    settingsVanBan.schemas = [
      createNumberBox('trangSo', {
        label: 'Trang số',
        columnWidth: '70',
        layoutWidth: 12,
      }),
      createTextBox('issuingAgency', {
        label: 'CQBH',
        fullLabel: 'Cơ quan ban hành',
        allowFilter: false,
        columnWidth: '15%',
        layoutWidth: 12,
      }),
      createNumberBox('sequenceNumber', {
        label: 'Số VB',
        fullLabel: 'Số văn bản',
        columnWidth: 70,
        placeholder: 'Nhập số VB',
        layoutWidth: 3,
      }),
      createTextBox('documentSymbol', {
        label: 'Ký hiệu',
        columnWidth: '10%',
        layoutWidth: 9,
      }),
      createDatePicker('signedDate', {
        label: 'Ngày ký',
        columnWidth: 110,
        allowFilter: false,
        layoutWidth: 12,
      }),
      createDropdown('documentTypeId', {
        label: 'Loại',
        includeInList: false,
        hiddenInList: true,
        layoutWidth: 12,
      }),
      createTextBox('documentTypeName', {
        label: 'Loại VB',
        columnWidth: 130,
        hiddenInForm: true,
        allowFilter: false,
        layoutWidth: 12,
      }),
      createTextBox('summary', {
        label: 'Trích yếu',
        layoutWidth: 12,
      }),
      createTextBox('signer', {
        label: 'Người ký',
        columnWidth: 140,
        layoutWidth: 12,
      }),
      createDropdown('loaiBan', {
        label: 'Loại bản',
        columnWidth: 70,
        hiddenInList: true,
        allowFilter: false,
        layoutWidth: 12,
        options: [
          { id: 1, ten: 'Bản chính' },
          { id: 2, ten: 'Bản sao' },
        ],
      }),
      createTextBox('tenLoai', {
        label: 'Loại bản',
        columnWidth: 70,
        hiddenInForm: true,
        allowFilter: false,
        layoutWidth: 12,
      }),
    ];
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
    const gridInfoTaiLieuCungBo = new GridInfo();
    gridInfoTaiLieuCungBo.filters = [
      Filter.buildFilter('portfolioId', FilterOperator.equal, rowData.id),
    ];
    gridInfoTaiLieuCungBo.page = 1;
    gridInfoTaiLieuCungBo.pageSize = 10000;
    gridInfoTaiLieuCungBo.sorts = [new Sort('sequenceNumber')];
    zip(
      this.settings.baseService.getDetail(rowData.id),
      this.dmPhongService.getData(new GridInfo()),
      this.dmNhiemKyService.getData(new GridInfo()),
      this.documentService.getData(gridInfoTaiLieuCungBo)
    ).subscribe(([resDocument, resPhong, resNhiemKy, resTaiLieuCungBo]) => {
      const vanBanCungBo = resTaiLieuCungBo.data || [];
      vanBanCungBo.forEach((q: any) => {
        q.fileName = q.originalPath.split('\\').pop();
      });
      this.vanBanLienQuan.set({
        data: resTaiLieuCungBo.data || [],
        total: resTaiLieuCungBo.total,
      });

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

  handleViewHoSo() {
    this.selectedVanBan = undefined;
  }

  handleVisibleChanged() {
    if (!this.showFileViewDialog) {
      this.closeFileViewDialog();
    }
  }

  closeFileViewDialog() {
    this.showFileViewDialog = false;
    this.activeTab = 0;
    this.selectedVanBan = undefined;
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

  // Import Excel methods
  triggerFileInput() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls';
    fileInput.onchange = (event: any) => this.onFileSelected(event);
    fileInput.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    const validation = this.excelImportService.validateExcelFile(file);
    if (validation.errors.length > 0) {
      this.messageService.error({
        severity: 'error',
        summary: 'Lỗi file',
        detail: validation.errors.join(', '),
      });
      return;
    }

    // Start import immediately
    this.startImport(file);
  }

  startImport(file: File) {
    this.importing.set(true);
    this.importProgress.set(0);
    this.importMessage.set('Đang tải file lên server...');

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      const current = this.importProgress();
      if (current < 90) {
        this.importProgress.set(current + 10);
        if (current === 0)
          this.importMessage.set('Đang phân tích dữ liệu Excel...');
        else if (current === 30)
          this.importMessage.set('Đang xử lý danh mục...');
        else if (current === 60)
          this.importMessage.set('Đang tạo hồ sơ và văn bản...');
      }
    }, 500);

    this.excelImportService
      .importExcel(file)
      .pipe(
        finalize(() => {
          clearInterval(progressInterval);
          this.importing.set(false);
          this.importProgress.set(100);
        })
      )
      .subscribe({
        next: (result) => {
          if (result.success) {
            this.importMessage.set('Import hoàn tất thành công!');
            this.messageService.success({
              severity: 'success',
              summary: 'Import thành công!',
              detail: `Đã import ${result.importedDocuments} văn bản, ${result.importedPortfolios} hồ sơ`,
            });
            // Reload data
            this.reload();
          } else {
            this.importMessage.set('Import thất bại!');
            this.messageService.error({
              severity: 'error',
              summary: 'Import thất bại!',
              detail: result.message || 'Có lỗi xảy ra trong quá trình import',
            });
          }
        },
        error: (error) => {
          console.error('Import error:', error);
          this.importMessage.set('Có lỗi xảy ra!');
          this.messageService.error({
            severity: 'error',
            summary: 'Lỗi import',
            detail:
              error.error?.message || error.message || 'Lỗi không xác định',
          });
        },
      });
  }

  saveData() {
    if (this.selectedVanBan) {
      this.saveDataVanBan();
      return;
    }
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

  saveDataVanBan() {
    if (!this.selectedVanBan) return;
    const item = <any>this.selectedVanBan;
    item.isCopy = item.loaiBan == 2;
    this.settingsVanBan.baseService?.update(item.id, item).subscribe({
      next: (res) => {
        this.nextVanBan();
      },
      error: (error) => {
        console.error('Save error:', error);
        alert('Có lỗi xảy ra khi lưu dữ liệu');
      },
    });
  }

  handleVBLQListEvent(evt: ListEventData) {
    if (evt.eventName == 'select-row' || evt.eventName == 'unselect-row')
      this.viewVanBan(evt.data);
  }

  async viewVanBan(rowData: any) {
    if (!rowData?.id) {
      console.error('No document ID provided');
      return;
    }
    if (!this.settingsVanBan.baseService) return;
    zip(
      this.settingsVanBan.baseService.getDetail(rowData.id),
      this.documentTypeService.getData(new GridInfo())
    ).subscribe(([resDocument, res]) => {
      const schema = <Dropdown>(
        this.settingsVanBan.schemas.find((q) => q.field == 'documentTypeId')
      );
      if (res.data)
        schema.options = res.data.map((q: any) => ({
          ten: q.ten,
          id: q.id,
        }));
      const item: any = resDocument.data;
      if (item) {
        if (item.signedDate) {
          const signedDate = new Date(item.signedDate);
          item.signedDate = new Date(
            signedDate.getFullYear(),
            signedDate.getMonth(),
            signedDate.getDate(),
            0,
            0,
            0,
            0
          );
        }
        item.loaiBan = item.isCopy ? 2 : 1;
      }
      this.selectedVanBan = item;
      this.activeTab = 2;
      if (this.tabs != null) {
        const tabVanBan = this.tabs.el.nativeElement.querySelector(
          'p-tab[ng-reflect-value="2"]'
        );
        if (tabVanBan)
          setTimeout(() => {
            tabVanBan.click();
          }, 0);
      }

      // Manually trigger change detection
      this.cdr.detectChanges();
    });
  }

  nextVanBan() {
    const currentItem = <any>this.selectedVanBan;
    const itemIndex = this.vanBanLienQuan().data.findIndex(
      (q) => (<any>q).id == currentItem.id
    );
    if (itemIndex < this.vanBanLienQuan().data.length - 1) {
      const nextItem = this.vanBanLienQuan().data[itemIndex + 1];
      this.selectedVanBan = nextItem;
      this.activeTab = 2;

      // Manually trigger change detection
      this.cdr.detectChanges();
    } else {
      this.messageService.warn({
        severity: 'warn',
        summary: 'Thông báo',
        detail: 'Đã đến văn bản cuối',
      });
    }
  }

  handleFormChanged(event: {field: string, value: any, schema: IFormField}) {
    if (event.field == 'isVinhVien') {
      const schemaRetentionPeriod = this.settings.schemas.find(
        (q) => q.field == 'retentionPeriod'
      );
      if (schemaRetentionPeriod)
        schemaRetentionPeriod.disabled =
          this.selectedDocument && this.selectedDocument[event.field] == true;
      this.cdr.detectChanges();
    }
  }
}
