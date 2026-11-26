export type Destination = {
  id: number;
  name: string; // 여행지명
  sea: string; // 특산품-볼거리
  eat: string; // 특산품-먹거리
  picture: string; // 여행지 사진 (public 기준 경로)
};

export const destinations: Destination[] = [
  {
    id: 1,
    name: '도쿄',
    sea: '스카이트리와 스미다강 벚꽃, 센소지, 시부야 스크램블 교차로',
    eat: '스시, 몬자야키, 라멘',
    picture: '/images/tokyo.jpg',
  },
  {
    id: 2,
    name: '오사카',
    sea: '오사카성, 도톤보리 야경, 유니버설 스튜디오',
    eat: '타코야키, 오코노미야키, 쿠시카츠',
    picture: '/images/osaka.jpg',
  },
  {
    id: 3,
    name: '삿포로',
    sea: '오도리 공원, 눈축제, 시계탑',
    eat: '미소 라멘, 징기스칸(양고기), 수프카레',
    picture: '/images/sapporo.jpg',
  },
  {
    id: 4,
    name: '후쿠오카',
    sea: '모모치 해변, 오호리 공원, 다자이후 텐만구',
    eat: '하카타 돈코츠 라멘, 모츠나베, 멘타이코',
    picture: '/images/fukuoka.jpg',
  },
  {
    id: 5,
    name: '나라',
    sea: '도다이지 대불전, 나라 공원의 사슴, 가스가 타이샤',
    eat: '감잎 초밥(카키노하즈시), 나라즈케, 미와 소면',
    picture: '/images/nara.jpg',
  },
  {
    id: 6,
    name: '아오모리',
    sea: '오이라세 계류, 히로사키성 벚꽃, 네부타 축제',
    eat: '사과, 가리비, 아오모리 참치',
    picture: '/images/aomori.jpg',
  },
];

export function getDestination(id: number): Destination | undefined {
  return destinations.find((d) => d.id === id);
}
