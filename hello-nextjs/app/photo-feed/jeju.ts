import { StaticImageData } from "next/image";
import photo1 from "./jeju/1.jpg";
import photo2 from "./jeju/2.jpg";
import photo3 from "./jeju/3.jpg";
import photo4 from "./jeju/4.jpg";
import photo5 from "./jeju/5.jpg";
import photo6 from "./jeju/6.jpg";
import photo7 from "./jeju/7.jpg";

export type JejuImage = {
  id: string;
  name: string;
  src: StaticImageData;
  photographer: string;
  location: string;
};

const wondersImages: JejuImage[] = [
  {
    id: "1",
    name: "폭포",
    src: photo1,
    photographer: "Photo by  on Unsplash",
    location: "Jeju",
  },
  {
    id: "2",
    name: "바다",
    src: photo2,
    photographer: "Photo by on Unsplash",
    location: "Jeju",
  },
  {
    id: "3",
    name: "항구",
    src: photo3,
    photographer: "Photo by  on Unsplash",
    location: "Jeju",
  },
  {
    id: "4",
    name: "일몰",
    src: photo4,
    photographer: "Photo by  on Unsplash",
    location: "Jeju",
  },
  {
    id: "5",
    name: "해녀분들",
    src: photo5,
    photographer: "Photo by on Unsplash",
    location: "Jeju",
  },
  {
    id: "6",
    name: "유채꽃",
    src: photo6,
    photographer: "Photo by  on Unsplash",
    location: "Jeju",
  },
  {
    id: "7",
    name: "돌하루방길",
    src: photo7,
    photographer: "Photo by  on Unsplash",
    location: "Jeju",
  },
];

export default wondersImages;