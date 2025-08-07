export enum FormState {
    ADD,
    EDIT
}

export enum FieldVisibility {
    NONE,
    FORM,
    VIEW,
    LIST,
}

export enum DataType {
    date = 'date',
    datetime = 'datetime',
    html = 'html',
    string = 'string',
    int = 'int',
    decimal = 'decimal',
    boolean = 'boolean',
    enum = 'enum',
    object = 'object',
    list = 'list'
}

export enum ControlType {
    label = 0,
    autocomplete,
    combobox,
    datetime,
    datetimeRange,
    date,
    time,
    number,
    numberRange,
    textbox,
    textarea,
    editor,
    checkbox,
    switch,
    radio,
    colorPicker,
    address,
    chips,
    container,
    table
}

export enum HeightType {
    default = 0,
    dynamic = -1,
    custom = 1
}

export enum FileManagerMode {
    single = 'single',
    multiple = 'multiple'
}

export enum TextAlign {
    Left = 0,
    Center = 1,
    Right = -1
}