export const SUPPORTED_LANGUAGES = [
  {
    id: 'english',
    name: 'English',
    englishName: 'English',
    script: 'Latin',
    fontFamily: "'Lexend', sans-serif",
    flagEmoji: '🔤',
    greeting: 'Hello friend! I am Mitra.',
    subGreeting: "Let's explore the magical world of letters and words together!",
    startAdventure: 'Start Adventure 🚀',
    demoConfusions: [
      { pair: ['b', 'd'], name: 'b vs d (Mirror reversal)' },
      { pair: ['p', 'q'], name: 'p vs q (Vertical inversion)' },
      { pair: ['m', 'w'], name: 'm vs w (Rotational flip)' },
      { pair: ['was', 'saw'], name: 'was vs saw (Order transposition)' }
    ],
    sampleWords: ['cat', 'dog', 'sun', 'star', 'book', 'tree']
  },
  {
    id: 'bengali',
    name: 'বাংলা',
    englishName: 'Bengali',
    script: 'Bengali',
    fontFamily: "'Noto Sans Bengali', sans-serif",
    flagEmoji: '🐯',
    greeting: 'নমস্কার বন্ধু! আমি মিত্র।',
    subGreeting: 'এসো আজ বর্ণের মজার জগতে ঘুরে আসি!',
    startAdventure: 'খেলা শুরু করো 🚀',
    demoConfusions: [
      { pair: ['ব', 'র'], name: 'Ba vs Ra (Dot confusion)' },
      { pair: ['ক', 'ধ'], name: 'Ka vs Dha (Loop confusion)' },
      { pair: ['ড', 'ড়'], name: 'Da vs Rra (Flap distinction)' }
    ],
    sampleWords: ['জল', 'ফুল', 'পাতা', 'কলম', 'বই', 'আকাশ']
  },
  {
    id: 'hindi',
    name: 'हिन्दी',
    englishName: 'Hindi',
    script: 'Devanagari',
    fontFamily: "'Noto Sans Devanagari', sans-serif",
    flagEmoji: '🇮🇳',
    greeting: 'नमस्ते दोस्त! मैं मित्रा हूँ।',
    subGreeting: 'चलो मिलकर अक्षरों और शब्दों की जादुई दुनिया की सैर करें!',
    startAdventure: 'रोमांच शुरू करें 🚀',
    demoConfusions: [
      { pair: ['ब', 'भ'], name: 'ब vs भ (पेट कटी रेखा vs घुंडी)' },
      { pair: ['द', 'ध'], name: 'द vs ध (पूंछ vs घुंडी)' },
      { pair: ['घ', 'ध'], name: 'घ vs ध (शिरोरेखा भेद)' },
      { pair: ['प', 'ष'], name: 'प vs ष (पेट कटी लकीर)' }
    ],
    sampleWords: ['घर', 'कमल', 'जल', 'तारा', 'किताब', 'पेड़']
  }
];

export const AVATARS = [
  { id: 'sheru', name: 'Leo 🦁', emoji: '🦁', color: '#FEF3C7', border: '#F59E0B' },
  { id: 'gaja', name: 'Jumbo 🐘', emoji: '🐘', color: '#E0E7FF', border: '#6366F1' },
  { id: 'mayur', name: 'Peacock 🦚', emoji: '🦚', color: '#D1FAE5', border: '#10B981' },
  { id: 'khargosh', name: 'Bunny 🐰', emoji: '🐰', color: '#FCE7F3', border: '#EC4899' },
  { id: 'titu', name: 'Parrot 🦜', emoji: '🦜', color: '#ECFCCB', border: '#84CC16' },
  { id: 'bhalu', name: 'Teddy 🐻', emoji: '🐻', color: '#FFEDD5', border: '#F97316' },
  { id: 'taara', name: 'Star ⭐', emoji: '⭐', color: '#FEF9C3', border: '#EAB308' },
  { id: 'chiku', name: 'Robo 🤖', emoji: '🤖', color: '#CFFAFE', border: '#06B6D4' }
];

export const GRADES = [
  { id: 'kg', label: 'Kindergarten / KG', age: 'Age 4-5' },
  { id: 'grade1', label: 'Grade 1', age: 'Age 6' },
  { id: 'grade2', label: 'Grade 2', age: 'Age 7' },
  { id: 'grade3', label: 'Grade 3', age: 'Age 8' },
  { id: 'grade4', label: 'Grade 4', age: 'Age 9+' }
];
