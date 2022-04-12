import { utils, ethers } from 'ethers';
import { numberHelper } from './number.helper';

export class SaltHelper {
  getSalt(length: number = 15) {
    var result = '';
    const characters = '123456789';
    const charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}

const saltHelper = new SaltHelper();
export { saltHelper };
