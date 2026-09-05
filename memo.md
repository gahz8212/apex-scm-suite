# 리팩토링 검토 및 실행 메모 (memo.md)

이 문서는 `auth-toolkit` 프로젝트의 리팩토링 및 크몽/위시켓 데모 쇼케이스 구축을 위한 실무 검토용 TODO 체크리스트 및 우선순위별 마일스톤 메모입니다.

---

## 📌 앱 정체성 및 최종 목표
- **본질**: "전자제품 제조·무역 회사를 위한 실무형 BOM(자재명세서) 관리 및 수출입 무역 물류 자동화 ERP 시스템"
- **최종 목적**: 상용 SaaS 판매가 아닌 **크몽 / 위시켓 외주 수주용 '포트폴리오 데모 쇼케이스'**
  - "19년 현업 실무자가 직접 기획/구현한 말이 통하는 개발자"로서의 독보적 신뢰도 확보
  - 의뢰인 대상 시연 시 뻗지 않는 견고함 + 불필요한 군더더기가 없는 전문 B2B 도구의 완성도 확보

---

## 🎨 UI/UX 디자인 기본 원칙 (★중요 결정사항)
> **"임의로 꾸미지 않는다. 명확한 엔터프라이즈 B2B 레퍼런스를 확정하고, 불필요한 요소를 전면 덜어내는(Minus) 디자인부터 시작한다."**

1. **디자인 레퍼런스 확정 후 작업 착수**
   - 글로벌 무역·물류 유니콘 **Flexport** 또는 전문 B2B 업무 도구 **Linear / Retool** 스타일을 벤치마크 표준으로 설정
   - 쓸데없는 그라데이션, 화려한 이모지/애니메이션 배제하고 **극도의 간결함(Clean) & 높은 데이터 밀도(High Density)** 지향
2. **화면 군더더기 전면 청소 (UI Audit)**
   - [ ] 쓸데없는 장난감 아이콘/애니메이션 영구 삭제 (로고 180도 회전, 고양이/기사 그래픽 등)
   - [ ] 불필요하고 장황한 설명 문구 제거
   - [ ] 화면 곳곳에 분산된 중복 버튼 및 형광/원색 배경(노란색, 빨간색 등) 제거
   - [ ] 홈 화면의 의미 없는 2,000px 더미 스크롤 박스 제거
3. **레이아웃 구조화 및 컴포넌트 규격화**
   - [ ] 화면 위를 어지럽게 떠다니는 드래그 팝업창들 -> **상단 탭(Tab)** 또는 **우측 슬라이드 패널(Drawer)**로 단정하게 정리
   - [ ] 감으로 짠 CSS 대신 검증된 B2B 컴포넌트 시스템(`shadcn/ui` or `Ant Design` 스타일) 규격 준용

---

## 📋 우선순위별 실행 체크리스트

### Phase 1. 긴급 보안 패치 & 치명적 버그 해결 (완료)
- [x] **[법적 리스크 차단] 이전 회사 정보 및 실무 데이터 비식별화 (더미화)**
  - [x] 은기전자, D.T. SYSTEMS 상호, 실제 사업장 주소, 담당자 이메일/전화번호를 가상 데이터(NEXUS ELECTRONICS, GLOBAL DYNAMICS)로 전면 교체
  - [x] 헤더 은기전자 로고 교체(NEXUS BOM 브랜딩) 및 장난감 회전 애니메이션 제거
- [x] **SQL Injection 방어**
  - [x] `backend/routes/order.js`의 `orderinput` 라우트 파라미터화 바인딩 및 화이트리스트 적용
  - [x] `backend/routes/order.js`의 `inputRepair` 라우트 SQL 인젝션 취약점 수정 (Sequelize 바인딩)
- [x] **비밀번호 및 환경변수 분리**
  - [x] `backend/config/config.json` 평문 암호 제거 & `.env` 기반 동적 로딩 구현 (`backend/.env.example`, `.gitignore` 완료)
- [x] **비동기 처리 누락(await 누락) 버그 수정**
  - [x] `backend/routes/item.js` 내 `Relation`, `Image`, `Picker`의 `bulkCreate` 비동기 대기 전환
  - [x] `backend/routes/order.js` 내 `Item.upsert`, `Pallet.create` 비동기 완료 대기
  - [x] `backend/routes/item.js` 파일 업로드 타임스탬프 파일명 중복 덮어쓰기 방지
- [x] **시연 중 뻗는 서버 무한 대기(Hang) 및 프론트 연산 버그 수정**
  - [x] `backend/routes/order.js`의 `/palletData` 및 `/inputRepair` 응답 누락 버그 수정
  - [x] `src/containers/home/HomeContainer.tsx` 가격 누적 계산의 `undefined + price = NaN` 버그 및 의존성 배열 수정
  - [x] `src/containers/home/HomeComponent.tsx` 2,000px 더미 스크롤 박스 제거 및 환율 카드 정돈
  - [x] `src/containers/auth/containers/LoginContainer.tsx` `useEffect` 무한 렌더링 누락 및 타이머 클린업 수정

---

### Phase 2. 데이터 흐름 안정화 & 알고리즘 최적화
- [ ] **동적 테이블 DDL(DROP/CREATE TABLE) 제거**
  - [ ] 요청 시마다 `ordersheet` 테이블을 드랍하고 재생성하는 불안정한 구조를 고정 테이블/뷰로 전환
- [ ] **BOM 트리 순회 알고리즘 최적화**
  - [ ] `src/lib/utils/createRelateData.ts`의 O(N×M) 중첩 필터링을 `Map` 기반 O(1) 조회로 개선 (렌더링 속도 개선)
- [ ] **엑셀 생성 비즈니스 로직 분리 (1,200줄 컴포넌트 경량화)**
  - [ ] `CartonExcelContainer.tsx`, `InvoiceExcelContainer.tsx`의 엑셀 생성 코드를 `src/lib/services/excel/` 모듈로 분리
  - [ ] 컴포넌트는 다운로드 버튼 UI 및 로딩 상태 제어만 담당

---

### Phase 3. UI/UX 청소 및 레퍼런스 기반 리뉴얼
- [ ] **1단계: 화면 청소 (불필요 요소 제거)**
  - [ ] 장난감 애니메이션, 더미 스크롤 박스, 비표준 원색 배경 제거
  - [ ] 중복 버튼 정리 및 화면 설명 텍스트 압축
- [ ] **2단계: 레퍼런스 확정 및 와이어프레임 합의**
  - [ ] Flexport / Retool / Linear 중 선호 톤앤매너 확정
  - [ ] 화면별 레이아웃 배치안(BOM 관리, 발주/출하, 환율 대시보드) 사전 검토
- [ ] **3단계: 정갈한 B2B 컴포넌트 시스템 적용**
  - [ ] 단정한 폰트(Pretendard), Slate/Zinc 모노톤 테마 적용
  - [ ] 엑셀과 연동되는 정렬된 데이터 그리드 테이블 적용
  - [ ] 반응형 탭 / 사이드 패널(Drawer)로 팝업 모달 통합

---

## 💡 진행 메모 & 참고사항
- 포트폴리오 데모의 성패는 **"19년의 실무 전문성이 돋보이는 군더더기 없는 화면"**과 **"원클릭 엑셀 다운로드 시연의 시각적 충격"**에 달려 있습니다.
- 화려한 꾸미기를 완전히 배제하고, 깔끔한 B2B 도구로 다듬는 데 집중합니다.
