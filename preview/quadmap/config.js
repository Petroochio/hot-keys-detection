const QUADS = [
  [{x:71, y:94},{x:135, y:76},{x:141, y:196},{x:76, y:206}],
  [{x:135, y:76},{x:213, y:60},{x:217, y:187},{x:141, y:196}],
  [{x:213, y:60},{x:304, y:43},{x:307, y:177},{x:217, y:187}],
  [{x:304, y:43},{x:409, y:30},{x:410, y:170},{x:307, y:177}],
  [{x:409, y:30},{x:525, y:23},{x:525, y:166},{x:410, y:170}],
  [{x:525, y:23},{x:647, y:20},{x:645, y:165},{x:525, y:166}],
  [{x:647, y:20},{x:770, y:24},{x:766, y:167},{x:645, y:165}],
  [{x:770, y:24},{x:886, y:34},{x:881, y:173},{x:766, y:167}],
  [{x:886, y:34},{x:990, y:48},{x:985, y:181},{x:881, y:173}],
  [{x:990, y:48},{x:1082, y:64},{x:1075, y:190},{x:985, y:181}],
  [{x:1082, y:64},{x:1160, y:81},{x:1153, y:200},{x:1075, y:190}],
  [{x:76, y:206},{x:141, y:196},{x:155, y:313},{x:91, y:316}],
  [{x:141, y:196},{x:217, y:187},{x:230, y:311},{x:155, y:313}],
  [{x:217, y:187},{x:307, y:177},{x:318, y:309},{x:230, y:311}],
  [{x:307, y:177},{x:410, y:170},{x:419, y:307},{x:318, y:309}],
  [{x:410, y:170},{x:525, y:166},{x:528, y:306},{x:419, y:307}],
  [{x:525, y:166},{x:645, y:165},{x:645, y:306},{x:528, y:306}],
  [{x:645, y:165},{x:766, y:167},{x:760, y:307},{x:645, y:306}],
  [{x:766, y:167},{x:881, y:173},{x:871, y:309},{x:760, y:307}],
  [{x:881, y:173},{x:985, y:181},{x:972, y:312},{x:871, y:309}],
  [{x:985, y:181},{x:1075, y:190},{x:1061, y:314},{x:972, y:312}],
  [{x:1075, y:190},{x:1153, y:200},{x:1137, y:317},{x:1061, y:314}],
  [{x:91, y:316},{x:155, y:313},{x:176, y:423},{x:113, y:419}],
  [{x:155, y:313},{x:230, y:311},{x:250, y:426},{x:176, y:423}],
  [{x:230, y:311},{x:318, y:309},{x:335, y:430},{x:250, y:426}],
  [{x:318, y:309},{x:419, y:307},{x:431, y:432},{x:335, y:430}],
  [{x:419, y:307},{x:528, y:306},{x:535, y:435},{x:431, y:432}],
  [{x:528, y:306},{x:645, y:306},{x:644, y:435},{x:535, y:435}],
  [{x:645, y:306},{x:760, y:307},{x:754, y:435},{x:644, y:435}],
  [{x:760, y:307},{x:871, y:309},{x:858, y:434},{x:754, y:435}],
  [{x:871, y:309},{x:972, y:312},{x:955, y:433},{x:858, y:434}],
  [{x:972, y:312},{x:1061, y:314},{x:1041, y:429},{x:955, y:433}],
  [{x:1061, y:314},{x:1137, y:317},{x:1116, y:426},{x:1041, y:429}],
  [{x:113, y:419},{x:176, y:423},{x:201, y:522},{x:139, y:514}],
  [{x:176, y:423},{x:250, y:426},{x:273, y:530},{x:201, y:522}],
  [{x:250, y:426},{x:335, y:430},{x:354, y:537},{x:273, y:530}],
  [{x:335, y:430},{x:431, y:432},{x:445, y:541},{x:354, y:537}],
  [{x:431, y:432},{x:535, y:435},{x:542, y:545},{x:445, y:541}],
  [{x:535, y:435},{x:644, y:435},{x:645, y:546},{x:542, y:545}],
  [{x:644, y:435},{x:754, y:435},{x:746, y:546},{x:645, y:546}],
  [{x:754, y:435},{x:858, y:434},{x:844, y:542},{x:746, y:546}],
  [{x:858, y:434},{x:955, y:433},{x:935, y:538},{x:844, y:542}],
  [{x:955, y:433},{x:1041, y:429},{x:1018, y:531},{x:935, y:538}],
  [{x:1041, y:429},{x:1116, y:426},{x:1090, y:523},{x:1018, y:531}],
  [{x:139, y:514},{x:201, y:522},{x:228, y:607},{x:167, y:597}],
  [{x:201, y:522},{x:273, y:530},{x:298, y:617},{x:228, y:607}],
  [{x:273, y:530},{x:354, y:537},{x:376, y:626},{x:298, y:617}],
  [{x:354, y:537},{x:445, y:541},{x:461, y:632},{x:376, y:626}],
  [{x:445, y:541},{x:542, y:545},{x:551, y:637},{x:461, y:632}],
  [{x:542, y:545},{x:645, y:546},{x:644, y:638},{x:551, y:637}],
  [{x:645, y:546},{x:746, y:546},{x:738, y:637},{x:644, y:638}],
  [{x:746, y:546},{x:844, y:542},{x:829, y:633},{x:738, y:637}],
  [{x:844, y:542},{x:935, y:538},{x:914, y:626},{x:829, y:633}],
  [{x:935, y:538},{x:1018, y:531},{x:992, y:619},{x:914, y:626}],
  [{x:1018, y:531},{x:1090, y:523},{x:1063, y:608},{x:992, y:619}],
  [{x:167, y:597},{x:228, y:607},{x:257, y:680},{x:196, y:668}],
  [{x:228, y:607},{x:298, y:617},{x:323, y:691},{x:257, y:680}],
  [{x:298, y:617},{x:376, y:626},{x:397, y:700},{x:323, y:691}],
  [{x:376, y:626},{x:461, y:632},{x:476, y:707},{x:397, y:700}],
  [{x:461, y:632},{x:551, y:637},{x:559, y:712},{x:476, y:707}],
  [{x:551, y:637},{x:644, y:638},{x:645, y:713},{x:559, y:712}],
  [{x:644, y:638},{x:738, y:637},{x:731, y:712},{x:645, y:713}],
  [{x:738, y:637},{x:829, y:633},{x:814, y:707},{x:731, y:712}],
  [{x:829, y:633},{x:914, y:626},{x:893, y:701},{x:814, y:707}],
  [{x:914, y:626},{x:992, y:619},{x:968, y:692},{x:893, y:701}],
  [{x:992, y:619},{x:1063, y:608},{x:1035, y:681},{x:968, y:692}],
];

const CELLS = [
  [{x:31, y:698},{x:121, y:698},{x:121, y:588},{x:31, y:588}],
  [{x:121, y:698},{x:211, y:698},{x:211, y:588},{x:121, y:588}],
  [{x:211, y:698},{x:301, y:698},{x:301, y:588},{x:211, y:588}],
  [{x:301, y:698},{x:391, y:698},{x:391, y:588},{x:301, y:588}],
  [{x:391, y:698},{x:481, y:698},{x:481, y:588},{x:391, y:588}],
  [{x:481, y:698},{x:571, y:698},{x:571, y:588},{x:481, y:588}],
  [{x:571, y:698},{x:661, y:698},{x:661, y:588},{x:571, y:588}],
  [{x:661, y:698},{x:751, y:698},{x:751, y:588},{x:661, y:588}],
  [{x:751, y:698},{x:841, y:698},{x:841, y:588},{x:751, y:588}],
  [{x:841, y:698},{x:931, y:698},{x:931, y:588},{x:841, y:588}],
  [{x:931, y:698},{x:1021, y:698},{x:1021, y:588},{x:931, y:588}],
  [{x:31, y:588},{x:121, y:588},{x:121, y:478},{x:31, y:478}],
  [{x:121, y:588},{x:211, y:588},{x:211, y:478},{x:121, y:478}],
  [{x:211, y:588},{x:301, y:588},{x:301, y:478},{x:211, y:478}],
  [{x:301, y:588},{x:391, y:588},{x:391, y:478},{x:301, y:478}],
  [{x:391, y:588},{x:481, y:588},{x:481, y:478},{x:391, y:478}],
  [{x:481, y:588},{x:571, y:588},{x:571, y:478},{x:481, y:478}],
  [{x:571, y:588},{x:661, y:588},{x:661, y:478},{x:571, y:478}],
  [{x:661, y:588},{x:751, y:588},{x:751, y:478},{x:661, y:478}],
  [{x:751, y:588},{x:841, y:588},{x:841, y:478},{x:751, y:478}],
  [{x:841, y:588},{x:931, y:588},{x:931, y:478},{x:841, y:478}],
  [{x:931, y:588},{x:1021, y:588},{x:1021, y:478},{x:931, y:478}],
  [{x:31, y:478},{x:121, y:478},{x:121, y:368},{x:31, y:368}],
  [{x:121, y:478},{x:211, y:478},{x:211, y:368},{x:121, y:368}],
  [{x:211, y:478},{x:301, y:478},{x:301, y:368},{x:211, y:368}],
  [{x:301, y:478},{x:391, y:478},{x:391, y:368},{x:301, y:368}],
  [{x:391, y:478},{x:481, y:478},{x:481, y:368},{x:391, y:368}],
  [{x:481, y:478},{x:571, y:478},{x:571, y:368},{x:481, y:368}],
  [{x:571, y:478},{x:661, y:478},{x:661, y:368},{x:571, y:368}],
  [{x:661, y:478},{x:751, y:478},{x:751, y:368},{x:661, y:368}],
  [{x:751, y:478},{x:841, y:478},{x:841, y:368},{x:751, y:368}],
  [{x:841, y:478},{x:931, y:478},{x:931, y:368},{x:841, y:368}],
  [{x:931, y:478},{x:1021, y:478},{x:1021, y:368},{x:931, y:368}],
  [{x:31, y:368},{x:121, y:368},{x:121, y:258},{x:31, y:258}],
  [{x:121, y:368},{x:211, y:368},{x:211, y:258},{x:121, y:258}],
  [{x:211, y:368},{x:301, y:368},{x:301, y:258},{x:211, y:258}],
  [{x:301, y:368},{x:391, y:368},{x:391, y:258},{x:301, y:258}],
  [{x:391, y:368},{x:481, y:368},{x:481, y:258},{x:391, y:258}],
  [{x:481, y:368},{x:571, y:368},{x:571, y:258},{x:481, y:258}],
  [{x:571, y:368},{x:661, y:368},{x:661, y:258},{x:571, y:258}],
  [{x:661, y:368},{x:751, y:368},{x:751, y:258},{x:661, y:258}],
  [{x:751, y:368},{x:841, y:368},{x:841, y:258},{x:751, y:258}],
  [{x:841, y:368},{x:931, y:368},{x:931, y:258},{x:841, y:258}],
  [{x:931, y:368},{x:1021, y:368},{x:1021, y:258},{x:931, y:258}],
  [{x:31, y:258},{x:121, y:258},{x:121, y:148},{x:31, y:148}],
  [{x:121, y:258},{x:211, y:258},{x:211, y:148},{x:121, y:148}],
  [{x:211, y:258},{x:301, y:258},{x:301, y:148},{x:211, y:148}],
  [{x:301, y:258},{x:391, y:258},{x:391, y:148},{x:301, y:148}],
  [{x:391, y:258},{x:481, y:258},{x:481, y:148},{x:391, y:148}],
  [{x:481, y:258},{x:571, y:258},{x:571, y:148},{x:481, y:148}],
  [{x:571, y:258},{x:661, y:258},{x:661, y:148},{x:571, y:148}],
  [{x:661, y:258},{x:751, y:258},{x:751, y:148},{x:661, y:148}],
  [{x:751, y:258},{x:841, y:258},{x:841, y:148},{x:751, y:148}],
  [{x:841, y:258},{x:931, y:258},{x:931, y:148},{x:841, y:148}],
  [{x:931, y:258},{x:1021, y:258},{x:1021, y:148},{x:931, y:148}],
  [{x:31, y:148},{x:121, y:148},{x:121, y:38},{x:31, y:38}],
  [{x:121, y:148},{x:211, y:148},{x:211, y:38},{x:121, y:38}],
  [{x:211, y:148},{x:301, y:148},{x:301, y:38},{x:211, y:38}],
  [{x:301, y:148},{x:391, y:148},{x:391, y:38},{x:301, y:38}],
  [{x:391, y:148},{x:481, y:148},{x:481, y:38},{x:391, y:38}],
  [{x:481, y:148},{x:571, y:148},{x:571, y:38},{x:481, y:38}],
  [{x:571, y:148},{x:661, y:148},{x:661, y:38},{x:571, y:38}],
  [{x:661, y:148},{x:751, y:148},{x:751, y:38},{x:661, y:38}],
  [{x:751, y:148},{x:841, y:148},{x:841, y:38},{x:751, y:38}],
  [{x:841, y:148},{x:931, y:148},{x:931, y:38},{x:841, y:38}],
  [{x:931, y:148},{x:1021, y:148},{x:1021, y:38},{x:931, y:38}],
];

const CELLS_SIMPLE = CELLS.map(c => ({
  corner: c[0],
  w: c[2].x - c[0].x,
  h: c[2].y - c[0].y,
}));
