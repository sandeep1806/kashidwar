/**
 * Supplementary map markers that have NO content collection of their own —
 * food streets and the like. Everything else on the Kashi Darshan Map is read
 * straight from the ghats/mandirs collections (see content.config.ts mapFields).
 *
 * Keep this list short; it exists only for places that aren't a ghat or mandir.
 * Localized strings are machine-translated — review with a native speaker.
 */
export type MapMarker = {
  id: string;
  href: string;
  mapX: number;
  mapY: number;
  category: 'food';
  name: { en: string; hi: string; ta: string; te: string };
  descriptor: { en: string; hi: string; ta: string; te: string };
};

export const mapMarkers: MapMarker[] = [
  {
    id: 'kachori-gali',
    href: '/khana/',
    mapX: 555,
    mapY: 285,
    category: 'food',
    name: {
      en: 'Kachori Gali',
      hi: 'कचौड़ी गली',
      ta: 'கச்சோரி கலி',
      te: 'కచోరి గలి',
    },
    descriptor: {
      en: 'The Godowlia lane of kachori-sabzi and jalebi at dawn',
      hi: 'गोदौलिया की गली — सुबह की कचौड़ी-सब्ज़ी और जलेबी',
      ta: 'விடியலில் கச்சோரி-சப்ஜி, ஜிலேபி நிறைந்த கோதௌலியா தெரு',
      te: 'ఉదయాన్నే కచోరి-సబ్జీ, జిలేబీల గోదౌలియా వీధి',
    },
  },
  {
    id: 'blue-lassi-corner',
    href: '/khana/',
    mapX: 835,
    mapY: 300,
    category: 'food',
    name: {
      en: 'Lassi Corner',
      hi: 'लस्सी कॉर्नर',
      ta: 'லஸ்ஸி மூலை',
      te: 'లస్సీ మూల',
    },
    descriptor: {
      en: 'Clay-cup lassi in the lanes behind Manikarnika',
      hi: 'मणिकर्णिका के पीछे की गलियों में कुल्हड़ लस्सी',
      ta: 'மணிகர்ணிகா பின்னணித் தெருக்களில் மண்கப் லஸ்ஸி',
      te: 'మణికర్ణిక వెనుక సందుల్లో మట్టి కప్పు లస్సీ',
    },
  },
];
