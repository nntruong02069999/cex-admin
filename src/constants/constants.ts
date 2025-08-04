import { FIVE_D_GAME_DIGIT, GAME_RESULT_SIDE_WINNER, WINGO_TIME_CONFIG } from "./enums"

export const COLORS = [
  'magenta',
  'red',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
]

export const DATA_TYPES = ['string', 'number', 'date', 'boolean']
export const DISPLAY = ['image']
export const DEFAULT_MODEL_SELECT_FIELD = 'id,name'
export const DEFAULT_PAGE_EDITOR_ID = process.env.REACT_APP_PAGE_EDITOR_ID
  ? Number(process.env.REACT_APP_PAGE_EDITOR_ID)
  : 4
export const DEFAULT_PAGE_SETTING_ID = process.env.REACT_APP_PAGE_SETTING_ID
  ? Number(process.env.REACT_APP_PAGE_SETTING_ID)
  : 48
export const IS_DEBUG = process.env.IS_DEBUG


export const ARRAY_WINGO_TIME_CONFIGS = [
  { label: "1 Phút", value: WINGO_TIME_CONFIG.MINUTES_1 },
  { label: "3 Phút", value: WINGO_TIME_CONFIG.MINUTES_3 },
  { label: "5 Phút", value: WINGO_TIME_CONFIG.MINUTES_5 },
  { label: "10 Phút", value: WINGO_TIME_CONFIG.MINUTES_10 },
  { label: "30 Giây", value: WINGO_TIME_CONFIG.SECONDS_30 },
];

export const renderBgColor = (i: number) => {
  if (i === 0) {
    return 'linear-gradient(to right,#e74c3c 50%, #9b59b6 50%)';
  } else if (i === 5) {
    return 'linear-gradient(to right,#27ae60 50%, #9b59b6 50%)';
  } else if (i % 2 === 0) {
    return '#e74c3c';
  } else {
    return '#27ae60';
  }
}

export const ARRAY_UNIT_DIGITS = Array.from({ length: 10 }, (_, i) => {

  const backgroundColor = renderBgColor(i);

  return ({
    id: i + 1,
    name: i.toString(),
    value: i,
    backgroundColor: backgroundColor,
  })
});

export const ARRAY_FIVE_D_GAME_DIGITS = [
  { id: 1, label: FIVE_D_GAME_DIGIT.A, value: FIVE_D_GAME_DIGIT.A },
  { id: 2, label: FIVE_D_GAME_DIGIT.B, value: FIVE_D_GAME_DIGIT.B },
  { id: 3, label: FIVE_D_GAME_DIGIT.C, value: FIVE_D_GAME_DIGIT.C },
  { id: 4, label: FIVE_D_GAME_DIGIT.D, value: FIVE_D_GAME_DIGIT.D },
  { id: 5, label: FIVE_D_GAME_DIGIT.E, value: FIVE_D_GAME_DIGIT.E },
];

export const DEFAULT_ERROR_MESSAGE = 'Hệ thống đang bận vui lòng thực hiện sau'

export const CURRENCY = '$'

export const DEFAULT_PAGINATION = {
  skip: 0,
  limit: 10,
  total: 0,
  totalPage: 0,
  page: 1,
}

export const SECONDS_TO_DISABLE_SET_RESULT_GAME = 10

export const ARRAY_GAME_RESULT_SIDE_WINNERS = [
  { id: 1, name: "Mua", value: GAME_RESULT_SIDE_WINNER.BUY },
  { id: 2, name: "Bán", value: GAME_RESULT_SIDE_WINNER.SELL },
];