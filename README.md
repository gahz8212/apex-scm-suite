# 🚀 APEX SCM Suite (BOM & Trade Logistics ERP)

> **제조·무역 실무 기반의 자재명세서(BOM) 관리, 수출입 무역 서류(Invoice/Packing List) 엑셀 자동화 및 출하 물류 솔루션**

---

## 📌 주요 핵심 기능

### 1. 계층형 BOM (Bill of Materials) & 원가 관리
- 단품 부품(`PARTS`), 조립 모듈(`ASSY`), 완제품(`SET`) 간의 부모-자식 계층 관계 및 소요량(`Point`) 트리 관리
- 하위 부품의 수입 단가(`im_price`) 변동 시 상위 모듈 및 완제품의 총 원가(`sum_im_price`), 수출 판매가(`ex_price`) 실시간 자동 연산

### 2. 무역 필수 서류 원클릭 엑셀 자동 발행
- **Commercial Invoice (상업송장)**: 정식 무역 표준 규격(포트, 결제조건, 품목 명세, 단가 및 금액) 엑셀 자동 생성
- **Packing List (포장명세서)**: Carton 단위 품목, 수량, 순중량/총중량(Net/Gross Weight), 체적(CBM) 자동 계산 및 양식 출력

### 3. 출하·적재 물류 최적화 (Pallet & Picker)
- 컨테이너 선적을 위한 **팔레트(Pallet)별 적재 시뮬레이션** 및 CBM/무게 한도 계산
- 출하 대상 품목을 담아 집계하는 피킹 리스트(`Picker`) 워크플로우

### 4. 수주/발주 관리 및 실시간 환율 연동
- 월별 발주량 매트릭스 관리
- 외환 결제 및 부품 수입 단가 산출을 위한 **실시간 환율(USD, JPY) 연동 계산기** 제공

---

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript, Redux Toolkit, Redux-Saga, styled-components, SCSS, ExcelJS, FileSaver
- **Backend**: Node.js, Express, Sequelize ORM (MySQL), Passport.js (Local), Multer, Bcrypt, Express-Session

---

## 💻 로컬 개발 환경 실행 방법

### 1. 사전 요구사항 (Prerequisites)
- [Node.js](https://nodejs.org/) (v16 이상 권장)
- [MySQL](https://www.mysql.com/) 서버

### 2. 환경변수 설정
`backend/` 폴더에 `.env` 파일을 생성하거나 `.env.example`을 복사하여 DB 접속 정보를 설정합니다:
```bash
cp backend/.env.example backend/.env
```
`backend/.env` 파일 내용:
```env
PORT=4000
COOKIE_SECRET=your_cookie_secret
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
DB_DATABASE=auth-toolkit
DB_HOST=127.0.0.1
```
*(MySQL에 `auth-toolkit` 데이터베이스가 생성되어 있어야 합니다: `CREATE DATABASE \`auth-toolkit\`;`)*

### 3. 의존성 설치

**백엔드:**
```bash
cd backend
npm install
```

**프론트엔드 (프로젝트 루트):**
```bash
npm install
```

### 4. 앱 실행

**터미널 1 (백엔드 서버 실행 - 포트 4000):**
```bash
cd backend
npm start
```

**터미널 2 (프론트엔드 개발 서버 실행 - 포트 3000):**
```bash
npm start
```

브라우저에서 `http://localhost:3000`으로 접속하여 확인합니다.
