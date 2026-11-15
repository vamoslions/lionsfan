/* =========================================================
   삼성 라이온즈 팬 사이트 데이터
   - 이 파일만 수정하면 사이트 내용이 바로 바뀝니다.
   - 마지막 업데이트: 2026-11-15
   ========================================================= */

window.LIONS_DATA = {
  meta: {
    lastUpdated: "2026-11-15",
    season: "2026",
    // 2027 개막 예상일 (공식 일정 발표 전까지는 '예상'으로 표시됩니다)
    nextSeasonOpener: "2027-03-27T14:00:00+09:00",
    homeVenue: "대구 삼성 라이온즈파크",
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
      photo: "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/2017_09_01_%EC%82%BC%EC%84%B1_vs_SK_%EA%B5%BF%EB%B0%94%EC%9D%B4_%EB%9D%BC%EC%9D%B4%EC%98%A8%ED%82%B9_1_%284%29.jpg/960px-2017_09_01_%EC%82%BC%EC%84%B1_vs_SK_%EA%B5%BF%EB%B0%94%EC%9D%B4_%EB%9D%BC%EC%9D%B4%EC%98%A8%ED%82%B9_1_%284%29.jpg",
    },
    {
      name: "강민호", group: "포수", role: "포수", tag: "2,600경기 출장",
      desc: "KBO 역대 최초 2,600경기 출장. 데뷔 23년 만에 첫 우승 반지.", emoji: "🧤",
      stat: { label: "경기", value: "2,600" },
      photo: "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Kang_Min-ho_2023.jpg/960px-Kang_Min-ho_2023.jpg",
    },
    {
      name: "최형우", group: "외야수", role: "지명타자 · 외야수", tag: "최고령 KS 우승",
      desc: "43세, KBO 한국시리즈 최고령 우승 선수. 왕조의 마지막 대장군.", emoji: "👑",
      stat: { label: "KS 타율", value: ".357" },
    },
    {
      name: "원태인", group: "투수", role: "투수", tag: "KS 5차전 MVP",
      desc: "포스트시즌 마무리에서 선발로 복귀, 5이닝 1실점 우승 확정.", emoji: "🔥",
      stat: { label: "KS ERA", value: "1.35" },
      photo: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Won_Tae-in_%28ZGbHvfTK0V4%29.png",
    },
    {
      name: "아리엘 후라도", group: "투수", role: "선발 투수", tag: "PO 2승 ERA 1.32",
      desc: "플레이오프 2경기 2승. 가을야구의 든든한 선발 축.", emoji: "⚾",
      stat: { label: "PO ERA", value: "1.32" },
      photo: "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Urias_and_Jurado_%2834853012723%29_%28cropped%29.jpg/960px-Urias_and_Jurado_%2834853012723%29_%28cropped%29.jpg",
    },
    {
      name: "크리스 페덱", group: "투수", role: "선발 · 불펜", tag: "KS 4이닝 세이브",
      desc: "KS 2경기 11이닝 ERA 0.82. 5차전 4이닝 퍼펙트로 우승을 잠갔다.", emoji: "🔒",
      stat: { label: "KS ERA", value: "0.82" },
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
      photo: "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/%EA%B9%80%ED%97%8C%EA%B3%A4_%EC%84%A0%EC%88%98.jpg/960px-%EA%B9%80%ED%97%8C%EA%B3%A4_%EC%84%A0%EC%88%98.jpg",
    },
  ],

  /* 선수 사진 출처 (Wikimedia Commons 무료 라이선스) */
  photoCredits: [
    { name: "구자욱", author: "WiiWii", license: "CC BY 4.0", href: "https://commons.wikimedia.org/wiki/File:2017_09_01_%EC%82%BC%EC%84%B1_vs_SK_%EA%B5%BF%EB%B0%94%EC%9D%B4_%EB%9D%BC%EC%9D%B4%EC%98%A8%ED%82%B9_1_(4).jpg" },
    { name: "강민호", author: "Seohae1999", license: "CC BY-SA 3.0", href: "https://commons.wikimedia.org/wiki/File:Kang_Min-ho_2023.jpg" },
    { name: "원태인", author: "LionsTV", license: "CC BY 3.0", href: "https://commons.wikimedia.org/wiki/File:Won_Tae-in_(ZGbHvfTK0V4).png" },
    { name: "아리엘 후라도", author: "Th3TruthPhotos", license: "CC BY 2.0", href: "https://commons.wikimedia.org/wiki/File:Urias_and_Jurado_(34853012723)_(cropped).jpg" },
    { name: "김헌곤", author: "LionsTV", license: "CC BY 3.0", href: "https://commons.wikimedia.org/wiki/File:%EA%B9%80%ED%97%8C%EA%B3%A4_%EC%84%A0%EC%88%98.jpg" },
  ],

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
