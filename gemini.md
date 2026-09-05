# auth-toolkit 기술 분석 및 리팩토링 상세 가이드 (gemini.md)

본 문서는 `auth-toolkit` 시스템의 안정성, 보안성, 유지보수성을 극대화하기 위한 상세 기술 분석 및 코드 리팩토링 가이드입니다.

---

## 1. 긴급 조치: 보안 및 크리티컬 런타임 결함

### 1.1 SQL Injection 취약점 제거
- **파일**: `backend/routes/order.js`
- **문제점**:
  - `router.post("/orderinput")` (라인 65~69, 98~102): `O.${order[1][0]}` 등 사용자 입력 배열을 쿼리 문자열에 직접 보간
  - `router.post("/inputRepair")` (라인 245~247): `insert into ordersheet (..., ${rep.month}, ...) value ('${rep.itemName}', ...)` 문자열 결합
- **해결 방안**:
  - 컬럼명 화이트리스트 검증(허용된 월 필드만 통과)
  - 값 전달 시 Sequelize 파라미터화 바인딩(`replacements`) 사용 또는 정적 ORM 모델 사용

### 1.2 DB 비밀번호 및 거래처 민감정보 분리
- **파일**: `backend/config/config.json`, `src/containers/excels/export/*.tsx`
- **문제점**:
  - `config.json`에 MySQL root 비밀번호 노출
  - 엑셀 컨테이너 소스 코드 내 거래처(수출자/바이어) 상호, 주소, 담당자 이메일/연락처 하드코딩
- **해결 방안**:
  - `config.json` 대신 `config.js`로 변경하여 `dotenv` 환경변수(`process.env.DB_PASSWORD`) 참조
  - 거래처 정보는 시스템 환경변수 또는 별도 `company_settings` 테이블/JSON 설정으로 분리

### 1.3 백엔드 비동기 처리 누락 (`Array.map(async)`) 수정
- **파일**: `backend/routes/item.js`, `backend/routes/order.js`
- **문제점**:
  - `relations.map(...)`, `Images.map(...)`, `picked.map(...)`, `palletData[i].map(...)` 등에서 비동기 콜백을 await하지 않고 즉시 HTTP 응답 리턴
- **해결 방안**:
  - `bulkCreate` 사용으로 단일 쿼리 일괄 처리:
    ```javascript
    await Relation.bulkCreate(relations, { transaction: t });
    await Image.bulkCreate(images, { transaction: t });
    await Picker.bulkCreate(picked, { transaction: t });
    ```

### 1.4 무한 대기(Hang) 및 응답 누락 버그 수정
- **파일**: `backend/routes/order.js`
  - `router.post("/palletData")`: `try` 블록 내부에 `res.status(...).json(...)`이 누락되어 요청 완료 후 응답이 전송되지 않고 클라이언트 타임아웃 발생
  - `router.post("/inputRepair")`: `return res.status(200);` 호출 시 전송 메소드(`res.send()`/`res.end()`) 누락
- **해결 방안**: 정확한 응답 반환 코드 삽입

### 1.5 런타임 동적 DDL (DROP/CREATE TABLE) 제거
- **파일**: `backend/routes/order.js`
- **문제점**:
  - 매 주문 입력 요청마다 `drop table if exists ordersheet; create table ordersheet (...)` 실행
  - 동시 사용자 접속 시 충돌, 테이블 락, 데이터 유실 발생
- **해결 방안**:
  - 고정 테이블(`Order`와 `OrderItem`) 구조로 정규화하거나 DB View 활용

---

## 2. 백엔드 아키텍처 및 안정성 개선

### 2.1 DB 트랜잭션(Transaction) 도입
- 아이템 등록/수정 시 `Item`, `Image`, `Relation` 테이블 연산을 단일 트랜잭션으로 묶어 원자성(Atomicity) 보장

### 2.2 공통 에러 핸들링 및 일관된 API 응답 포맷
- 현재 문자열(`"join_ok"`), 객체, 단순 텍스트가 혼재된 응답 구조를 표준 포맷으로 통일:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null
  }
  ```
- 글로벌 에러 미들웨어(`app.use((err, req, res, next) => ...)`) 구축

### 2.3 인증 미들웨어 및 세션 보안 강화
- 비로그인 상태에서 `req.user` 접근으로 인한 서버 크래시 방지용 `isLoggedIn`, `isNotLoggedIn` 미들웨어 구현
- Multer 파일 업로드 시 UUID 파일명 적용 및 MIME 타입 화이트리스트 검증 추가

---

## 3. 프론트엔드 상태 관리 및 런타임 버그 개선

### 3.1 가격 연산 버그 (`NaN`) 및 라이프사이클 수정
- **파일**: `src/containers/home/HomeContainer.tsx`
  - 라인 50~60: `else` 분기에서 `acc[curr.targetId] = price + acc[curr.targetId]` 연산으로 `undefined + number = NaN` 발생 버그 수정 -> `acc[curr.targetId] = price`
  - 빈 의존성 배열(`[]`)로 인해 초기 렌더링 시 관계 데이터 주입이 누락되는 현상 수정
- **파일**: `src/containers/auth/containers/LoginContainer.tsx`
  - 의존성 배열 누락 `useEffect` 수정 및 `setTimeout` 클린업 함수(`clearTimeout`) 추가

### 3.2 Redux Toolkit 단순화 & Redux-Saga 전환
- RTK와 Saga를 이중으로 사용하는 보일러플레이트 제거
- RTK 내장 `createAsyncThunk` 또는 `RTK Query`로 비동기 로직 일원화
- `FormData` 등 비직렬화(Non-serializable) 객체를 Redux 액션 페이로드에 전달하지 않고 API 모듈 내부에서 구성

### 3.3 TypeScript 정적 타입 안전성 확보
- `[key: string]: any` 인덱스 시그니처 남용 제거
- 도메인 모델(`Item`, `Good`, `Relation`, `Order`, `Pallet`)을 `src/types/`에 명확히 정의

### 3.4 엑셀 생성 로직(1,200줄)의 서비스 레이어 분리
- **파일**: `CartonExcelContainer.tsx`, `InvoiceExcelContainer.tsx`
- 컴포넌트 내부에 거대하게 결합된 셀 스타일링/좌표 세팅 로직을 `src/lib/services/excel/` 하위의 순수 TypeScript 함수로 분리

---

## 4. 알고리즘 & 성능 최적화

### 4.1 O(N×M) 중첩 순회 -> O(1) Map 기반 탐색
- **파일**: `src/lib/utils/createRelateData.ts`, `src/containers/r-settings/RsettingContainer.tsx`
- `items.filter(i => i.id === id).map(...)[0]` 중첩 호출을 `new Map(items.map(i => [i.id, i]))` 기반 O(1) 조회로 개선하여 BOM 트리 순회 및 렌더링 속도 대폭 향상

---

## 5. UI/UX 및 디자인 시스템 개편

1. **디자인 토큰 통일**:
   - 전문 B2B ERP/SCM 시스템에 맞는 차분하고 신뢰감 있는 Slate/Blue 테마 적용
   - 버튼/카드/입력창 스타일을 통일된 컴포넌트로 규격화
2. **스타일 도구 일원화**:
   - SCSS + styled-components + 인라인 스타일 3중 혼용 해소
3. **고정 좌표 드래그 모달 개선**:
   - 해상도 변경 시 모달이 화면 밖으로 벗어나는 문제 해결을 위해 탭 인터페이스 또는 반응형 슬라이드 패널/다이얼로그로 전환
