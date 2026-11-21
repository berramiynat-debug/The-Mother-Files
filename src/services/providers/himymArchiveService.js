import { compareIdentities, namesMatch } from '../normalizers/records.js';
import { tvmazeService } from './tvmazeService.js';
import { himymCharacterService } from './himymCharacterService.js';

export const himymArchiveService = {
  async integrity() {
    const [canon, community] = await Promise.allSettled([tvmazeService.characters(), himymCharacterService.identities()]);
    if (canon.status === 'rejected') throw canon.reason;
    return {
      rows: community.status === 'fulfilled' ? compareIdentities(canon.value, community.value) : [],
      identityHealthy: community.status === 'fulfilled',
      castCount: canon.value.length,
    };
  },
  async evidence() {
    const [cast, episodes, seasons] = await Promise.all([tvmazeService.characters(), tvmazeService.episodes(), tvmazeService.seasons()]);
    return seasons.flatMap((season) => {
      const episode = episodes.find((row) => row.season === season.number && row.number === 1);
      const characters = cast.filter((row) => !/mother|narrator/i.test(row.name));
      const character = characters[(season.number - 1) % characters.length];
      return episode && character ? [{ season, episode, character }] : [];
    });
  },
  identify(identities, name) {
    return identities.find((row) => namesMatch(row.name.split(' (')[0], name));
  },
};
