# 🦁 VAMOS LIONS — 삼성 라이온즈 팬 허브

삼성 라이온즈 팬을 위한 비공식 팬 사이트입니다. 2026 한국시리즈 **V9 우승**을 기록하고,
다음 목표인 **V10**을 추적하는 두 가지 뷰를 제공합니다.

- **`index.html`** — 사이드바 + 위젯 그리드의 **LIONS 대시보드** (메인)
- **`magazine.html`** — 스크롤형 롱폼 **팬 매거진** (기존 버전)

두 페이지는 같은 `js/data.js`와 `localStorage` 키(`lions-theme`, `vamos-lions-cheers-v1`)를 공유합니다.
테마나 팬 보드에 남긴 응원이 페이지를 오가도 유지됩니다.

> 비공식 팬 프로젝트입니다. 삼성 라이온즈 / KBO와 제휴 관계가 없으며, 선수 사진과 구단 로고는 사용하지 않았습니다.
> 기록과 일정은 2026 포스트시즌 기준이며, 새 시즌 정보는 `js/data.js`에서 업데이트할 수 있습니다.

## 바로 실행하기

별도 설치 없이 정적 파일만으로 동작합니다.

```bash
cd ~/samsung-lions-fan
python3 -m http.server 8080
```

브라우저에서 <http://localhost:8080> 을 열면 대시보드가 나옵니다.
(`index.html`을 더블클릭해도 대부분 동작하지만, 캘린더 다운로드 등은 로컬 서버 사용을 권장합니다.)

## 대시보드 구성

| 영역 | 내용 |
| --- | --- |
| 사이드바 | 섹션 내비게이션, V9 챔피언 카드, V10 진행도(9/10), 테마 전환, 매거진 링크 |
| 상단바 | 오늘 날짜, OFFSEASON 배지, 테마 버튼, LionsTV 바로가기 |
| V9 히어로 | 2026 한국시리즈 우승, 정규시즌 83-58-3, KS 4-1, 팀 수비율 .984 |
| V10 트래커 | 10번째 별 목표, 9/10 진행 바, 2027 시즌 로드맵 |
| KPI 타일 | 정규시즌 · 한국시리즈 · 수비율 · 홈구장 |
| 경기 일정 | 2026 포스트시즌 10경기, 전체/홈/원정/승리 필터, **ICS 캘린더 저장** |
| 카운트다운 | 2027 개막 **예상일**까지 D-day (공식 발표 전 임을 명시) |
| 선수단 | 18명, 포지션 필터 + 이름 검색, 카드 클릭 시 Instagram 검색 |
| 팬 보드 | 응원 작성/삭제, 브라우저 localStorage 저장, 매거진과 공유 |
| 라이온즈TV | 최신 업로드 재생목록 임베드 + 콘텐츠별 빠른 링크 |
| SNS | 공식 채널·팀스토어 등 6개 미니 링크 |
| 순위표 | 2026 정규시즌 최종 상위 5팀, 삼성 하이라이트 |
| 챔피언십 캐비닛 | V1~V9 칩 + 점선의 **V10 목표** 칩 |

### V10 표기 원칙

V10은 **아직 달성하지 않은 미래 목표**입니다. 그래서 V9과 다르게 표현했습니다.

- V10 숫자는 외곽선(ghost) 스타일, 별 10개 중 마지막 1개는 비어 있음
- 진행도는 `9 / 10`
- 캐비닛의 V10 칩은 점선 + `NEXT` 라벨
- 2027 개막일은 공식 일정이 아니므로 카운트다운과 카드에 **예상** 표시

## 데이터 업데이트

모든 콘텐츠는 `js/data.js` 한 파일에서 관리합니다.

- `schedule`: 경기 일정. `date`, `time`, `stage`, `opponent`, `home`, `venue`, `score`, `result`, `note`
- `roster`: 선수단. `name`, `group`(투수/포수/내야수/외야수), `role`, `tag`, `desc`, `emoji`
- `staff`: 감독·코칭스태프 (매거진)
- `timeline`: 우승 연혁 (V9까지)
- `standings`: 정규시즌 순위. `rank`, `team`, `short`, `wins`, `draws`, `losses`, `pct`
- `videos`: 라이온즈TV 콘텐츠 카드 (`query`가 유튜브 검색어로 연결됨)
- `links`: SNS/바로가기 링크
- `checklist`: 직관 가이드 카드 (매거진)
- `meta.nextSeasonOpener`: 카운트다운 기준일 (현재 2027-03-27 **예상일**)

새 경기를 추가할 때는 `schedule` 배열 맨 끝에 아래 형식으로 넣으면 됩니다.

```js
{
  date: "2027-03-27", time: "14:00", stage: "정규시즌 개막전",
  opponent: "롯데 자이언츠", home: true, venue: "대구 라이온즈파크",
  score: "-", result: "예정", note: "2027 개막전"
}
```

> `score`는 항상 **삼성 : 상대** 순서입니다. `result`가 `승`/`패`가 아니면 예정 경기로 표시됩니다.

### 선수 SNS 계정 직접 연결

현재 선수 카드는 Instagram **이름 검색**으로 연결됩니다. 공식 계정이 확인된 선수는
`js/data.js`의 선수 객체에 `instagram` 값을 추가하고, `js/dashboard.js`의 `playerCard()`와
`js/app.js`의 `rosterCard()`에서 검색 URL 대신 해당 값을 쓰면 정확한 프로필로 연결할 수 있습니다.

## 파일 구조

```text
samsung-lions-fan/
├─ index.html          # 대시보드 (메인)
├─ magazine.html       # 롱폼 매거진
├─ css/
│  ├─ style.css        # 공통 토큰 · 컴포넌트 · 매거진 스타일
│  └─ dashboard.css    # 대시보드 레이아웃 · 위젯 · 반응형
├─ js/
│  ├─ data.js          # 모든 콘텐츠 데이터
│  ├─ dashboard.js     # 대시보드 동작
│  └─ app.js           # 매거진 동작
└─ README.md
```

## 디자인 / 기술

- 순수 HTML + CSS + Vanilla JS (빌드 도구 없음, 외부 의존성은 Pretendard·Barlow 폰트뿐)
- 삼성 라이온즈 상징색 기반 네이비 × 골드 테마, 다크/라이트 모드 지원
- 대시보드: 고정 사이드바 + 12컬럼 위젯 그리드, 앵커 내비게이션, 스크롤 리빌
- 반응형: 데스크톱 12컬럼 → 태블릿 1열 배너 → 모바일 2/1열, 1024px 이하 햄버거 사이드바
- 접근성: 키보드 포커스, 스킵 링크, `aria` 속성, `prefers-reduced-motion` 대응

## 다음에 붙이면 좋은 기능

- **실시간 스코어**: 기존 `kbo_server.py`의 `/api/kbo/today`를 연동해 오늘 경기 카드 추가
- **유튜브 최신 영상 자동 목록**: YouTube Data API 키 또는 RSS → JSON 변환으로 제목/썸네일 자동 표시
- **경기 알림**: ICS는 이미 지원. 웹 푸시/PWA 알림 추가 가능
- **직관 기록**: 날짜·구장·결과·사진을 localStorage 또는 서버 DB에 저장
- **응원 보드 공유**: 현재는 브라우저 로컬 저장. 서버(예: Supabase, Firebase) 연결 시 팬 전체 공유 가능

## 배포 (GitHub Pages)

정적 사이트이므로 `main` 브랜치를 그대로 올리고 GitHub Pages를 켜면 됩니다.
`index.html`이 루트에 있어 별도 빌드 설정이 필요 없습니다.

- 저장소: <https://github.com/vamoslions/samsung-lions-fan>
- 사이트: <https://vamoslions.github.io/samsung-lions-fan/>

```bash
# 최초 1회: 저장소를 만든 뒤
git remote add origin https://github.com/vamoslions/samsung-lions-fan.git
git push -u origin main
```

이후 저장소 **Settings → Pages → Deploy from a branch → main / (root)** 를 선택하면
1~2분 뒤 위 주소에서 사이트가 열립니다. 파일을 수정하면 `git push` 만으로 자동 반영됩니다.

Netlify, Vercel, Cloudflare Pages에 폴더째 업로드해도 동일하게 동작합니다.

---

**VAMOS LIONS 🦁 2026 KBO 한국시리즈 챔피언 · NEXT: V10**
