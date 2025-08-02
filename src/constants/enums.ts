export enum GRID_EDITOR_FIELD {
  NAME = 'name',
  FIELD = 'field',
  TYPE = 'type',
  FIELD_TYPE = 'fieldType',
  WIDTH = 'width',
  ENUMABLE = 'enumable',
  ITEMS = 'items',
  MODE_SELECT = 'modelSelect',
  MODE_SELECT_API = 'modelSelectApi',
  DISPLAY = 'display',
  FILTERABLE = 'filterable',
  BIND_BUTTON = 'bindButton',
  FILTER_RANGE = 'filterRange',
  SORTER = 'sorter',
  HIDE_IN_TABLE = 'hideInTable',
  HIDE_IN_SETTING = 'hideInSetting',
  // HIDE_IN_SEARCH = 'hideInSearch',
  FILTERS = 'filters', // lọc trên cột
  FIXED = 'fixed',
  COPYABLE = 'copyable',
  ELLIPSIS = 'ellipsis',
  MENU_BUTTON = 'menuButton',
  MENU_BUTTON_CONDITION = 'menuButtonConditon',
  VIEW_DETAIL = 'viewDetail',
  VIEW_DETAIL_CTRL = 'viewDetailCtrl',
}

export enum DATA_TYPE {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
}

export enum DISPLAY_TYPE {
  MONEY = 'money',
  TEXTAREA = 'textarea',
  OPTION = 'option',
  DATE = 'date',
  DATE_RANGE = 'dateRange',
  DATE_TIME_RANGE = 'dateTimeRange',
  DATE_TIME = 'dateTime',
  TIME = 'time',
  TEXT = 'text',
  INDEX = 'index',
  INDEX_BORDER = 'indexBorder',
  PROGRESS = 'progress',
  PERCENT = 'percent',
  DIGIT = 'digit',
  AVATAR = 'avatar',
  CODE = 'code',
  SWITCH = 'switch',
  RADIO = 'radio',
  RADIO_BUTTON = 'radioGroup',
  HTML = 'html',
  PASSWORD = 'password',
}

export enum WINGO_TIME_CONFIG {
  SECONDS_30 = "SECONDS_30",
  MINUTES_1 = "MINUTES_1",
  MINUTES_3 = "MINUTES_3",
  MINUTES_5 = "MINUTES_5",
  MINUTES_10 = "MINUTES_10",
}


export enum FIVE_D_GAME_DIGIT {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
}

export enum GAME_RESULT_SIDE_WINNER {
  BUY = "BUY",
  SELL = "SELL",
}

export enum GAME_RESULT_GENERATION_TYPE {
  RANDOM = "RANDOM",
  WHEN_SIDE_BIGGER_THAN_OTHER_X_VALUE = "WHEN_SIDE_BIGGER_THAN_OTHER_X_VALUE",
  WHEN_HOUSE_LOSS_BIGGER_THAN_X_VALUE = "WHEN_HOUSE_LOSS_BIGGER_THAN_X_VALUE",
  BOTH_SIDE_AND_HOUSE_LOSS_BIGGER_THAN_X_VALUE = "BOTH_SIDE_AND_HOUSE_LOSS_BIGGER_THAN_X_VALUE",
}

export enum GAME_STATE {
  WAITING = "WAITING",
  COMPLETED = "COMPLETED",
}
