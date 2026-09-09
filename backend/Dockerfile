FROM node:18-slim

WORKDIR /app

# 의존성 파일 복사 및 프로덕션 패키지 설치
COPY package*.json ./
RUN npm ci --omit=dev

# 백엔드 소스 코드 복사
COPY . .

# 업로드 디렉토리 확보
RUN mkdir -p uploads

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "index.js"]
