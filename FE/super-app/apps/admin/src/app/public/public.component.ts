import { Component, OnInit } from '@angular/core';
import { AeFormComponent, createContainer, createDatePicker, createDropdown, createTable, createTextBox, IFormField, ObjectType } from '@super-app/shared';
import { Apollo, gql } from 'apollo-angular';
import { StreamingService } from '../../services/streaming.service';

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss'],
  standalone: true,
  imports: [AeFormComponent]
})
export class PublicComponent implements OnInit {
  formSchemas: IFormField[] = [
    createTextBox('test2'),
    createTextBox('test', {
      label: 'Tên',
      placeholder: 'Nhập tên',
    }),
    createDropdown('test2', {
      label: 'Dropdown',
      options: [
        { id: 1, ten: 'Một' },
        { id: 2, ten: 'Hải' }
      ]
    }),
    createContainer([
      createDatePicker('child1'),
      createDropdown('child2', {
        options: [
          { id: 1, ten: 'Ba' },
          { id: 2, ten: 'Bốn' }
        ]
      }),
    ], {
      label: 'container controls'
    }),
    createTable([
      createDatePicker('child1'),
      createDropdown('child2', {
        options: [
          { id: 1, ten: 'Năm' },
          { id: 2, ten: 'Sáu' }
        ]
      }),
    ])
  ];
  formData: ObjectType = {};
  constructor(
    private readonly _apollo: Apollo,
    private readonly _streamingService: StreamingService
  ) {
  }
  ngOnInit() {
    console.log('public comp');
    this._apollo.watchQuery({
      query: gql`
      {
        city(code: "NY") { 
          id
          name
        }
        aV: villages(cityCode: "NY") {
          id
          name
        }
        allVillages {
          id
          name
        }
      }
      `
    }).valueChanges.subscribe({
      next: (response) => {
        const data = <any>response.data;
        // Xử lý city
        const city = data.city;
        console.log("City:", city);

        // Xử lý villages (nếu có)
        const villages = data.villages;
        console.log("Villages:", villages);

        // Xử lý allVillages (streaming, sẽ trả dữ liệu dần dần)
        const allVillages = data.allVillages;
        allVillages.forEach((village: any) => {
          console.log("Village (streamed):", village);
        });
      },
      error: (err) => {
        console.error("Error:", err);
      },
    });
    // .valueChanges.subscribe((result: any) => {
    //   console.log(result);
    // });
    // this._streamingService.getStream().subscribe(ob => {
    //   console.log(ob);
    // });
  }

  addSchema() {
    this.formSchemas = [
      ...this.formSchemas,
      createTextBox('test'),
      createTextBox('test23')
    ];
  }

  ediSchema() {
    const c = createTextBox(this.formSchemas[0].field, this.formSchemas[0]);
    c.label = 'Tên đầy đủ';
    const b = this.formSchemas.slice(1);
    b.unshift(c);
    this.formSchemas = b;
  }
}
