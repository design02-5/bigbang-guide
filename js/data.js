/*
 * data.js — 所有可編輯內容都集中在這支檔案
 * 改版面/功能不用碰這支檔案，改內容也不用碰其他檔案。
 *
 * 標示 [待補] 的地方，等正式資料出來（票價、歌單、口號時間軸）
 * 直接覆蓋掉對應欄位即可，畫面會自動更新。
 */

const TOUR_INFO = {
  group: "BIGBANG",
  heroKicker: "2026-2027 WORLD TOUR",
  tourName: 'BIGBANG 2026-2027 WORLD TOUR',
  tourSubtitle: '“XX : COSMOS”',
  presentedBy: "PRESENTED BY YG ENTERTAINMENT",

  showCountdown: false, // 先隱藏倒數計時，之後要顯示改成 true 即可
  showInfoSections: false, // 先隱藏「演出資訊／公告／座位圖／交通／應援禮儀／會員企劃」整組手風琴，資料還沒定案
  showOfficialSiteLink: false, // 先隱藏「官方網站」按鈕

  // 場次介紹（accordion 裡的「演出資訊」「交通方式」用，目前 accordion 是關閉的）
  // 這是世界巡演多場次，這裡先放通用文字；個別場次細節請看 TOUR_STOPS。
  venue: "詳見下方場次列表",
  venueAddress: "各場次場館不同，請依下方列表查詢",
  entryRule: "[待補，例：全場實名制 / 票券綁定，依各場次售票平台公告為準]",
  ticketPrices: [],
  ticketVendor: "[各場次售票平台待補]",
  ticketUrl: "",
  officialSiteUrl: "https://www.ygfamily.com/",
  seatMapImage: "",
  seatMapNote: "座位配置圖尚未提供，請將圖片放入 images/ 資料夾並在 data.js 的 seatMapImage 填入路徑。",
  transport: {
    mrt: ["[待補，例：搭乘 XX 線至 OO 站，OO 號出口出站即達]"],
    bus: ["[待補，公車站名與路線]"],
    driving: [
      "活動日周邊車流與停車需求高，建議不要把開車作為首選。",
      "若需開車，請先查看場館官方停車與交通公告；場館車位有限，停車不等於保證入場。",
      "散場時請依工作人員與交通管制指示離場，避免在場館周邊久候。",
    ],
  },

  // 會員／專屬企劃（例如 V.I.P 會員特典、場館限定周邊等），非必填
  membership: {
    name: "[會員企劃名稱待補，例：V.I.P MEMBERSHIP]",
    perkTitle: "[場館限定特典名稱待補]",
    description: "[待補：特典內容、對象、領取方式]",
    officialUrl: "",
  },

  // 應援禮儀文案是通用內容，先寫好可以直接用，之後想改語氣再調整就好
  etiquette: {
    intro: "不知道應援口號也沒關係。應援不是義務。這份指南整理的是「知道後會更有趣的事」，不是必須背熟的作業。安靜站著欣賞也很棒。",
    firstTime: [
      "不用全部跟著做。只要在熟悉的歌曲、熟悉的段落一起應援，就能玩得很開心。",
      "不會韓文也沒關係，很多應援口號是重複的音節或英文詞，記住發音就可以跟上。",
      "本指南的動作全部都是徒手完成，不需要另外準備應援物品。",
      "晚一拍跟著周圍的人做也完全不奇怪。",
      "場館內網路訊號可能不穩。請在家先開啟一次這個頁面，歌詞會儲存在手機裡，沒有網路也能查看。",
    ],
    together: [
      "禁止拍攝、錄音、錄影。若有允許拍攝的段落，現場會另行通知。",
      "演出中請調低手機螢幕亮度。昏暗觀眾席中的亮螢幕，後方觀眾會看得非常清楚。",
      "請避免使用手機閃光燈。舞台演出連燈光完全熄滅的瞬間都經過設計，觀眾席的一道光可能破壞那個畫面。若有全場一起舉燈的安排，演出中會另行通知。",
      "安靜歌曲、原聲樂段請克制口號與歡呼，很多人是來聽歌的。",
      "把手大幅揮過頭頂時，請留意左右與後方觀眾的視線。",
      "演出中的交談與歌曲解說，請留到曲目結束後再分享。",
      "高帽子、蓬鬆髮型可能遮擋後方觀眾視線。",
      "在人潮密集的空間裡，氣味強烈的香水可能讓他人感到不適。",
    ],
    standing: [
      "不要往前推。後方推擠的力量會直接累積到前排。",
      "大包包請放進行李寄放處，放在腳邊可能導致跌倒。",
      "如果周圍有人跌倒，請不要推擠，停下來扶起對方。",
      "入場前先喝水、先上洗手間，因為要站立數小時。",
      "若呼吸急促或頭暈，請不要勉強，告知附近的工作人員。",
    ],
    disclaimer: "本指南由粉絲製作。拍攝、攜入、再次入場等官方規定，以售票平台、場館公告與演出當天現場指示為準。",
  },

  version: "v0.2.0-skeleton",
  githubRepoUrl: "", // [待補] 之後 push 上 GitHub 後填入
  feedbackUrl: "",
  forkFromUrl: "",
};

/*
 * TOUR_STOPS — 全巡演場次清單（依官方主視覺海報建立，2026-09-21 版本）。
 * 首頁只會顯示「還沒過期」的場次（用 dateEnd 判斷，過了那天自動從清單消失），
 * 不需要手動刪除已經辦完的場次。
 *
 * 欄位說明：
 *   dateLabel  畫面上顯示的日期文字
 *   dateEnd    這場次最後一天，格式 "YYYY-MM-DD"，用來判斷是否已經過期（過期會自動隱藏）
 *   showAdded  是否顯示「SHOW ADDED」加場標籤（跟海報上一致）
 */
const TOUR_STOPS = [
  { id: "goyang", city: "GOYANG", cityZh: "高陽", venue: "GOYANG STADIUM", dateLabel: "08.21 FRI - 23.SUN", dateEnd: "2026-08-23", showAdded: false },
  { id: "oakland", city: "OAKLAND", cityZh: "奧克蘭", venue: "OAKLAND-ALAMEDA COUNTY COLISEUM", dateLabel: "09.04 FRI - 05.SAT", dateEnd: "2026-09-05", showAdded: true },
  { id: "east-rutherford", city: "EAST RUTHERFORD", cityZh: "東拉塞福", venue: "METLIFE STADIUM", dateLabel: "09.11 FRI", dateEnd: "2026-09-11", showAdded: false },
  { id: "paris", city: "PARIS", cityZh: "巴黎", venue: "STADE DE FRANCE", dateLabel: "09.19 SAT", dateEnd: "2026-09-19", showAdded: false },
  { id: "london", city: "LONDON", cityZh: "倫敦", venue: "TOTTENHAM HOTSPUR STADIUM", dateLabel: "09.26 SAT", dateEnd: "2026-09-26", showAdded: false },
  { id: "taipei", city: "TAIPEI", cityZh: "台北", venue: "TAIPEI DOME", dateLabel: "10.09 FRI - 11.SUN", dateEnd: "2026-10-11", showAdded: true },
  { id: "singapore", city: "SINGAPORE", cityZh: "新加坡", venue: "SINGAPORE NATIONAL STADIUM", dateLabel: "10.17 SAT", dateEnd: "2026-10-17", showAdded: false },
  { id: "hanoi", city: "HANOI", cityZh: "河內", venue: "MY DINH NATIONAL STADIUM", dateLabel: "10.24 SAT - 25.SUN", dateEnd: "2026-10-25", showAdded: false },
  { id: "sydney", city: "SYDNEY", cityZh: "雪梨", venue: "ACCOR STADIUM", dateLabel: "10.31 SAT", dateEnd: "2026-10-31", showAdded: false },
  { id: "bangkok", city: "BANGKOK", cityZh: "曼谷", venue: "RAJAMANGALA NATIONAL STADIUM", dateLabel: "11.07 SAT", dateEnd: "2026-11-07", showAdded: false },
  { id: "hong-kong", city: "HONG KONG", cityZh: "香港", venue: "KAI TAK STADIUM", dateLabel: "11.13 FRI - 15.SUN", dateEnd: "2026-11-15", showAdded: false },
  { id: "osaka", city: "OSAKA", cityZh: "大阪", venue: "KYOCERA DOME OSAKA", dateLabel: "11.27 FRI - 29.SUN", dateEnd: "2026-11-29", showAdded: false },
  { id: "nagoya", city: "NAGOYA", cityZh: "名古屋", venue: "VANTELIN DOME NAGOYA", dateLabel: "12.05 SAT - 06.SUN", dateEnd: "2026-12-06", showAdded: false },
  { id: "tokyo", city: "TOKYO", cityZh: "東京", venue: "TOKYO DOME", dateLabel: "12.13 SUN - 15.TUE", dateEnd: "2026-12-15", showAdded: false },
  { id: "fukuoka", city: "FUKUOKA", cityZh: "福岡", venue: "MIZUHO PAYPAY DOME FUKUOKA", dateLabel: "12.26 SAT - 27.SUN", dateEnd: "2026-12-27", showAdded: false },
  { id: "kuala-lumpur", city: "KUALA LUMPUR", cityZh: "吉隆坡", venue: "TM STADIUM NASIONAL", dateLabel: "01.09 SAT", dateEnd: "2027-01-09", showAdded: false },
  { id: "jakarta", city: "JAKARTA", cityZh: "雅加達", venue: "JAKARTA INTERNATIONAL STADIUM", dateLabel: "01.16 SAT", dateEnd: "2027-01-16", showAdded: false },
  { id: "manila", city: "MANILA", cityZh: "馬尼拉", venue: "SMDC FESTIVAL GROUNDS", dateLabel: "02.20 SAT", dateEnd: "2027-02-20", showAdded: true },
  { id: "kaohsiung", city: "KAOHSIUNG", cityZh: "高雄", venue: "KAOHSIUNG NATIONAL STADIUM", dateLabel: "02.27 SAT - 28.SUN", dateEnd: "2027-02-28", showAdded: false },
];

/*
 * 應援標記類型，對應原本 VAUNDY 指南的「大合唱／拍手／揮手／跳躍／轉臂」。
 * 韓國團體場合常見用語可以改成：떼창(大合唱)／박수(拍手)／손 흔들기(揮手) 等，
 * 這裡先沿用中文標籤方便閱讀，key 不要改（程式邏輯用 key 判斷），label 可以改。
 */
const CHANT_TYPES = {
  call:  { key: "call",  label: "大合唱" },
  cheer: { key: "cheer", label: "應援詞" }, // 喊出來的口號，跟跟著唱的「大合唱」不同
  clap:  { key: "clap",  label: "拍手" },
  wave:  { key: "wave",  label: "揮手" },
  jump:  { key: "jump",  label: "跳躍" },
  twirl: { key: "twirl", label: "轉臂" },
};

/*
 * SONGS：每首歌一筆。lyrics 是逐句歌詞，time 是「距離影片開頭幾秒」，
 * 用來做點擊跳轉與自動高亮。這裡先放 5 首示範曲目、內容全部是占位文字，
 * 不是真實歌詞——正式歌單/口號/時間軸確定後，整批覆蓋這個陣列即可。
 *
 * 欄位說明：
 *   id            唯一代碼，網址會用到（例：#/song/demo-01），建議用羅馬拼音曲名
 *   title         中文/慣用曲名
 *   titleOriginal 原文曲名（韓文）
 *   youtubeId     YouTube 影片 ID（網址 v= 後面那串），留空則畫面顯示「尚未設定影片」
 *   chantTypes    這首歌用到哪些應援類型（給歌曲清單上的標記用）
 *   categories    自訂分類標籤，陣列，名稱完全自訂（例：["安可曲","抒情"]），
 *                 應援指南頁可以用這個多選篩選；不需要分類就留空陣列 []
 *   lyrics[]:
 *     time        秒數（數字）
 *     original    原文歌詞（韓文）
 *     romaji      羅馬拼音（給不會韓文的歌迷跟著唱）
 *     zh          中文翻譯
 *     chant       這句對應的應援類型 key（null 表示這句沒有特別應援動作）
 */
const SONGS = [
  {
    id: "fantastic-baby",
    order: 1,
    title: "FANTASTIC BABY",
    titleOriginal: "",
    youtubeId: "IOXR43u_cqw",
    chantTypes: ["call", "cheer"],
    categories: ["舞曲"], // 分類名稱範例，可自行改成你要的分類
    // 歌詞來源：BIGBANG空耳應援歌詞（N.YDest 空耳／翻譯：大勝鉉愛小志龍），時間點為粗估，待對照影片微調
    lyrics: [
      { time: 3.0, original: "여기 붙어라", romaji: "yeogi buteora", zh: "靠過來這裡吧", chant: null },
      { time: 7.0, original: "모두 모여라", romaji: "modu moyeora", zh: "全都聚集過來吧", chant: null },
      { time: 11.0, original: "WE GON' PARTY LIKE RIRIRILALALA", romaji: "", zh: "WE GON' PARTY LIKE RIRIRILALALA", chant: null },
      { time: 13.2, original: "맘을 열어라", romaji: "mameul yeoleora", zh: "敞開你的心", chant: null },
      { time: 17.2, original: "머릴 비워라", romaji: "meoril biwora", zh: "清除雜念 放空你的腦", chant: null },
      { time: 21.2, original: "불을 지펴라 리리리라라라", romaji: "bureul jipyeora ririllallalla", zh: "點燃心中的火焰 RIRIRILALALA", chant: null },
      { time: 25.2, original: "정답은 묻지 말고 그대로 받아들여 느낌대로 가", romaji: "jeongdabeun mutji malgo geudaero badadeulyeo neukkimdaelo ga", zh: "不要問答案 就只要接受 跟著感覺走吧", chant: null },
      { time: 29.2, original: "ALRIGHT", romaji: "", zh: "ALRIGHT", chant: null },
      { time: 31.4, original: "하늘을 마주하고 두 손을 다 위로", romaji: "haneureul majuhago du soneul da wilo", zh: "對著天空 高舉起你的雙手", chant: null },
      { time: 35.4, original: "저 위로 날뛰고 싶어 OH", romaji: "jeo wilo nalttwigo sipeo OH", zh: "想朝向那高處瘋狂亂跳 OH", chant: null },
      { time: 39.4, original: "NANANANANA NANANANANA", romaji: "", zh: "NANANANANA NANANANANA", chant: "call" },
      { time: 41.6, original: "WOW FANTASTIC BABY", romaji: "", zh: "WOW FANTASTIC BABY", chant: "call" },
      { time: 43.8, original: "DANCE", romaji: "", zh: "DANCE", chant: null },
      { time: 46.0, original: "I WANNA DAN DAN DAN DAN DANCE", romaji: "", zh: "I WANNA DAN DAN DAN DAN DANCE", chant: null },
      { time: 48.2, original: "FANTASTIC BABY", romaji: "", zh: "FANTASTIC BABY", chant: "call" },
      { time: 50.4, original: "DANCE", romaji: "", zh: "DANCE", chant: null },
      { time: 52.6, original: "I WANNA DAN DAN DAN DAN DANCE", romaji: "", zh: "I WANNA DAN DAN DAN DAN DANCE", chant: null },
      { time: 54.8, original: "WOW FANTASTIC BABY", romaji: "", zh: "WOW FANTASTIC BABY", chant: "call" },
      { time: 57.0, original: "이 난장판에 HEY", romaji: "i nanjangpane HEY", zh: "在這場亂仗中 HEY", chant: "call" },
      { time: 61.0, original: "끝판 왕 차례 HEY", romaji: "kkeutpan wang chalye HEY", zh: "最後 該國王登場了 HEY", chant: "call" },
      { time: 65.0, original: "땅을 흔들고 3분으론 불충분한 RACE", romaji: "ttangeul heundeulgo 3buneuron bulchungbunhan RACE", zh: "地板在搖晃 3分鐘 不足夠的RACE", chant: null },
      { time: 69.0, original: "WAIT 분위기는 과열 HUH", romaji: "WAIT bunwigineun gwayeol HUH", zh: "WAIT 氣氛超越沸點 HUH", chant: null },
      { time: 73.0, original: "CATCH ME ON FIRE HUH", romaji: "", zh: "CATCH ME ON FIRE HUH", chant: null },
      { time: 75.2, original: "진짜가 나타났다 NANANANANA", romaji: "jinjjaga natanatda NANANANANA", zh: "主角出現了", chant: "call" },
      { time: 79.2, original: "하나부터 열까지 모든 게 다 한수위(翰數wi)", romaji: "hanabuteo yeolkkaji modeun ge da hansuwi", zh: "從一到十 全都高人一等", chant: "call" },
      { time: 83.2, original: "모래 벌판 위를 미친 듯이 뛰어봐도 거뜬한 우리(翰物理)", romaji: "mole beolpan wireul michin deusi ttwieobwado geotteunhan uri", zh: "即使在廣闊沙地上瘋狂跳躍也一派輕鬆的我們", chant: "call" },
      { time: 87.2, original: "하늘은 충분히(搶本魚-台語) 너무나 푸르니(噗ㄌ你)까", romaji: "haneureun chungbunhi neomuna puleunikka", zh: "因為天空是如此蔚藍", chant: "call" },
      { time: 91.2, original: "아무것도 묻지 말란 말이야 느끼란 말이야 내가 누군지(努估幾)", romaji: "amugeotdo mutji mallan mariya neukkiran mariya naega nugunji", zh: "什麼都別多問 只要去感覺 讓你知道我是誰", chant: "call" },
      { time: 95.2, original: "네 심장소리에 맞게 뛰기 시작해 막이 끝날 때까지 YE", romaji: "ne simjangsolie matge ttwigi sijakhae magi kkeutnal ttaekkaji YE", zh: "跟著你心臟的鼓動聲 開始跳吧 直到派對落幕為止 YE", chant: null },
      { time: 99.2, original: "I CAN'T BABY DON'T' STOP THIS", romaji: "", zh: "I CAN'T BABY DON'T' STOP THIS", chant: null },
      { time: 101.4, original: "오늘은 타락해 (미쳐 발악해) 가는거야", romaji: "oneureun tarakhae (michyeo baraghae) ganeungeoya", zh: "今天就來墮落 (瘋狂掙扎 放肆) 一場吧", chant: null },
      { time: 105.4, original: "WOW FANTASTIC BABY", romaji: "", zh: "WOW FANTASTIC BABY", chant: "call" },
      { time: 107.6, original: "DANCE", romaji: "", zh: "DANCE", chant: null },
      { time: 109.8, original: "I WANNA DAN DAN DAN DAN DANCE", romaji: "", zh: "I WANNA DAN DAN DAN DAN DANCE", chant: null },
      { time: 112.0, original: "FANTASTIC BABY", romaji: "", zh: "FANTASTIC BABY", chant: "call" },
      { time: 114.2, original: "DANCE", romaji: "", zh: "DANCE", chant: null },
      { time: 116.4, original: "I WANNA DAN DAN DAN DAN DANCE", romaji: "", zh: "I WANNA DAN DAN DAN DAN DANCE", chant: null },
      { time: 118.6, original: "WOW FANTASTIC BABY", romaji: "", zh: "WOW FANTASTIC BABY", chant: "call" },
      { time: 120.8, original: "BOOMSHAKALAKA BOOM", romaji: "", zh: "BOOMSHAKALAKA BOOM", chant: "cheer" },
      { time: 123.0, original: "BOOMSHAKALAKA BOOM", romaji: "", zh: "BOOMSHAKALAKA BOOM", chant: "cheer" },
      { time: 125.2, original: "BOOMSHAKALAKA BOOM", romaji: "", zh: "BOOMSHAKALAKA BOOM", chant: "cheer" },
      { time: 127.4, original: "DAN DAN DAN DAN DANCE", romaji: "", zh: "DAN DAN DAN DAN DANCE", chant: null },
      { time: 129.6, original: "BOOMSHAKALAKA BOOM", romaji: "", zh: "BOOMSHAKALAKA BOOM", chant: "cheer" },
      { time: 131.8, original: "BOOMSHAKALAKA BOOM", romaji: "", zh: "BOOMSHAKALAKA BOOM", chant: "cheer" },
      { time: 134.0, original: "BOOMSHAKALAKA BOOM", romaji: "", zh: "BOOMSHAKALAKA BOOM", chant: "cheer" },
      { time: 136.2, original: "DAN DAN DAN DAN DANCE", romaji: "", zh: "DAN DAN DAN DAN DANCE", chant: null },
      { time: 138.4, original: "날 따라 잡아볼 테면 와봐 난 영원한 딴따라", romaji: "nal ttara jababol temyeon wabwa nan yeongwonhan ttanttara", zh: "想學我的話就來試看看吧 我永遠都不同凡響", chant: null },
      { time: 142.4, original: "오늘 밤 금기란 내겐 없어", romaji: "oneul bam geumgiran naegen eopseo", zh: "今夜 對我來說沒有 禁忌", chant: null },
      { time: 146.4, original: "MAMA JUST LET ME BE YOUR LOVER", romaji: "", zh: "MAMA JUST LET ME BE YOUR LOVER", chant: null },
      { time: 148.6, original: "이 혼란 속을 넘어 NANANANANA", romaji: "i honlan sogeul neomeo NANANANANA", zh: "沉浸在這混亂之中", chant: "call" },
      { time: 152.6, original: "머리끝부터 발끝까지 비쥬얼은 쇼크", romaji: "meorikkeutbuteo balkkeutkkaji bijyueoreun syokeu", zh: "從頭到腳 視覺效果都帶來SHOCK", chant: null },
      { time: 156.6, original: "내 감각은 소문난 꾼 앞서가는 촉", romaji: "nae gamgageun somunnan kkun apseoganeun chok", zh: "我的品味是出了名的達人等級 總是領先超前", chant: null },
      { time: 160.6, original: "남들보다는 빠른 걸음", romaji: "namdeulbodaneun ppareun georeum", zh: "比別人更快的腳步", chant: null },
      { time: 164.6, original: "차원이 다른 젊음", romaji: "chawoni dareun jeolmeum", zh: "不同次元的青春", chant: null },
      { time: 168.6, original: "얼음얼음얼음 HOLD UP NANANANANA", romaji: "eoreum eoreum eoreum HOLD UP NANANANANA", zh: "站住 站住 站住 HOLD UP", chant: "call" },
      { time: 172.6, original: "네 심장소리에 맞게 뛰기 시작해 막이 끝날 때까지 YE", romaji: "ne simjangsolie matge ttwigi sijakhae magi kkeutnal ttaekkaji YE", zh: "跟著你心臟的鼓動聲 開始跳吧 直到派對落幕為止 YE", chant: null },
      { time: 176.6, original: "I CAN'T BABY DON'T' STOP THIS", romaji: "", zh: "I CAN'T BABY DON'T' STOP THIS", chant: null },
      { time: 178.8, original: "오늘은 타락해 (미쳐 발악해) 가는거야", romaji: "oneureun tarakhae (michyeo baraghae) ganeungeoya", zh: "今天就來墮落 (瘋狂掙扎 放肆) 一場吧", chant: null },
      { time: 182.8, original: "WOW FANTASTIC BABY", romaji: "", zh: "WOW FANTASTIC BABY", chant: "call" },
      { time: 185.0, original: "DANCE", romaji: "", zh: "DANCE", chant: null },
      { time: 187.2, original: "I WANNA DAN DAN DAN DAN DANCE", romaji: "", zh: "I WANNA DAN DAN DAN DAN DANCE", chant: null },
      { time: 189.4, original: "FANTASTIC BABY", romaji: "", zh: "FANTASTIC BABY", chant: "call" },
      { time: 191.6, original: "DANCE", romaji: "", zh: "DANCE", chant: null },
      { time: 193.8, original: "I WANNA DAN DAN DAN DAN DANCE", romaji: "", zh: "I WANNA DAN DAN DAN DAN DANCE", chant: null },
      { time: 196.0, original: "WOW FANTASTIC BABY", romaji: "", zh: "WOW FANTASTIC BABY", chant: "call" },
      { time: 198.2, original: "BOOMSHAKALAKA BOOM", romaji: "", zh: "BOOMSHAKALAKA BOOM", chant: "cheer" },
      { time: 200.4, original: "BOOMSHAKALAKA BOOM", romaji: "", zh: "BOOMSHAKALAKA BOOM", chant: "cheer" },
      { time: 202.6, original: "BOOMSHAKALAKA BOOM", romaji: "", zh: "BOOMSHAKALAKA BOOM", chant: "cheer" },
      { time: 204.8, original: "DAN DAN DAN DAN DANCE", romaji: "", zh: "DAN DAN DAN DAN DANCE", chant: null },
      { time: 207.0, original: "BOOMSHAKALAKA BOOM", romaji: "", zh: "BOOMSHAKALAKA BOOM", chant: "cheer" },
      { time: 209.2, original: "BOOMSHAKALAKA BOOM", romaji: "", zh: "BOOMSHAKALAKA BOOM", chant: "cheer" },
      { time: 211.4, original: "BOOMSHAKALAKA BOOM", romaji: "", zh: "BOOMSHAKALAKA BOOM", chant: "cheer" },
      { time: 213.6, original: "DAN DAN DAN DAN DANCE", romaji: "", zh: "DAN DAN DAN DAN DANCE", chant: null },
      { time: 215.8, original: "다 같이 놀자 YE YE YE", romaji: "da gachi nolja YE YE YE", zh: "大家一起玩吧", chant: "call" },
      { time: 219.1, original: "다 같이 뛰자 YE YE YE", romaji: "da gachi ttwija YE YE YE", zh: "大家一起跳吧", chant: "call" },
      { time: 222.4, original: "다 같이 돌자 YE YE YE", romaji: "da gachi dolja YE YE YE", zh: "大家一起瘋吧", chant: "call" },
      { time: 225.7, original: "다 같이 가자", romaji: "da gachi gaja", zh: "大家一起走吧", chant: null },
      { time: 228.5, original: "WOW FANTASTIC BABY", romaji: "", zh: "WOW FANTASTIC BABY", chant: "call" },
    ],
  },
  {
    id: "demo-01",
    order: 2,
    title: "示範曲目 01",
    titleOriginal: "(請替換為正式曲名)",
    youtubeId: "",
    chantTypes: ["call", "clap", "wave"],
    categories: ["舞曲"],
    lyrics: [
      { time: 0,  original: "", romaji: "", zh: "（示範歌詞第 1 句，請替換為實際歌詞）", chant: null },
      { time: 6,  original: "", romaji: "", zh: "（示範歌詞第 2 句）", chant: "clap" },
      { time: 12, original: "", romaji: "", zh: "（示範口號 － 大合唱段落）", chant: "call" },
      { time: 18, original: "", romaji: "", zh: "（示範歌詞第 4 句）", chant: "wave" },
      { time: 24, original: "", romaji: "", zh: "（示範口號 － 大合唱段落 2）", chant: "call" },
      { time: 30, original: "", romaji: "", zh: "（示範歌詞第 6 句）", chant: "clap" },
    ],
  },
  {
    id: "demo-02",
    order: 3,
    title: "示範曲目 02",
    titleOriginal: "(請替換為正式曲名)",
    youtubeId: "",
    chantTypes: ["call", "wave", "jump"],
    categories: ["安可曲"],
    lyrics: [
      { time: 0,  original: "", romaji: "", zh: "（示範歌詞第 1 句）", chant: null },
      { time: 5,  original: "", romaji: "", zh: "（示範口號 － 揮手段落）", chant: "wave" },
      { time: 10, original: "", romaji: "", zh: "（示範口號 － 跳躍段落）", chant: "jump" },
      { time: 15, original: "", romaji: "", zh: "（示範口號 － 大合唱副歌）", chant: "call" },
      { time: 20, original: "", romaji: "", zh: "（示範口號 － 大合唱副歌 2）", chant: "call" },
    ],
  },
  {
    id: "demo-03",
    order: 4,
    title: "示範曲目 03（抒情）",
    titleOriginal: "(請替換為正式曲名)",
    youtubeId: "",
    chantTypes: ["clap"],
    categories: ["抒情"],
    lyrics: [
      { time: 0,  original: "", romaji: "", zh: "（示範歌詞第 1 句，抒情曲通常應援較少）", chant: null },
      { time: 8,  original: "", romaji: "", zh: "（示範歌詞第 2 句）", chant: null },
      { time: 16, original: "", romaji: "", zh: "（示範口號 － 輕拍手段落）", chant: "clap" },
    ],
  },
  {
    id: "demo-04",
    order: 5,
    title: "示範曲目 04（安可安靜曲）",
    titleOriginal: "(請替換為正式曲名)",
    youtubeId: "",
    chantTypes: [],
    categories: ["抒情", "安可曲"],
    lyrics: [
      { time: 0, original: "", romaji: "", zh: "（示範歌詞，這首沒有應援動作，安靜聆聽即可）", chant: null },
      { time: 10, original: "", romaji: "", zh: "（示範歌詞第 2 句）", chant: null },
    ],
  },
  {
    id: "demo-05",
    order: 6,
    title: "示範曲目 05（全種類示範）",
    titleOriginal: "(請替換為正式曲名)",
    youtubeId: "",
    chantTypes: ["call", "clap", "wave", "jump", "twirl"],
    categories: [],
    lyrics: [
      { time: 0,  original: "", romaji: "", zh: "（示範歌詞第 1 句）", chant: null },
      { time: 4,  original: "", romaji: "", zh: "（示範口號 － 拍手）", chant: "clap" },
      { time: 8,  original: "", romaji: "", zh: "（示範口號 － 揮手）", chant: "wave" },
      { time: 12, original: "", romaji: "", zh: "（示範口號 － 跳躍）", chant: "jump" },
      { time: 16, original: "", romaji: "", zh: "（示範口號 － 轉臂）", chant: "twirl" },
      { time: 20, original: "", romaji: "", zh: "（示範口號 － 大合唱）", chant: "call" },
    ],
  },
];
