import { DecimalPipe, PercentPipe, CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
  OnInit,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  signal,
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
  createDatePicker,
  GridInfo,
  Filter,
  FilterOperator,
  ObjectType,
  AeScrollbarComponent,
  AeFormComponent,
  Dropdown,
  ListData,
  Sort,
} from '@super-app/shared';
import { DocumentService } from '../../services/document.service';
import { DocumentTypeService } from '../../services/document-type.service';
import {
  ExcelImportService,
  ExcelImportResult,
} from '../../services/excel-import.service';
import { PdfViewerComponent } from '../pdf-viewer/pdf-viewer.component';
import { forkJoin, map, Observable, of, zip, finalize } from 'rxjs';
import {
  ListEventData,
  AeListComponent,
} from 'modules/shared/src/lib/components/crud/ae-list/ae-list.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { AeMessageService } from 'modules/shared/src/lib/services/ae-message.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    AeCrudComponent,
    DialogModule,
    AeScrollbarComponent,
    ButtonModule,
    PdfViewerComponent,
    AeFormComponent,
    TabsModule,
    AeListComponent,
    ProgressBarModule,
    ToastModule,
  ],
  selector: 'app-document',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss'],
  providers: [DecimalPipe],
})
export class DocumentComponent extends AeCrud implements OnInit, AfterViewInit {
  showFileViewDialog = false;
  selectedDocument?: ObjectType;
  documentTypeService = inject(DocumentTypeService);
  excelImportService = inject(ExcelImportService);
  messageService = inject(AeMessageService);
  private cdr = inject(ChangeDetectorRef);
  vanBanLienQuan = signal<ListData<ObjectType>>({ data: [], total: 0 });
  vanBanLienQuanSettings = signal<CrudListSetting>(new CrudListSetting());

  // Import signals
  importing = signal(false);
  importProgress = signal(0);
  importMessage = signal('');

  constructor() {
    const settings = new CrudListSetting();
    super(settings, {});
    settings.objectName = 'Tài liệu';
    settings.sortMode = 'multiple';
    settings.schemas = [
      createNumberBox('trangSo', {
        label: 'Trang số',
        columnWidth: '70',
        layoutWidth: 12,
      }),
      createTextBox('issuingAgency', {
        label: 'CQBH',
        fullLabel: 'Cơ quan ban hành',
        allowFilter: false,
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
        columnWidth: 130,
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
    settings.pageSetting.pageSize = 15;
    settings.baseService = inject(DocumentService);
    settings.fields = 'documentTypeId,isCopy,portfolioId,created';
    settings.modifyGridInfo = (gridInfo) => {
      gridInfo.sorts = [
        { field: 'portfolioId', dir: 1 },
        { field: 'sequenceNumber', dir: 1 },
      ];
    };
    settings.allowImport = true;
    settings.afterGetData = (data) => {
      const loaiVanBanIds = new Set();
      data.data.forEach((rowData) => {
        const item = <any>rowData;
        if (item.documentTypeId) loaiVanBanIds.add(item.documentTypeId);
        item.tenLoai = item.isCopy ? 'Bản sao' : 'Bản chính';
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
      });
      const service = this.documentTypeService;
      const gridInfo = new GridInfo();
      gridInfo.filters = [];
      // Chuyển đổi Set<string> thành array of strings rồi stringify
      const loaiVanBanArray = Array.from(loaiVanBanIds);
      gridInfo.filters?.push(
        Filter.buildFilter('id', FilterOperator.in, loaiVanBanArray)
      );
      return service.getData(gridInfo).pipe(
        map((res) => {
          const loaiVanBans: any[] = <any>res.data;
          data.data.forEach((rowData) => {
            const item = <any>rowData;
            item.documentTypeName = loaiVanBans.find(
              (q) => q.id == item.documentTypeId
            )?.ten;
          });
          return data;
        })
      );
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
      createTextBox('title', {
        label: 'Tiêu đề',
      }),
    ];
    this.vanBanLienQuanSettings.set(vanBanLienQuanSettings);
  }

  ngAfterViewInit() {
    // Try to add actions column if template is available
    // This might need to be adjusted based on your shared library implementation
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

  downloadTemplate() {
    this.excelImportService.downloadTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Template_Import_Document.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Download template error:', error);
        this.messageService.error({
          severity: 'error',
          summary: 'Lỗi tải template',
          detail: 'Không thể tải template. Vui lòng thử lại sau.',
        });
      },
    });
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
      Filter.buildFilter(
        'portfolioId',
        FilterOperator.equal,
        rowData.portfolioId
      ),
    ];
    gridInfoTaiLieuCungBo.page = 1;
    gridInfoTaiLieuCungBo.pageSize = 10000;
    gridInfoTaiLieuCungBo.sorts = [new Sort('sequenceNumber')];
    zip(
      this.settings.baseService.getDetail(rowData.id),
      this.settings.baseService.getData(gridInfoTaiLieuCungBo),
      this.documentTypeService.getData(new GridInfo())
    ).subscribe(([resDocument, resTaiLieuCungBo, res]) => {
      this.vanBanLienQuan.set({
        data: resTaiLieuCungBo.data || [],
        total: resTaiLieuCungBo.total,
      });

      const schema = <Dropdown>(
        this.settings.schemas.find((q) => q.field == 'documentTypeId')
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

    const documentService = inject(DocumentService);
    documentService.downloadFile(rowData.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Create filename from document info
        const filename = rowData.documentSymbol
          ? `${rowData.documentSymbol}.pdf`
          : `document_${rowData.id}.pdf`;

        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Download error:', error);
        alert('Có lỗi xảy ra khi tải file');
      },
    });
  }

  saveData() {
    if (!this.selectedDocument) return;
    const item = <any>this.selectedDocument;
    item.isCopy = item.loaiBan == 2;
    this.settings.baseService?.update(item.id, item).subscribe({
      next: (res) => {
        this.reload();
        this.nextVanBan();
      },
      error: (error) => {
        console.error('Save error:', error);
        alert('Có lỗi xảy ra khi lưu dữ liệu');
      },
    });
  }

  handleVBLQListEvent(evt: ListEventData) {
    console.log(evt);
  }

  nextVanBan() {
    const currentItem = <any>this.selectedDocument;
    const itemIndex = this.vanBanLienQuan().data.findIndex(
      (q) => (<any>q).id == currentItem.id
    );
    if (itemIndex < this.vanBanLienQuan().data.length)
      this.viewFile(this.vanBanLienQuan().data[itemIndex + 1]);
  }
}
