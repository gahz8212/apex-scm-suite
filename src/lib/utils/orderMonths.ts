/**
 * 발주(orders) 및 오더시트(ordersheet) 월(Month) 추출 유틸리티
 * 
 * 실무 SCM에서 발주서(orders)는 1년(Jan~Dec) 전체가 아닌,
 * 특정 시점 기준 5~6개월치 롤링 데이터(예: Sep~Jan, 또는 Oct~Feb)만 입력됩니다.
 * 따라서 시스템 달력에 고정하지 않고, 입력된 데이터의 첫 번째 월부터
 * 존재하는 5~6개월의 월 컬럼을 순서대로 추출합니다.
 */

export const ALL_MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MONTH_SET = new Set(ALL_MONTH_NAMES);

/**
 * 데이터 행 객체(orders 또는 ordersheet 행)에서
 * 입력된 순서 그대로 5~6개월의 월 컬럼 목록을 추출합니다.
 * 
 * 예: 
 * - Sep부터 입력된 경우: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan']
 * - Oct부터 입력된 경우: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb']
 * 
 * @param dataRow 발주/오더시트 행 데이터
 * @param maxCount 최대 추출 개월 수 (기본값: 6개월)
 */
export const extractOrderMonths = (dataRow?: Record<string, any>, maxCount: number = 6): string[] => {
  if (!dataRow) return [];

  // dataRow의 키 중 영문 월 이름(3자리)에 해당하는 키들을 입력 순서대로 추출
  const monthKeys = Object.keys(dataRow).filter(key => MONTH_SET.has(key));

  if (monthKeys.length === 0) return [];
  return monthKeys.slice(0, maxCount);
};
