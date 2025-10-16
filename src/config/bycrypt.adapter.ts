import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

export const bcryptAdapter = {
  hash: (password: string) => {
    const sal = genSaltSync();
    return hashSync(password, sal);
  },

  compare: (password: string, hashed: string) => {
    return compareSync(password, hashed);
  },
};
