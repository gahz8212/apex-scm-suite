/**
 * 통화 기호 포맷 유틸리티
 * 데이터베이스 또는 레거시 인코딩에서 역슬래시('\')로 저장된 원화 기호를 표준 '₩' 기호로 변환합니다.
 */
export const formatCurrencySymbol = (unit?: string): string => {
  if (!unit || unit === '\\' || unit === '￦') {
    return '₩';
  }
  return unit;
};
