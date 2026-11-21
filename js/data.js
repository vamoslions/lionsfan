/* =========================================================
   삼성 라이온즈 팬 사이트 데이터
   - 이 파일만 수정하면 사이트 내용이 바로 바뀝니다.
   - 마지막 업데이트: 2026-11-15
   ========================================================= */

window.LIONS_DATA = {
  meta: {
    lastUpdated: "2026-11-15",
    instagramCheckedAt: "2026-11-20",
    photoCheckedAt: "2026-11-21",
    season: "2026",
    // 2027 개막 예상일 (공식 일정 발표 전까지는 '예상'으로 표시됩니다)
    nextSeasonOpener: "2027-03-27T14:00:00+09:00",
    homeVenue: "대구 삼성 라이온즈파크",
    dataPolicy: "확인된 기록만 표시하고, 확인되지 않은 값은 비워 둡니다. 시뮬레이션의 대체값은 화면에 별도로 표시합니다.",
  },

  heroStats: [
    { label: "2026 정규시즌", value: "83승 3무 58패", sub: "승률 .589 · 2위" },
    { label: "한국시리즈", value: "4승 1패", sub: "KT 위즈 제압" },
    { label: "통산 우승", value: "V9", sub: "1985 ~ 2026" },
    { label: "팀 수비율", value: ".984", sub: "리그 1위 · 최소 실책 85" },
  ],

  /* 포스트시즌 실제 결과 (2026) */
  schedule: [
    { date: "2026-10-26", time: "18:30", stage: "플레이오프 1차전", opponent: "KIA 타이거즈", home: true, venue: "대구 라이온즈파크", score: "1 : 5", result: "패", note: "시리즈 0-1" },
    { date: "2026-10-27", time: "18:30", stage: "플레이오프 2차전", opponent: "KIA 타이거즈", home: true, venue: "대구 라이온즈파크", score: "8 : 3", result: "승", note: "시리즈 1-1" },
    { date: "2026-10-29", time: "18:30", stage: "플레이오프 3차전", opponent: "KIA 타이거즈", home: false, venue: "광주-기아 챔피언스 필드", score: "6 : 4", result: "승", note: "시리즈 2-1" },
    { date: "2026-10-30", time: "18:30", stage: "플레이오프 4차전", opponent: "KIA 타이거즈", home: false, venue: "광주-기아 챔피언스 필드", score: "2 : 4", result: "패", note: "시리즈 2-2" },
    { date: "2026-11-01", time: "18:30", stage: "플레이오프 5차전", opponent: "KIA 타이거즈", home: true, venue: "대구 라이온즈파크", score: "6 : 1", result: "승", note: "KS 진출" },
    { date: "2026-11-03", time: "18:30", stage: "한국시리즈 1차전", opponent: "KT 위즈", home: false, venue: "수원 KT 위즈파크", score: "7 : 8", result: "패", note: "시리즈 0-1" },
    { date: "2026-11-04", time: "18:30", stage: "한국시리즈 2차전", opponent: "KT 위즈", home: false, venue: "수원 KT 위즈파크", score: "3 : 2", result: "승", note: "연장 12회 · 시리즈 1-1" },
    { date: "2026-11-06", time: "18:30", stage: "한국시리즈 3차전", opponent: "KT 위즈", home: true, venue: "대구 라이온즈파크", score: "5 : 1", result: "승", note: "시리즈 2-1" },
    { date: "2026-11-07", time: "18:30", stage: "한국시리즈 4차전", opponent: "KT 위즈", home: true, venue: "대구 라이온즈파크", score: "10 : 5", result: "승", note: "시리즈 3-1" },
    { date: "2026-11-08", time: "18:30", stage: "한국시리즈 5차전", opponent: "KT 위즈", home: true, venue: "대구 라이온즈파크", score: "12 : 1", result: "승", note: "V9 우승 확정" },
  ],

  /* 2027 FA 트래커 (2026-11-15 기준) */
  fa: {
    updated: "2026-11-15",
    headline: "구자욱·원태인, 둘 다 잡는다",
    summary: "KBO가 2027년 FA 자격 28명을 공시했습니다. 삼성은 A등급 구자욱·원태인, C등급 전병우까지 3명. 구단은 샐러리캡 안에서 두 핵심 선수를 모두 잡겠다는 방침입니다.",
    players: [
      {
        name: "구자욱", grade: "A", pos: "외야수", role: "주장 · KS MVP",
        status: "잔류 추진", stat: "OPS 1.039",
        desc: "타율 .371·출루율 .458 리그 1위. V10의 중심이자 팀의 상징.",
      },
      {
        name: "원태인", grade: "A", pos: "투수", role: "국내 에이스",
        status: "잔류 추진", stat: "KS ERA 1.35",
        desc: "KS 2경기 1승 6⅔이닝 1실점. 가을야구의 마지막 퍼즐.",
      },
      {
        name: "전병우", grade: "C", pos: "내야수", role: "주전 3루수",
        status: "협상 대기", stat: "주전 3루",
        desc: "부상 공백을 메우며 주전 3루수로 활약. C등급 가성비 자원.",
      },
    ],
    dates: [
      { date: "11.13", label: "FA 자격 공시", note: "KBO 28명", state: "done" },
      { date: "11.15", label: "권리 행사 마감", note: "오늘", state: "today" },
      { date: "11.16", label: "승인 선수 공시", note: "최종 명단", state: "next" },
      { date: "11.17", label: "협상 개시", note: "전 구단", state: "todo" },
    ],
    note: "2026-11-15 기준. 구단 공식 발표 전 내용은 예상이며, 계약 결과에 따라 달라질 수 있습니다.",
  },

  /* 최신 삼성 라이온즈 관련 기사 (2026-11) */
  news: [
    {
      source: "뉴스핌", date: "2026-11-13", tag: "FA",
      title: "'알짜배기' C등급 FA 누가 있을까…삼성 전병우·SSG 오태곤",
      summary: "C등급은 보상선수 없이 전년도 연봉 150%만 주면 된다. 삼성 전병우도 FA 시장에 나선다.",
      href: "https://www.newspim.com/news/view/20261112000940",
    },
    {
      source: "뉴스핌", date: "2026-11-12", tag: "FA",
      title: "삼성 KS 우승 기쁨은 뒤로…FA 구자욱·원태인 잡을 수 있을까",
      summary: "삼성은 구자욱과 원태인을 샐러리캡 안에서 모두 붙잡겠다는 방침을 밝혔다.",
      href: "https://www.newspim.com/news/view/20261111001216",
    },
    {
      source: "연합뉴스", date: "2026-11-13", tag: "이벤트",
      title: "'우승 공약' 지키는 삼성, 17일 에버랜드에 팬 2천명 초청",
      summary: "선수 26명과 팬 2000명이 퍼레이드·팬미팅·불꽃놀이로 V9을 함께 축하한다.",
      href: "https://www.yna.co.kr/view/AKR20261113023900007",
    },
    {
      source: "삼성 라이온즈", date: "2026-11-13", tag: "공식",
      title: "삼성 라이온즈, KS 우승 기념 에버랜드 선수-팬 행사 진행",
      summary: "17일 에버랜드에서 열리는 V9 데이. 우승 트로피 포토존과 스페셜 퍼레이드가 준비됐다.",
      href: "https://www.samsunglions.com/intro/intro02.asp?act=view&idx=1017376",
    },
    {
      source: "연합뉴스", date: "2026-11-10", tag: "V9",
      title: "순혈주의 깨고 데이터 입혔다…삼성 V9 이끈 '3박자 혁신'",
      summary: "외부 출신 단장, 데이터 육성, 원 팀 정신이 12년 만의 왕좌를 만들었다.",
      href: "https://www.yna.co.kr/view/AKR20261110086300007",
    },
  ],

  /* 2026 주요 선수 기록 */
  stats: {
    updated: "2026-11-15",
    featured: {
      name: "구자욱",
      role: "외야수 · 주장 · KS MVP",
      emoji: "🦁",
      ops: "1.039",
      line: "114경기 · 156안타 · 15홈런 · 102타점 · 88득점",
      items: [
        { label: "타율", value: ".371", note: "리그 1위" },
        { label: "출루율", value: ".458", note: "리그 1위" },
        { label: "장타율", value: ".581", note: "OPS 1.039" },
      ],
    },
    mini: [
      { name: "김재윤", value: "35", label: "세이브", note: "리그 1위" },
      { name: "원태인", value: "1.35", label: "KS ERA", note: "2경기 1승" },
      { name: "페덱", value: "0.82", label: "KS ERA", note: "11이닝" },
      { name: "후라도", value: "1.32", label: "PO ERA", note: "2승" },
    ],
    note: "2026 정규시즌·포스트시즌 공식 기록 및 보도 기준. 시즌 종료 후 기록이 정정될 수 있습니다.",
  },

  /* 2026 포스트시즌 기준 주요 선수. 새 시즌 명단 확정 후 자유롭게 수정하세요.
     photo: Wikimedia Commons의 무료 라이선스 사진 (photoCredits 참고) */
  roster: [
    {
      name: "구자욱", group: "외야수", role: "주장 · 외야수", tag: "2026 KS MVP",
      desc: "타율 .371로 리그 1위. 한국시리즈 20타수 10안타 1홈런 6타점.", emoji: "🦁",
      stat: { label: "OPS", value: "1.039" },
      photo: "assets/players/koo.jpg",
    },
    {
      name: "강민호", group: "포수", role: "포수", tag: "2,600경기 출장",
      desc: "KBO 역대 최초 2,600경기 출장. 데뷔 23년 만에 첫 우승 반지.", emoji: "🧤",
      stat: { label: "경기", value: "2,600" },
      photo: "assets/players/kang.jpg",
    },
    {
      name: "최형우", group: "외야수", role: "지명타자 · 외야수", tag: "최고령 KS 우승",
      desc: "43세, KBO 한국시리즈 최고령 우승 선수. 왕조의 마지막 대장군.", emoji: "👑",
      stat: { label: "KS 타율", value: ".357" },
      photo: "assets/players/choi.jpg",
    },
    {
      name: "원태인", group: "투수", role: "투수", tag: "KS 5차전 MVP",
      desc: "포스트시즌 마무리에서 선발로 복귀, 5이닝 1실점 우승 확정.", emoji: "🔥",
      stat: { label: "KS ERA", value: "1.35" },
      photo: "assets/players/won.jpg",
    },
    {
      name: "아리엘 후라도", group: "투수", role: "선발 투수", tag: "PO 2승 ERA 1.32",
      desc: "플레이오프 2경기 2승. 가을야구의 든든한 선발 축.", emoji: "⚾",
      stat: { label: "PO ERA", value: "1.32" },
      photo: "assets/players/jurado.jpg",
    },
    {
      name: "크리스 페덱", group: "투수", role: "선발 · 불펜", tag: "KS 4이닝 세이브",
      desc: "KS 2경기 11이닝 ERA 0.82. 5차전 4이닝 퍼펙트로 우승을 잠갔다.", emoji: "🔒",
      stat: { label: "KS ERA", value: "0.82" },
      photo: "assets/players/paddack.jpg",
    },
    {
      name: "김재윤", group: "투수", role: "마무리 투수", tag: "35세이브 리그 1위",
      desc: "정규시즌 세이브 1위. 부상으로 포스트시즌에는 아쉽게 결장.", emoji: "🛡️",
      stat: { label: "세이브", value: "35" },
    },
    {
      name: "이승민", group: "투수", role: "불펜 투수", tag: "PO 5경기 전 경기 등판",
      desc: "플레이오프 전 경기에 등판하며 가을야구 불펜을 지켰다.", emoji: "💪",
      stat: { label: "KS ERA", value: "0.00" },
    },
    {
      name: "배찬승", group: "투수", role: "불펜 투수", tag: "생애 첫 PS 세이브",
      desc: "KS 2차전 연장 12회, 생애 첫 포스트시즌 세이브.", emoji: "🌟",
      stat: { label: "KS ERA", value: "0.00" },
    },
    {
      name: "장찬희", group: "투수", role: "선발 투수", tag: "고졸 신인",
      desc: "KS 4차전 대체 선발로 4이닝 1실점. 씩씩한 신인다운 투구.", emoji: "🌱",
      stat: { label: "KS IP", value: "4" },
    },
    { name: "최원태", group: "투수", role: "선발 투수", tag: "선발 자원", desc: "정규시즌과 가을야구를 함께한 선발 자원.", emoji: "🎯" },
    { name: "백정현", group: "투수", role: "좌완 투수", tag: "베테랑", desc: "팀의 살아있는 역사. 젊은 투수들의 든든한 버팀목.", emoji: "🧱" },
    { name: "이재현", group: "내야수", role: "내야수", tag: "역전 투런", desc: "10월 1일 한화전 역전 투런홈런으로 승리를 굳혔다.", emoji: "⚡" },
    { name: "김영웅", group: "내야수", role: "내야수", tag: "KS 5차전 적시타", desc: "한국시리즈 5차전, 득점을 부르는 적시타로 흐름을 이었다.", emoji: "🧨" },
    { name: "김지찬", group: "내야수", role: "내야수", tag: "KS 2타점 3루타", desc: "5차전 2타점 3루타로 빅이닝의 시작을 열었다.", emoji: "🏃" },
    {
      name: "박승규", group: "외야수", role: "외야수", tag: "KS 3차전 홈런",
      desc: "한국시리즈 3차전 1점 홈런. 이틀 연속 불방망이를 과시했다.", emoji: "🚀",
      stat: { label: "KS 타율", value: ".500" },
    },
    { name: "김성윤", group: "외야수", role: "외야수", tag: "주전 외야", desc: "빠른 발과 넓은 수비 범위로 외야를 책임진다.", emoji: "💨" },
    {
      name: "김헌곤", group: "외야수", role: "외야수", tag: "베테랑",
      desc: "경험으로 후배들을 이끄는 외야 베테랑.", emoji: "🎖️",
      photo: "assets/players/kim.jpg",
    },
    {
      name: "디아즈", group: "내야수", role: "1루수 · 지명타자", tag: "2026 외인 타자",
      desc: "2026시즌 삼성 중심 타선을 맡은 외국인 타자. 1루 수비와 지명타자로 출전했습니다.", emoji: "💥",
    },
    {
      name: "류지혁", group: "내야수", role: "2루수 · 3루수", tag: "내야 유틸리티",
      desc: "2루와 3루를 오가며 내야를 지킨 베테랑. 상황에 따라 타순을 옮겨 출전했습니다.", emoji: "🧩",
    },

    /* 2026 퓨처스리그 주요 유망주 (공식 로스터 + 퓨처스 기록 기준) */
    {
      name: "이창용", group: "내야수", role: "퓨처스 내야수", squad: "futures", tag: "퓨처스 OPS .901",
      desc: "82경기 타율 .329 · 12홈런 · 61타점. 차세대 내야 핵심.", emoji: "🔥",
      stat: { label: "OPS", value: ".901" },
    },
    {
      name: "이한민", group: "내야수", role: "퓨처스 내야수", squad: "futures", tag: "퓨처스 96경기",
      desc: "팀 내 최다 96경기 출장. 타율 .325 · OPS .883의 꾸준함.", emoji: "🧱",
      stat: { label: "OPS", value: ".883" },
    },
    {
      name: "김태훈", group: "외야수", role: "퓨처스 외야수", squad: "futures", tag: "퓨처스 타율 .347",
      desc: "46경기 타율 .347 · OPS .897. 강한 타격이 무기.", emoji: "🏏",
      stat: { label: "OPS", value: ".897" },
    },
    {
      name: "윤정빈", group: "외야수", role: "퓨처스 외야수", squad: "futures", tag: "퓨처스 OPS .911",
      desc: "27경기 타율 .311 · OPS .911. 적은 기회에 강한 인상.", emoji: "⚡",
      stat: { label: "OPS", value: ".911" },
    },
    {
      name: "김재혁", group: "외야수", role: "퓨처스 외야수", squad: "futures", tag: "6홈런 · 8도루",
      desc: "64경기 6홈런 8도루. 장타와 주루를 겸비한 외야 자원.", emoji: "🏃",
      stat: { label: "OPS", value: ".742" },
    },
    {
      name: "김현준", group: "외야수", role: "퓨처스 외야수", squad: "futures", tag: "ABL 파견",
      desc: "2026 퓨처스 OPS .807. 비시즌 호주리그에서 경험을 쌓는다.", emoji: "🌏",
      stat: { label: "OPS", value: ".807" },
    },
    {
      name: "김백산", group: "투수", role: "퓨처스 투수", squad: "futures", tag: "육성선수 → 1군",
      desc: "퓨처스에서 두각을 드러내 1군 선발 기회를 잡은 육성선수 출신.", emoji: "🌱",
      stat: { label: "ABL", value: "파견" },
    },
    {
      name: "김서준", group: "투수", role: "퓨처스 투수", squad: "futures", tag: "요미우리 캠프",
      desc: "2026 마무리 캠프에서 요미우리 2군과 함께 훈련한 영건.", emoji: "✈️",
      stat: { label: "캠프", value: "日" },
    },
  ],

  /* ---------------------------------------------------------
     선수 메타데이터
     - positions: 실제 출전 가능한 수비 포지션만 등록
     - 확인되지 않은 포지션은 임의로 추가하지 않습니다.
     --------------------------------------------------------- */
  playerMeta: {
    "구자욱": { positions: ["LF", "RF", "DH"] },
    "강민호": { positions: ["C"] },
    "최형우": { positions: ["DH", "LF"] },
    "원태인": { positions: ["P"] },
    "아리엘 후라도": { positions: ["P"] },
    "크리스 페덱": { positions: ["P"] },
    "김재윤": { positions: ["P"] },
    "이승민": { positions: ["P"] },
    "배찬승": { positions: ["P"] },
    "장찬희": { positions: ["P"] },
    "최원태": { positions: ["P"] },
    "백정현": { positions: ["P"] },
    "이재현": { positions: ["SS"] },
    "김영웅": { positions: ["3B"] },
    "김지찬": { positions: ["CF", "LF"] },
    "박승규": { positions: ["RF", "LF"] },
    "김성윤": { positions: ["RF", "CF", "LF"] },
    "김헌곤": { positions: ["LF", "RF"] },
    "디아즈": { positions: ["1B", "DH"] },
    "류지혁": { positions: ["2B", "3B"] },
    "이창용": { positions: ["2B", "SS"] },
    "이한민": { positions: ["3B", "1B"] },
    "김태훈": { positions: ["LF", "RF"] },
    "윤정빈": { positions: ["CF", "LF"] },
    "김재혁": { positions: ["LF", "RF"] },
    "김현준": { positions: ["CF", "LF"] },
    "김백산": { positions: ["P"] },
    "김서준": { positions: ["P"] },
  },

  /* ---------------------------------------------------------
     인스타그램: 2026-11-20 직접 프로필을 열어 표시 이름과
     소속/활동을 확인한 계정만 등록했습니다.
     - 확인 불가 계정은 데이터 자체를 만들지 않습니다.
     - UI는 미등록 선수를 '계정 정보 없음'으로 표시합니다.
     --------------------------------------------------------- */
  instagramAccounts: {
    "구자욱": { handle: "koojawook", checkedAt: "2026-11-20" },
    "강민호": { handle: "mmmmmmminho_47", checkedAt: "2026-11-20" },
    "원태인": { handle: "won_tae_in", checkedAt: "2026-11-20" },
    "최원태": { handle: "wontae20", checkedAt: "2026-11-20" },
    "이재현": { handle: "lee.j.hyeon7_", checkedAt: "2026-11-20" },
    "김영웅": { handle: "young.woong_30", checkedAt: "2026-11-20" },
    "김지찬": { handle: "01kimjichan", checkedAt: "2026-11-20" },
    "박승규": { handle: "seung_kyu00", checkedAt: "2026-11-20" },
    "김성윤": { handle: "yo39on", checkedAt: "2026-11-20" },
    "김헌곤": { handle: "gjsrhs11", checkedAt: "2026-11-20" },
    "이승민": { handle: "sssss__min", checkedAt: "2026-11-20" },
    "배찬승": { handle: "c_s_bae_0101", checkedAt: "2026-11-20" },
    "장찬희": { handle: "cks_gml_60", checkedAt: "2026-11-20" },
    "아리엘 후라도": { handle: "ariel.b_30", checkedAt: "2026-11-20" },
    "크리스 페덱": { handle: "paddack29", checkedAt: "2026-11-20" },
  },

  instagramNotes: {
    "최형우": "@cc_hyeong는 표시 이름만 일치하고 본인 확인 근거가 부족해 연결하지 않았습니다.",
    "김재윤": "본인 운영 계정을 확인하지 못했습니다.",
    "백정현": "본인 운영 계정을 확인하지 못했습니다.",
    "디아즈": "본인 운영 계정을 확인하지 못했습니다.",
    "류지혁": "본인 운영 계정을 확인하지 못했습니다.",
  },

  /* ---------------------------------------------------------
     AI 시뮬레이션 기준 데이터
     - nextGame: 2026시즌 종료로 공식 '다음 경기'가 없어 null.
     - expectedLineup: 공식 확정 라인업이 아닌 팬 예상 조합.
     - 실제 확인된 개인 기록은 batterSamples/pitcherSamples에만 저장.
     - 나머지는 모델 사전확률(리그 평균 가정)을 사용하며 화면에 명시.
     --------------------------------------------------------- */
  simulation: {
    asOf: "2026-11-15",
    checkedAt: "2026-11-20",
    nextGame: null,
    nextGameNote: "2026시즌이 종료되어 공식 다음 경기 일정이 없습니다. 아래는 2026 한국시리즈 기준 가상 매치업입니다.",
    expectedLineup: {
      status: "expected",
      asOf: "2026-11-15",
      basis: "2026 한국시리즈 주요 출전 조합을 바탕으로 한 팬 예상 라인업",
      note: "구단 공식 발표 라인업이 아닙니다. 선수 컨디션·상대 선발·부상에 따라 달라질 수 있습니다.",
      pitcher: "원태인",
      batters: [
        { name: "김지찬", position: "CF" },
        { name: "김성윤", position: "RF" },
        { name: "구자욱", position: "LF" },
        { name: "최형우", position: "DH" },
        { name: "디아즈", position: "1B" },
        { name: "강민호", position: "C" },
        { name: "김영웅", position: "3B" },
        { name: "이재현", position: "SS" },
        { name: "류지혁", position: "2B" },
      ],
    },
    iterations: 10000,
    seed: "vamos-lions-2026",
    homeAdvantage: 0.018,
    /* 실제 2026 리그 평균이 아니라, 결측치를 대체하는 모델 사전확률입니다. */
    priors: {
      label: "리그 평균 가정(모델 사전확률)",
      obp: 0.335,
      slg: 0.400,
      avg: 0.260,
      kRate: 0.205,
      bbRate: 0.083,
      hbpRate: 0.012,
      runsPerGame: 4.6,
      pitcherEra: 4.20,
    },
    /* 확인된 개인 기록만. partial은 표본이 작아 모델에서 제한적으로 반영합니다. */
    batterSamples: {
      "구자욱": { avg: 0.371, obp: 0.458, slg: 0.581, source: "2026 정규시즌", status: "confirmed" },
      "최형우": { avg: 0.357, source: "2026 한국시리즈", status: "partial" },
      "박승규": { avg: 0.500, source: "2026 한국시리즈", status: "partial" },
    },
    pitcherSamples: {
      "원태인": { era: 1.35, source: "2026 한국시리즈 2경기", status: "partial" },
      "아리엘 후라도": { era: 1.32, source: "2026 플레이오프 2경기", status: "partial" },
      "크리스 페덱": { era: 0.82, ip: 11, source: "2026 한국시리즈 2경기", status: "partial" },
      "김재윤": { saves: 35, source: "2026 정규시즌", status: "partial" },
      "이승민": { era: 0.00, source: "2026 한국시리즈", status: "partial" },
      "배찬승": { era: 0.00, source: "2026 한국시리즈", status: "partial" },
    },
    opponents: [
      { id: "KT", name: "KT 위즈", short: "KT", pct: 0.647, wins: 90, draws: 5, losses: 49, note: "2026 정규시즌 1위 · 한국시리즈 상대" },
      { id: "KIA", name: "KIA 타이거즈", short: "KIA", pct: 0.556, wins: 79, draws: 2, losses: 63, note: "2026 정규시즌 3위 · 플레이오프 상대" },
      { id: "LG", name: "LG 트윈스", short: "LG", pct: 0.545, wins: 78, draws: 1, losses: 65, note: "2026 정규시즌 4위" },
      { id: "DOOSAN", name: "두산 베어스", short: "두산", pct: 0.525, wins: 73, draws: 5, losses: 66, note: "2026 정규시즌 5위" },
    ],
    opponentDataNote: "상대 팀의 개별 타자·투수 2026 시즌 기록은 이 사이트에 수집되어 있지 않습니다. 상대 타선은 리그 평균 모델로 계산하며, 팀 승률만 실제 값으로 반영합니다.",
  },

  /* 선수 사진 출처 (Wikimedia Commons 무료 라이선스) */
  photoCredits: [
    { name: "구자욱", author: "WiiWii", license: "CC BY 4.0", period: "2017", href: "https://commons.wikimedia.org/wiki/File:2017_09_01_%EC%82%BC%EC%84%B1_vs_SK_%EA%B5%BF%EB%B0%94%EC%9D%B4_%EB%9D%BC%EC%9D%B4%EC%98%A8%ED%82%B9_1_(4).jpg" },
    { name: "강민호", author: "Seohae1999", license: "CC BY-SA 3.0", period: "2023", href: "https://commons.wikimedia.org/wiki/File:Kang_Min-ho_2023.jpg" },
    { name: "최형우", author: "OSEN SPORTS", license: "CC BY 3.0", period: "2021 KIA 시절", href: "https://commons.wikimedia.org/wiki/File:%EC%B5%9C%ED%98%95%EC%9A%B0_%EC%95%BC%EA%B5%AC_%EC%84%A0%EC%88%98.jpg" },
    { name: "원태인", author: "LionsTV", license: "CC BY 3.0", period: "2025", href: "https://commons.wikimedia.org/wiki/File:Won_Tae-in_(ZGbHvfTK0V4).png" },
    { name: "아리엘 후라도", author: "Th3TruthPhotos", license: "CC BY 2.0", period: "2017 텍사스 시절", href: "https://commons.wikimedia.org/wiki/File:Urias_and_Jurado_(34853012723)_(cropped).jpg" },
    { name: "크리스 페덱", author: "Ryan Casey Aguinaldo", license: "CC BY-SA 4.0", period: "2021 샌디에이고 시절", href: "https://commons.wikimedia.org/wiki/File:Chris_Paddack_7.10.21_(cropped).jpg" },
    { name: "김헌곤", author: "LionsTV", license: "CC BY 3.0", period: "2019", href: "https://commons.wikimedia.org/wiki/File:%EA%B9%80%ED%97%8C%EA%B3%A4_%EC%84%A0%EC%88%98.jpg" },
  ],

  // Official roster profile thumbnails, matched by name, position and player code.
  // External display only: copyright remains with Samsung Lions. These are not
  // licensed for redistribution; do not download/rehost without permission.
  // Old roster.photo / Commons game photographs are deliberately not fallbacks.
  playerProfiles: {
    "구자욱": { verifiedName: "구자욱", officialName: "구자욱", playerCode: "A0033", src: "https://www.samsunglions.com/upload/player/A0033_player_img_square(2).jpg", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0033", checkedAt: "2026-11-21" },
    "강민호": { verifiedName: "강민호", officialName: "강민호", playerCode: "A0354", src: "https://www.samsunglions.com/upload/player/A0354_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0354", checkedAt: "2026-11-21" },
    "최형우": { verifiedName: "최형우", officialName: "최형우", playerCode: "A0616", src: "https://www.samsunglions.com/upload/player/A0616_player_img_square(4).jpg", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0616", checkedAt: "2026-11-21" },
    "원태인": { verifiedName: "원태인", officialName: "원태인", playerCode: "A0399", src: "https://www.samsunglions.com/upload/player/A0399_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0399", checkedAt: "2026-11-21" },
    "아리엘 후라도": { verifiedName: "아리엘 후라도", officialName: "후라도", playerCode: "A0568", src: "https://www.samsunglions.com/upload/player/A0568_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0568", checkedAt: "2026-11-21" },
    "크리스 페덱": { verifiedName: "크리스 페덱", officialName: "페덱", playerCode: "A0620", src: "https://www.samsunglions.com/upload/player/A0620_player_img_square(4).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0620", checkedAt: "2026-11-21" },
    "김재윤": { verifiedName: "김재윤", officialName: "김재윤", playerCode: "A0527", src: "https://www.samsunglions.com/upload/player/A0527_player_img_square.png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0527", checkedAt: "2026-11-21" },
    "이승민": { verifiedName: "이승민", officialName: "이승민", playerCode: "A0423", src: "https://www.samsunglions.com/upload/player/A0423_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0423", checkedAt: "2026-11-21" },
    "배찬승": { verifiedName: "배찬승", officialName: "배찬승", playerCode: "A0552", src: "https://www.samsunglions.com/upload/player/A0552_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0552", checkedAt: "2026-11-21" },
    "장찬희": { verifiedName: "장찬희", officialName: "장찬희", playerCode: "A0605", src: "https://www.samsunglions.com/upload/player/A0605_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0605", checkedAt: "2026-11-21" },
    "최원태": { verifiedName: "최원태", officialName: "최원태", playerCode: "A0567", src: "https://www.samsunglions.com/upload/player/A0567_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0567", checkedAt: "2026-11-21" },
    "백정현": { verifiedName: "백정현", officialName: "백정현", playerCode: "77446", src: "https://www.samsunglions.com/upload/player/77446_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=77446", checkedAt: "2026-11-21" },
    "이재현": { verifiedName: "이재현", officialName: "이재현", playerCode: "A0466", src: "https://www.samsunglions.com/upload/player/A0466_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0466", checkedAt: "2026-11-21" },
    "김영웅": { verifiedName: "김영웅", officialName: "김영웅", playerCode: "A0468", src: "https://www.samsunglions.com/upload/player/A0468_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0468", checkedAt: "2026-11-21" },
    "김지찬": { verifiedName: "김지찬", officialName: "김지찬", playerCode: "A0428", src: "https://www.samsunglions.com/upload/player/A0428_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0428", checkedAt: "2026-11-21" },
    "박승규": { verifiedName: "박승규", officialName: "박승규", playerCode: "A0409", src: "https://www.samsunglions.com/upload/player/A0409_player_img_square.jpg", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0409", checkedAt: "2026-11-21" },
    "김성윤": { verifiedName: "김성윤", officialName: "김성윤", playerCode: "A0326", src: "https://www.samsunglions.com/upload/player/A0326_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0326", checkedAt: "2026-11-21" },
    "김헌곤": { verifiedName: "김헌곤", officialName: "김헌곤", playerCode: "21108", src: "https://www.samsunglions.com/upload/player/21108_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=21108", checkedAt: "2026-11-21" },
    "디아즈": { verifiedName: "디아즈", officialName: "디아즈", playerCode: "A0549", src: "https://www.samsunglions.com/upload/player/A0549_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0549", checkedAt: "2026-11-21" },
    "류지혁": { verifiedName: "류지혁", officialName: "류지혁", playerCode: "A0515", src: "https://www.samsunglions.com/upload/player/A0515_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0515", checkedAt: "2026-11-21" },
    "이창용": { verifiedName: "이창용", officialName: "이창용", playerCode: "A0456", src: "https://www.samsunglions.com/upload/player/A0456_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0456", checkedAt: "2026-11-21" },
    "이한민": { verifiedName: "이한민", officialName: "이한민", playerCode: "A0615", src: "https://www.samsunglions.com/upload/player/A0615_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0615", checkedAt: "2026-11-21" },
    "김태훈": { verifiedName: "김태훈", officialName: "김태훈", playerCode: "A0512", src: "https://www.samsunglions.com/upload/player/A0512_player_img_square(2).jpg", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0512", checkedAt: "2026-11-21" },
    "윤정빈": { verifiedName: "윤정빈", officialName: "윤정빈", playerCode: "A0366", src: "https://www.samsunglions.com/upload/player/A0366_player_img_square.jpg", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0366", checkedAt: "2026-11-21" },
    "김재혁": { verifiedName: "김재혁", officialName: "김재혁", playerCode: "A0467", src: "https://www.samsunglions.com/upload/player/A0467_player_img_square.png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0467", checkedAt: "2026-11-21" },
    "김현준": { verifiedName: "김현준", officialName: "김현준", playerCode: "A0451", src: "https://www.samsunglions.com/upload/player/A0451_player_img_square.jpg", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0451", checkedAt: "2026-11-21" },
    "김백산": { verifiedName: "김백산", officialName: "김백산", playerCode: "A0564", src: "https://www.samsunglions.com/upload/player/A0564_player_img_square(2).png", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0564", checkedAt: "2026-11-21" },
    "김서준": { verifiedName: "김서준", officialName: "김서준", playerCode: "A0470", src: "https://www.samsunglions.com/upload/player/A0470_player_img_square.jpg", source: "https://www.samsunglions.com/roster/roster_2.asp?pcode=A0470", checkedAt: "2026-11-21" },
  },
  photoPolicy: {
    note: "삼성 라이온즈 공식 선수 프로필을 이름·포지션·선수 코드와 대조해 외부 링크로 표시합니다. 저작권은 구단에 있으며 재배포 라이선스를 의미하지 않습니다. 사진 미확보 또는 로드 실패 시에만 기본 실루엣을 사용합니다. 경기·기사 사진은 사용하지 않습니다.",
    defaultAlt: "삼성 라이온즈 기본 프로필 이미지",
  },

  staff: [
    { name: "박진만", role: "1군 감독", tag: "2026 KS 우승 감독", desc: "선수로 6번, 감독으로 첫 우승. 정규시즌 최소 실책·수비율 1위를 만든 '수비 야구'와 과감한 단기전 운용으로 V9을 이끌었다.", emoji: "🦁" },
    { name: "모리야마 료지", role: "2군 감독", tag: "퓨처스", desc: "차세대 라이온즈를 키우는 퓨처스 사령탑.", emoji: "🌱" },
    { name: "이종열", role: "단장", tag: "프런트", desc: "선수단 구성과 육성, 투자로 왕조 부활의 기반을 만든 단장.", emoji: "📋" },
    { name: "구자욱", role: "주장", tag: "캡틴", desc: "부상 속에서도 타선을 지키며 한국시리즈 MVP에 올랐다.", emoji: "©️" },
  ],

  timeline: [
    { year: "1985", title: "V1", desc: "전·후기 통합 우승" },
    { year: "2002", title: "V2", desc: "한국시리즈 우승" },
    { year: "2005", title: "V3", desc: "한국시리즈 우승" },
    { year: "2006", title: "V4", desc: "한국시리즈 우승" },
    { year: "2011", title: "V5", desc: "4연속 통합우승 시작" },
    { year: "2012", title: "V6", desc: "4연속 통합우승" },
    { year: "2013", title: "V7", desc: "4연속 통합우승" },
    { year: "2014", title: "V8", desc: "4연속 통합우승" },
    { year: "2026", title: "V9", desc: "12년 만의 왕좌 탈환" },
  ],

  /* 2026 정규시즌 최종 순위 (KT 1위, 삼성 2위) */
  standings: [
    { rank: 1, team: "KT 위즈", short: "KT", wins: 90, draws: 5, losses: 49, pct: ".647" },
    { rank: 2, team: "삼성 라이온즈", short: "삼성", wins: 83, draws: 3, losses: 58, pct: ".589" },
    { rank: 3, team: "KIA 타이거즈", short: "KIA", wins: 79, draws: 2, losses: 63, pct: ".556" },
    { rank: 4, team: "LG 트윈스", short: "LG", wins: 78, draws: 1, losses: 65, pct: ".545" },
    { rank: 5, team: "두산 베어스", short: "두산", wins: 73, draws: 5, losses: 66, pct: ".525" },
  ],

  videos: [
    { tag: "하이라이트", title: "경기 하이라이트", desc: "매 경기 이닝별 명장면을 가장 빠르게. 승리한 날은 애프터매치까지 이어서.", query: "하이라이트", emoji: "🎬" },
    { tag: "애프터매치", title: "승리 직후 현장", desc: "코칭스태프 시점으로 담아낸 승리의 순간과 선수 인터뷰.", query: "애프터매치", emoji: "📹" },
    { tag: "덕아웃 1열", title: "덕아웃 1열", desc: "중계에 담기지 않는 덕아웃의 표정과 리액션을 가까이에서.", query: "덕아웃1열", emoji: "🪑" },
    { tag: "OFF THE BASE", title: "OFF THE BASE", desc: "선수들의 사소하지만 웃긴 일상. 팬들이 기다리는 비하인드 토막 영상.", query: "OFF THE BASE", emoji: "🎞️" },
  ],

  links: [
    { group: "공식", name: "삼성 라이온즈 홈페이지", desc: "구단 소식 · 티켓 · 구장 안내", href: "https://www.samsunglions.com", mark: "WEB", color: "#074ca1" },
    { group: "공식", name: "LionsTV 유튜브", desc: "라이온즈티비 공식 채널 · 구독 42만+", href: "https://www.youtube.com/@lionstv1982", mark: "YT", color: "#ff0033" },
    { group: "공식", name: "공식 인스타그램", desc: "@samsunglions_baseballclub", href: "https://www.instagram.com/samsunglions_baseballclub", mark: "IG", color: "#d62976" },
    { group: "공식", name: "공식 X (트위터)", desc: "@twittlions · 실시간 경기 소식", href: "https://x.com/twittlions", mark: "X", color: "#111111" },
    { group: "공식", name: "네이버 클립", desc: "LionsTV 클립 · 짧은 영상 모음", href: "https://tv.naver.com/@lionstv82", mark: "N", color: "#03c75a" },
    { group: "공식", name: "팀스토어", desc: "유니폼 · 응원 굿즈 · 우승 기념 상품", href: "https://shop.berriz.in/ko/lionsteamstore", mark: "SHOP", color: "#f5c451" },
    { group: "직관", name: "KBO 공식 홈페이지", desc: "전체 일정 · 순위 · 기록", href: "https://www.koreabaseball.com", mark: "KBO", color: "#0b4ea2" },
    { group: "직관", name: "네이버 스포츠", desc: "중계 · 문자중계 · 경기 기록", href: "https://sports.naver.com/kbaseball", mark: "SPO", color: "#03c75a" },
    { group: "직관", name: "TVING 스포츠", desc: "KBO 유료 중계 · 다시보기", href: "https://www.tving.com/sports", mark: "TV", color: "#ff153c" },
    { group: "팬", name: "삼성 라이온즈 갤러리", desc: "디시인사이드 팬 커뮤니티", href: "https://gall.dcinside.com/board/lists/?id=samsunglions", mark: "DC", color: "#1f6feb" },
    { group: "팬", name: "사자사랑방", desc: "네이버 카페 팬 커뮤니티", href: "https://search.naver.com/search.naver?query=%EC%82%AC%EC%9E%90%EC%82%AC%EB%9E%91%EB%B0%A9", mark: "CAFE", color: "#03c75a" },
    { group: "팬", name: "응원가 모음", desc: "LionsTV 응원가 배우기 · 따라 부르기", href: "https://www.youtube.com/@lionstv1982/search?query=%EC%9D%91%EC%9B%90%EA%B0%80", mark: "♪", color: "#8b5cf6" },
  ],

  checklist: [
    { title: "티켓 예매", desc: "홈경기 티켓은 구단 공식 홈페이지에서. 우승 기념 경기·포스트시즌은 오픈 시간에 맞춰 대기하세요.", href: "https://www.samsunglions.com", emoji: "🎟️" },
    { title: "라팍 가는 길", desc: "대구 수성구 야구전설로 1. 대중교통 이용 시 경기 종료 후 혼잡하니 여유 있게 이동하세요.", href: "https://www.samsunglions.com", emoji: "🚇" },
    { title: "응원 준비물", desc: "유니폼, 응원봉, 수건은 필수. 낮 경기는 모자와 선크림, 저녁 경기는 얇은 겉옷을 챙기세요.", href: "https://shop.berriz.in/ko/lionsteamstore", emoji: "🧢" },
    { title: "중계 보기", desc: "집관은 TVING · 지상파/케이블 중계를 확인하세요. 라이온즈TV에서 하이라이트도 챙겨보면 좋아요.", href: "https://www.tving.com/sports", emoji: "📺" },
    { title: "좌석 고르기", desc: "응원석과 가족석 위치는 예매 페이지의 좌석도에서 확인하세요. 첫 직관이라면 통로 쪽 좌석이 편해요.", href: "https://www.samsunglions.com", emoji: "💺" },
    { title: "응원가 익히기", desc: "라팍에서 함께 부르면 두 배로 즐겁습니다. LionsTV 응원가 배우기 영상으로 미리 연습하세요.", href: "https://www.youtube.com/@lionstv1982/search?query=%EC%9D%91%EC%9B%90%EA%B0%80", emoji: "🎵" },
  ],
};
