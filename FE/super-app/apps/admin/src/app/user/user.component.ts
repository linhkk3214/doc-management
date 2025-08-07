import { DecimalPipe, PercentPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AeCrudComponent, AeCrud, createCheckbox, createContainer, createDropdown, createNumberBox, createTextBox, CrudListSetting, DataType, ListSetting } from '@super-app/shared';
import { MockDataService } from '../../services/mock.service';
import { CitiesService } from '../../services/cities.service';

@Component({
  standalone: true,
  imports: [
    AeCrudComponent
  ],
  selector: 'app-user',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  providers: [DecimalPipe]
})
export class UserComponent extends AeCrud implements OnInit {
  constructor() {
    const settings = new CrudListSetting();
    settings.objectName = 'Tỉnh/Thành phố';
    settings.sortMode = 'multiple';
    settings.schemas = [
      createTextBox('code', {
        label: 'code',
        columnWidth: 100,
        useLocalization: true,
        hiddenInList: true,
        placeholder: 'Nhập tên',
        searchPlaceholder: 'Tìm tên'
      }),
      createTextBox('name', {
        label: 'name',
        useLocalization: true
      }),
      createDropdown('type', {
        label: 'type',
        columnWidth: '130px',
        options: [
          { id: 1, ten: 'Thành phố' },
          { id: 2, ten: 'Tỉnh' }
        ],
        useLocalization: true,
        allowSort: false
      }),
      createCheckbox('capital', {
        label: 'capital',
        columnWidth: 80,
        useLocalization: true,
        allowSort: false
      }),
      createContainer([
        createNumberBox('population', {
          label: 'population',
          useLocalization: true,
          columnWidth: '100px',
          dataType: DataType.int,
          pipeParams: ['1.0-0'],
          pipe: new DecimalPipe('vi-VN'),
          allowFilter: false,
          allowSort: false
        }),
        createNumberBox('populationPercent', {
          label: 'popPercent',
          fullLabel: 'popPercentFull',
          useLocalization: true,
          columnWidth: '80px',
          allowFilter: false,
          hiddenInForm: true,
          dataType: DataType.decimal,
          pipeParams: ['1.0-0'],
          pipe: new PercentPipe('vi-VN'),
          allowSort: false
        }),
        createNumberBox('happyRate', {
          label: 'happyRate',
          fullLabel: 'happyRateFull',
          useLocalization: true,
          columnWidth: '140px',
          dataType: DataType.decimal,
          pipeParams: ['1.1-2'],
          pipe: new DecimalPipe('vi-VN')
        }),
      ], {
        field: 'aggregation',
        label: 'Tổng hợp'
      }),
    ];
    settings.dataSource = [
      { "id": 1, "code": "HN", "name": "Hà Nội", "type": 1, "capital": true, "aggregation": { "population": 8000000, "happyRate": 7.2 } },
      { "id": 2, "code": "HCM", "name": "Hồ Chí Minh", "type": 1, "capital": false, "aggregation": { "population": 9000000, "happyRate": 6.9 } },
      { "id": 3, "code": "DN", "name": "Đà Nẵng", "type": 1, "capital": false, "aggregation": { "population": 1100000, "happyRate": 8.1 } },
      { "id": 4, "code": "HP", "name": "Hải Phòng", "type": 1, "capital": false, "aggregation": { "population": 2000000, "happyRate": 6.4 } },
      { "id": 5, "code": "CT", "name": "Cần Thơ", "type": 1, "capital": false, "aggregation": { "population": 1250000, "happyRate": 7.5 } },
      { "id": 6, "code": "BD", "name": "Bình Dương", "type": 2, "capital": false, "aggregation": { "population": 2500000, "happyRate": 7.0 } },
      { "id": 7, "code": "LA", "name": "Long An", "type": 2, "capital": false, "aggregation": { "population": 1500000, "happyRate": 6.6 } },
      { "id": 8, "code": "KH", "name": "Khánh Hòa", "type": 2, "capital": false, "aggregation": { "population": 1200000, "happyRate": 7.3 } },
      { "id": 9, "code": "QN", "name": "Quảng Ninh", "type": 2, "capital": false, "aggregation": { "population": 1300000, "happyRate": 6.7 } },
      { "id": 10, "code": "GL", "name": "Gia Lai", "type": 2, "capital": false, "aggregation": { "population": 1400000, "happyRate": 7.1 } },
      { "id": 11, "code": "AG", "name": "An Giang", "type": 2, "capital": false, "aggregation": { "population": 1900000, "happyRate": 6.6 } },
      { "id": 12, "code": "BRVT", "name": "Bà Rịa - Vũng Tàu", "type": 2, "capital": false, "aggregation": { "population": 1200000, "happyRate": 7.4 } },
      { "id": 13, "code": "BG", "name": "Bắc Giang", "type": 2, "capital": false, "aggregation": { "population": 1700000, "happyRate": 6.5 } },
      { "id": 14, "code": "BK", "name": "Bắc Kạn", "type": 2, "capital": false, "aggregation": { "population": 320000, "happyRate": 6.3 } },
      { "id": 15, "code": "BL", "name": "Bạc Liêu", "type": 2, "capital": false, "aggregation": { "population": 900000, "happyRate": 7.0 } },
      { "id": 16, "code": "BN", "name": "Bắc Ninh", "type": 2, "capital": false, "aggregation": { "population": 1200000, "happyRate": 6.9 } },
      { "id": 17, "code": "BT", "name": "Bến Tre", "type": 2, "capital": false, "aggregation": { "population": 1500000, "happyRate": 6.8 } },
      { "id": 18, "code": "BĐ", "name": "Bình Định", "type": 2, "capital": false, "aggregation": { "population": 1600000, "happyRate": 7.2 } },
      { "id": 19, "code": "BP", "name": "Bình Phước", "type": 2, "capital": false, "aggregation": { "population": 1000000, "happyRate": 6.6 } },
      { "id": 20, "code": "BTN", "name": "Bình Thuận", "type": 2, "capital": false, "aggregation": { "population": 1200000, "happyRate": 7.1 } },
      { "id": 21, "code": "CM", "name": "Cà Mau", "type": 2, "capital": false, "aggregation": { "population": 1200000, "happyRate": 6.7 } },
      { "id": 22, "code": "CB", "name": "Cao Bằng", "type": 2, "capital": false, "aggregation": { "population": 530000, "happyRate": 6.4 } },
      { "id": 23, "code": "DDT", "name": "Điện Biên", "type": 2, "capital": false, "aggregation": { "population": 600000, "happyRate": 6.2 } },
      { "id": 24, "code": "DL", "name": "Đắk Lắk", "type": 2, "capital": false, "aggregation": { "population": 1900000, "happyRate": 7.3 } },
      { "id": 25, "code": "DKN", "name": "Đắk Nông", "type": 2, "capital": false, "aggregation": { "population": 640000, "happyRate": 6.5 } },
      { "id": 26, "code": "DB", "name": "Đồng Nai", "type": 2, "capital": false, "aggregation": { "population": 3100000, "happyRate": 7.0 } },
      { "id": 27, "code": "DT", "name": "Đồng Tháp", "type": 2, "capital": false, "aggregation": { "population": 1600000, "happyRate": 6.8 } },
      { "id": 28, "code": "GLA", "name": "Gia Lai", "type": 2, "capital": false, "aggregation": { "population": 1400000, "happyRate": 7.1 } },
      { "id": 29, "code": "HG", "name": "Hà Giang", "type": 2, "capital": false, "aggregation": { "population": 880000, "happyRate": 6.3 } },
      { "id": 30, "code": "HNA", "name": "Hà Nam", "type": 2, "capital": false, "aggregation": { "population": 850000, "happyRate": 6.5 } }
    ];
    settings.pageSetting.pageSize = 15;
    settings.dataSource = [];
    //settings.baseService = inject(MockDataService);
    settings.baseService = inject(CitiesService);
    settings.fields = 'created';
    super(settings, {})
  }
}
