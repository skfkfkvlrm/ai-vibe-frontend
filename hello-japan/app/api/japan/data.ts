export type TranslationLocale = "en" | "ja" | "zh";

/** 언어별 번역(없는 필드는 한국어 원문으로 대체 표시) */
export type Translation = {
  name?: string; // 여행지명
  sea?: string; // 볼거리
  eat?: string; // 먹거리
};

export type Destination = {
  id: number;
  name: string; // 여행지명 (한국어 기준)
  sea: string; // 특산품-볼거리 (한국어 기준)
  eat: string; // 특산품-먹거리 (한국어 기준)
  picture: string; // 여행지 사진 (public 기준 경로)
  i18n?: Partial<Record<TranslationLocale, Translation>>;
};

export const destinations: Destination[] = [
  {
    id: 1,
    name: '도쿄',
    sea: '스카이트리와 스미다강 벚꽃, 센소지, 시부야 스크램블 교차로',
    eat: '스시, 몬자야키, 라멘',
    picture: '/images/tokyo.jpg',
    i18n: {
      en: { name: 'Tokyo', sea: 'Skytree and cherry blossoms on the Sumida River, Sensoji Temple, Shibuya Scramble Crossing', eat: 'Sushi, monjayaki, ramen' },
      ja: { name: '東京', sea: 'スカイツリーと隅田川の桜、浅草寺、渋谷スクランブル交差点', eat: '寿司、もんじゃ焼き、ラーメン' },
      zh: { name: '东京', sea: '晴空塔与隅田川樱花、浅草寺、涩谷十字路口', eat: '寿司、文字烧、拉面' },
    },
  },
  {
    id: 2,
    name: '오사카',
    sea: '오사카성, 도톤보리 야경, 유니버설 스튜디오',
    eat: '타코야키, 오코노미야키, 쿠시카츠',
    picture: '/images/osaka.jpg',
    i18n: {
      en: { name: 'Osaka', sea: 'Osaka Castle, Dotonbori at night, Universal Studios Japan', eat: 'Takoyaki, okonomiyaki, kushikatsu' },
      ja: { name: '大阪', sea: '大阪城、道頓堀の夜景、ユニバーサル・スタジオ・ジャパン', eat: 'たこ焼き、お好み焼き、串カツ' },
      zh: { name: '大阪', sea: '大阪城、道顿堀夜景、日本环球影城', eat: '章鱼烧、大阪烧、炸串' },
    },
  },
  {
    id: 3,
    name: '삿포로',
    sea: '오도리 공원, 눈축제, 시계탑',
    eat: '미소 라멘, 징기스칸(양고기), 수프카레',
    picture: '/images/sapporo.jpg',
    i18n: {
      en: { name: 'Sapporo', sea: 'Odori Park, Snow Festival, Clock Tower', eat: 'Miso ramen, Genghis Khan (grilled lamb), soup curry' },
      ja: { name: '札幌', sea: '大通公園、さっぽろ雪まつり、時計台', eat: '味噌ラーメン、ジンギスカン、スープカレー' },
      zh: { name: '札幌', sea: '大通公园、札幌雪祭、钟楼', eat: '味噌拉面、成吉思汗烤羊肉、汤咖喱' },
    },
  },
  {
    id: 4,
    name: '후쿠오카',
    sea: '모모치 해변, 오호리 공원, 다자이후 텐만구',
    eat: '하카타 돈코츠 라멘, 모츠나베, 멘타이코',
    picture: '/images/fukuoka.jpg',
    i18n: {
      en: { name: 'Fukuoka', sea: 'Momochi Seaside Park, Ohori Park, Dazaifu Tenmangu Shrine', eat: 'Hakata tonkotsu ramen, motsunabe, mentaiko' },
      ja: { name: '福岡', sea: '百道浜、大濠公園、太宰府天満宮', eat: '博多豚骨ラーメン、もつ鍋、明太子' },
      zh: { name: '福冈', sea: '百道海滨、大濠公园、太宰府天满宫', eat: '博多豚骨拉面、内脏锅、明太子' },
    },
  },
  {
    id: 5,
    name: '나라',
    sea: '도다이지 대불전, 나라 공원의 사슴, 가스가 타이샤',
    eat: '감잎 초밥(카키노하즈시), 나라즈케, 미와 소면',
    picture: '/images/nara.jpg',
    i18n: {
      en: { name: 'Nara', sea: 'Todai-ji Great Buddha Hall, deer of Nara Park, Kasuga Taisha', eat: 'Kakinoha-zushi (persimmon-leaf sushi), Nara-zuke pickles, Miwa somen' },
      ja: { name: '奈良', sea: '東大寺大仏殿、奈良公園の鹿、春日大社', eat: '柿の葉寿司、奈良漬、三輪そうめん' },
      zh: { name: '奈良', sea: '东大寺大佛殿、奈良公园的鹿、春日大社', eat: '柿叶寿司、奈良渍、三轮素面' },
    },
  },
  {
    id: 6,
    name: '아오모리',
    sea: '오이라세 계류, 히로사키성 벚꽃, 네부타 축제',
    eat: '사과, 가리비, 아오모리 참치',
    picture: '/images/aomori.jpg',
    i18n: {
      en: { name: 'Aomori', sea: 'Oirase Stream, Hirosaki Castle cherry blossoms, Nebuta Festival', eat: 'Apples, scallops, Aomori tuna' },
      ja: { name: '青森', sea: '奥入瀬渓流、弘前城の桜、ねぶた祭', eat: 'りんご、ホタテ、青森のマグロ' },
      zh: { name: '青森', sea: '奥入濑溪流、弘前城樱花、睡魔祭', eat: '苹果、扇贝、青森金枪鱼' },
    },
  },
];
