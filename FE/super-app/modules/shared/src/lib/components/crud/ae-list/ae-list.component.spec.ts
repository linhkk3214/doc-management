import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateStore } from '@ngx-translate/core';
import { AeListComponent, DataSourceChain } from './ae-list.component';
import { createDropdown, DataSource } from '../../../classes/model/form-model';

describe('AeListComponent', () => {
  let component: AeListComponent;
  let fixture: ComponentFixture<AeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AeListComponent, TranslateModule.forRoot()],
      providers: [TranslateStore]
    }).compileComponents();

    fixture = TestBed.createComponent(AeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('buildChain', () => {
    it('should handle empty asyncDataSourceCols', () => {
      // Arrange
      const currentLevel = new DataSourceChain();
      const asyncDataSourceCols: DataSource[] = [];

      // Act
      component.buildChain(currentLevel, asyncDataSourceCols);

      // Assert
      expect(currentLevel.fields.length).toBe(0);
      expect(currentLevel.next).toBeUndefined();
    });

    it('should handle missing parent fields', () => {
      // Arrange
      const currentLevel = new DataSourceChain();
      const asyncDataSourceCols: DataSource[] = [
        {
          ...createDropdown('field2', {
            label: 'Field 2',
            parrentFields: [{ field: 'field1', valueField: 'id' }]
          }),
        } as DataSource
      ];

      // Act
      component.buildChain(currentLevel, asyncDataSourceCols);

      // Assert
      expect(currentLevel.fields.length).toBe(0);
      expect(currentLevel.next).toBeUndefined();
      expect(asyncDataSourceCols.length).toBe(1);
    });

    it('should build chain correctly with single level dependencies', () => {
      // Arrange
      const currentLevel = new DataSourceChain();
      const asyncDataSourceCols: DataSource[] = [
        createDropdown('field1', {
          label: 'Field 1',
          parrentFields: []
        }) as DataSource,
        createDropdown('field2', {
          label: 'Field 2',
          parrentFields: [{ field: 'field1', valueField: 'id' }]
        }) as DataSource
      ];
      // Act
      component.buildChain(currentLevel, asyncDataSourceCols);
      console.log(currentLevel);
      // Assert
      expect(currentLevel.fields.length).toBe(1);
      expect(currentLevel.fields[0].field).toBe('field1');
      expect(currentLevel.next?.fields.length).toBe(1);
      expect(currentLevel.next?.fields[0].field).toBe('field2');
      expect(asyncDataSourceCols.length).toBe(0);
    });

    it('should build chain correctly with multiple level dependencies', () => {
      // Arrange
      const currentLevel = new DataSourceChain();
      const asyncDataSourceCols: DataSource[] = [
        createDropdown('field1', {
          label: 'Field 1'
        }) as DataSource,
        createDropdown('field2', {
          label: 'Field 2'
        }) as DataSource,
        createDropdown('field5', {
          label: 'Field 5',
          parrentFields: [
            { field: 'field1', valueField: 'id' },
            { field: 'field2', valueField: 'id' }
          ]
        }) as DataSource,
        createDropdown('field6', {
          label: 'Field 6',
          parrentFields: [
            { field: 'field1', valueField: 'id' },
            { field: 'field2', valueField: 'id' },
            { field: 'field5', valueField: 'id' }
          ]
        }) as DataSource,
        createDropdown('field7', {
          label: 'Field 7',
          parrentFields: [
            { field: 'field1', valueField: 'id' },
            { field: 'field3', valueField: 'id' }
          ]
        }) as DataSource,createDropdown('field8', {
          label: 'Field 8',
          parrentFields: [
            { field: 'field1', valueField: 'id' },
            { field: 'field7', valueField: 'id' }
          ]
        }) as DataSource,createDropdown('field9', {
          label: 'Field 9',
          parrentFields: [
            { field: 'field5', valueField: 'id' },
            { field: 'field6', valueField: 'id' }
          ]
        }) as DataSource,
        createDropdown('field3', {
          label: 'Field 3'
        }) as DataSource,
        createDropdown('field4', {
          label: 'Field 4'
        }) as DataSource,
      ];

      // Act
      component.buildChain(currentLevel, asyncDataSourceCols);

      // Assert
      expect(currentLevel.fields.map(q => q.field)).toEqual(['field1', 'field2', 'field3', 'field4']);
      expect(currentLevel.next?.fields.map(q => q.field)).toEqual(['field5', 'field7']);
      expect(currentLevel.next?.next?.fields.map(q => q.field)).toEqual(['field6', 'field8']);
      expect(currentLevel.next?.next?.next?.fields.map(q => q.field)).toEqual(['field9']);
      expect(asyncDataSourceCols.length).toBe(0);
    });
  });
});

