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

### ⏳ Phase 3. UI/UX 청소 및 B2B 레퍼런스 스타일링 (외관 정돈)
> **목표**: 화려한 장식 없이, Flexport/Retool 스타일의 정갈하고 전문적인 엔터프라이즈 업무 화면 구축
- [ ] **1단계: 화면 청소 (불필요 요소 영구 삭제)**
  - [ ] 화면 곳곳의 노란색(`yellow`), 원색 배경, 장난감 이미지(`knight.png`, `cat1.png`) 제거
  - [ ] 장황하고 불필요한 설명 텍스트 압축 및 분산된 중복 버튼 단일 액션 바로 통합
- [ ] **2단계: 레이아웃 구조화 (모달 드래그 ➔ 탭/드로어 통합)**
  - [ ] 마우스로 끌고 다녀야 해서 해상도에 따라 화면 밖으로 벗어나는 드래그 팝업창들 ➔ **상단 탭(Tab)** 또는 **우측 슬라이드 패널(Drawer)**로 모던하게 통합
- [ ] **3단계: 정갈한 B2B 스타일 완성**
  - [ ] 단정한 Pretendard 폰트 및 Slate/Zinc 모노톤 테마 적용
  - [ ] 엑셀과 연동되는 정렬된 데이터 그리드 테이블 구축

---

## 💡 최종 완료 후 전환 방법
모든 작업(Phase 2, 3)이 완료되어 최종 푸시되면, 기존 작업 폴더 대신:
```bash
git clone https://github.com/gahz8212/apex-scm-suite.git
```
한 번만 실행하시면 완전히 새롭고 깨끗한 **`apex-scm-suite`** 환경에서 최종 결과물을 영구 소장 및 시연하실 수 있습니다.
