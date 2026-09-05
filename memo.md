# 🚀 APEX SCM Suite 프로젝트 관리 및 실행 메모 (memo.md)

이 문서는 `apex-scm-suite` (구 auth-toolkit) 프로젝트를 **크몽 / 위시켓 수주용 포트폴리오 데모**로 완성하기 위한 통합 실무 마일스톤 및 상태 기록 문서입니다.

---

## 📌 프로젝트 개요 및 현재 상태 (2026-09-05 기준)

- **앱 정체성**: "전자제품 제조·무역 회사를 위한 실무형 BOM(자재명세서) 관리 및 수출입 무역 물류 자동화 ERP 시스템"
- **최종 목적**: 상용 SaaS 판매가 아닌 **크몽 / 위시켓 외주 수주용 '포트폴리오 데모 쇼케이스'**
  - "19년 현업 실무자가 직접 기획/구현한 말이 통하는 개발자"로서의 독보적 차별화
  - 의뢰인 대상 시연 시 뻗지 않는 견고함 + 불필요한 군더더기가 없는 전문 B2B 도구의 완성도 확보
- **새 깃허브 저장소**: [`https://github.com/gahz8212/apex-scm-suite.git`](https://github.com/gahz8212/apex-scm-suite.git) (푸시 완료)
- **로컬 실행 환경 구축 완료**:
  - Docker 기반 MySQL 8.0 컨테이너 (`apex_scm_db`, 포트 3306) 정상 가동 중
  - 백엔드/프론트엔드 `node_modules` 설치 및 프로덕션 빌드 통과 완료
  - B2B 실무 샘플 데이터 전면 주입 완료 (`npm run seed`)
  - **테스트 데모 계정**: `demo@apex-scm.io` / `password123!`

---

## 🎨 UI/UX 디자인 기본 원칙 (★합의 완료)
> **"임의로 꾸미지 않는다. 명확한 엔터프라이즈 B2B 레퍼런스를 확정하고, 불필요한 요소를 전면 덜어내는(Minus) 디자인부터 시작한다."**

1. **디자인 레퍼런스 확정 후 작업 착수**
   - 글로벌 무역·물류 유니콘 **Flexport** 또는 전문 B2B 업무 도구 **Linear / Retool** 스타일을 벤치마크 표준으로 설정
   - 쓸데없는 그라데이션, 화려한 이모지/애니메이션 배제하고 **극도의 간결함(Clean) & 높은 데이터 밀도(High Density)** 지향
2. **화면 군더더기 전면 청소 (UI Audit)**
   - 쓸데없는 장난감 아이콘/애니메이션 영구 삭제 (로고 180도 회전, 고양이/기사 그래픽 등)
   - 불필요하고 장황한 설명 문구 제거
   - 화면 곳곳에 분산된 중복 버튼 및 형광/원색 배경(노란색, 빨간색 등) 제거
   - 홈 화면의 의미 없는 2,000px 더미 스크롤 박스 제거
3. **레이아웃 구조화 및 컴포넌트 규격화**
   - 화면 위를 어지럽게 떠다니는 드래그 팝업창들 ➔ **상단 탭(Tab)** 또는 **우측 슬라이드 패널(Drawer)**로 단정하게 정리
   - 감으로 짠 CSS 대신 검증된 B2B 컴포넌트 시스템(`shadcn/ui` or `Ant Design` 스타일) 규격 준용

---

## 📋 단계별 실행 체크리스트

### ✅ Phase 1. 긴급 보안 패치 & 치명적 버그 해결 (완료)
- [x] **[법적 리스크 차단] 이전 회사 정보 및 실무 데이터 비식별화 (더미화)**
  - [x] 은기전자, D.T. SYSTEMS 상호, 실제 사업장 주소, 담당자 이메일/전화번호를 가상 데이터(`NEXUS ELECTRONICS`, `GLOBAL DYNAMICS`)로 전면 교체
  - [x] 헤더 은기전자 로고 교체(`NEXUS BOM ERP` 텍스트 브랜딩) 및 장난감 회전 애니메이션 제거
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
- [x] **Docker MySQL 데이터베이스 구축 및 실무 샘플 데이터 시딩**
  - [x] `docker-compose.yml` 생성 및 MySQL 8.0 컨테이너 자동 가동
  - [x] `backend/seed.js` 스크립트 작성 및 18개 품목, 19개 BOM 관계, 발주서, 팔레트, 피커 시딩 완료
- [x] **새 깃허브 레포지토리(`apex-scm-suite`) 깨끗한 첫 커밋 푸시 완료**

---

### ✅ Phase 2. 데이터 흐름 안정화 & 알고리즘 최적화 (완료)
> **목표**: 코드 퀄리티를 시니어급으로 끌어올리고, BOM 트리 렌더링 속도 개선 및 거대 컴포넌트 분리
- [x] **BOM 트리 순회 알고리즘 최적화**
  - [x] `src/lib/utils/createRelateData.ts`의 O(N×M) 중첩 filter 반복을 `Map` 기반 O(1) 조회로 전면 리팩토링 (BOM 화면 로딩 및 가격 계산 속도 극대화)
  - [x] `src/lib/utils/returnTotalPrice.ts`의 O(N×M) 탐색을 `Map` 기반 O(N+M)으로 최적화 및 `NaN` 가격 계산 버그 수정
  - [x] `src/containers/r-settings/RsettingContainer.tsx`의 하위 부품 매핑 로직을 `Map` 기반 O(1) 조회로 개선
- [x] **거대 엑셀 생성 로직의 서비스 레이어 분리 (컴포넌트 다이어트)**
  - [x] `CartonExcelContainer.tsx` (1,200줄 ➔ 34줄)에서 ExcelJS 생성 로직을 `src/lib/services/excel/cartonService.ts`로 추출
  - [x] `InvoiceExcelContainer.tsx` (959줄 ➔ 34줄)에서 ExcelJS 생성 로직을 `src/lib/services/excel/invoiceService.ts`로 추출
  - [x] 컴포넌트는 다운로드 버튼 UI 및 로딩 상태 제어만 담당하도록 95% 이상 코드 경량화
- [x] **불필요한 레거시/임시 파일 정리**
  - [x] 루트의 `test.js` 삭제
  - [x] `src/lib/utils/createRelateData copy.ts` 미사용 파일 삭제 및 `EditFormContainer.tsx` 참조 정상화
- [x] **프로덕션 빌드 통과 검증 완료 (`npm run build`)**

---

### ✅ Phase 3. UI/UX 청소 및 B2B 레퍼런스 스타일링 (완료)
> **목표**: 화려한 장식 없이, Flexport/Retool 스타일의 정갈하고 전문적인 엔터프라이즈 업무 화면 구축
- [x] **1단계: 화면 청소 (불필요 요소 영구 삭제)**
  - [x] 미사용 장난감 에셋(`knight.png`, `cat1.png`) 제거
  - [x] 화면 곳곳의 노란색(`yellow`), 연노랑(`lightyellow`), 연두색(`yellowgreen`), 분홍색(`pink`) 및 빨간색 3px 테두리 전면 제거
  - [x] 로그인 화면, 헤더, 네비게이션 바의 브랜드명을 `APEX SCM SUITE`로 통일
- [x] **2단계: 레이아웃 구조화 & 모달 안전성 확보**
  - [x] `formSlice.ts`의 기본 모달 좌표를 화면 규격에 맞게 조정 (팔레트 1400px 오프스크린 버그 수정)
  - [x] `ExportComponent`, `RsettingComponent`, `IsettingComponent` 내 `useDrag`에 뷰포트 경계 클램핑(Boundary Clamping)을 적용하여 모달이 화면 밖으로 벗어나는 문제 원천 차단
- [x] **3단계: 정갈한 B2B 스타일 완성**
  - [x] 글로벌 Pretendard 폰트 스택 및 Slate/Zinc 모노톤 테마 적용 (`index.css`)
  - [x] 전문 엔터프라이즈 ERP에 걸맞은 소프트 카테고리 뱃지 및 통일된 버튼 시스템 적용
- [x] **프로덕션 빌드 통과 검증 완료 (`npm run build`)**

---

### ✅ Phase 4. 무역 물류(Export Logistics) & 팔레트(Pallet) 실무 기능 고도화 (2026-09-05)
> **목표**: 실무자가 사용하기에 자연스러운 Pallet D&D 적재 로직 완성 및 Export Logistics 화면 제어 안정화

- [x] **1. 발주서 월(Month) 탭 동적 표시 및 순서 보존**
  - [x] 발주서에 최초 입력된 월부터 입력 순서를 유지하며 동적으로 라디오 탭 생성 (`ExportComponent.tsx`)
- [x] **2. Item Master & Item Picker 필터링 정상화**
  - [x] SET 품목을 제외하고 실제 수리/출고 가능한 부자재만 선택되도록 필터링 및 하드코딩 더미 데이터 정리
- [x] **3. Export Logistics 화면 레이아웃 & 모달 계층 구조 개선**
  - [x] `<, >` 화면 전환 화살표를 폼 좌우에 일치하도록 정렬 (`export.scss`)
  - [x] 좌측 전환 화면 타이틀 명칭을 `제품`에서 실무에 맞는 `부자재`로 변경
  - [x] Invoice, Packing, Pallet 모달이 우측 폼과 겹칠 때 위에 올라오도록 z-index 스택 및 클릭 시 최상단 활성화(`bringToFront`) 구현
- [x] **4. Pallet(팔레트) 드래그 앤 드롭 & 수량 제어 로직 완성 (★검증 완료)**
  - [x] Pallet 폼의 하드코딩 시드 데이터 전면 제거 (Packing 폼에서 D&D로만 입력받도록 순수화)
  - [x] 품목별 인덱스(`itemIndex`) 타겟팅 버그 수정: 아래 품목의 +/- 버튼을 눌러도 상단 품목이 변경되던 현상 해결
  - [x] Packing ➔ Pallet 드랍 시 잔여 카톤 수량 차감 계산:
    - Packing의 카톤이 19개이고 이미 Pallet에 5개가 담겨있을 때, 추가 드랍 시 14개(19-5)로 자동 계산되어 적재
  - [x] `+` 버튼 카톤 수량 상한선 제한:
    - Pallet의 카톤 수량이 Packing 원본 카톤 수량에 도달하면 `+` 버튼이 더 이상 눌리지 않도록 방어 로직 적용
  - [x] 사용자 직접 테스트 및 실무 기능 동작 검증 완료
- [x] **5. Export Logistics 우측 출고 폼 분석 및 초기화(원복) 이력**
  - [x] **초기 소스 코드 구조 분석**:
    - 원래 우측 화면의 두 폼(`modelTable`, `partsTable`)은 발주서의 제품이 아니라 **Item Master에서 선택한 부자재(`pickedData`)만** 출력되는 구조였음 확인.
  - [x] **제품 표시 및 편집 기능 작업 경과**:
    - 좌측 발주서의 제품 목록(`productPackingData`)을 우측 출고 폼 상단에 연동하고, 수량/CBM 편집 및 헤더 위치 정렬 작업을 진행함.
    - 헤더-데이터 오른쪽 끝 정렬 작업 중 사용자 요청에 따라 Export Logistics 메뉴 관련 파일들을 작업 전 안정 시점([`a20a7b3`](file:///home/gahz/apex-scm-suite/src/containers/export/ExportComponent.tsx))으로 깨끗하게 원복(`0c9e410`) 완료.
  - [x] **현재 상태**:
    - 팔레트 핵심 기능(카톤 차감 및 상한선 제한)은 손실 없이 온전히 보존됨.
    - Export Logistics 화면은 이전 안정 상태를 유지하고 있으며, 필요 시 제품/부자재 통합 폼을 완벽한 정렬로 재구성할 준비 완료.

---

## 💡 최종 완료 후 전환 방법
모든 작업(Phase 2, 3, 4)이 완료되어 최종 푸시되면, 기존 작업 폴더 대신:
```bash
git clone https://github.com/gahz8212/apex-scm-suite.git
```
한 번만 실행하시면 완전히 새롭고 깨끗한 **`apex-scm-suite`** 환경에서 최종 결과물을 영구 소장 및 시연하실 수 있습니다.
