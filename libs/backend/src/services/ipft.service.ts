import fetch from 'node-fetch';

export class IpfsService {
  async get<T>(uri: string): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    try {
      const url = this.uriToHttps(uri);
      if (!url) return {} as T;
      const result: any = await fetch(url, { signal: controller.signal }).then(res => res.json());
      return !result.error ? result : {};
    } catch (error) {
      console.log(uri);
      return {} as T;
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private uriToHttps = (uri: string): string | null => {
    if (!uri) return null;
    const protocol = uri.split(":")[0].toLowerCase();
    switch (protocol) {
      case "https":
        return uri;
      case "http":
        return "https" + uri.substring(4), uri;
      case "ipfs": {
        const hash = uri.replace("ipfs/", "").match(/^ipfs:(\/\/)?(.*)$/i)?.[2];
        return `https://ipfs.io/ipfs/${hash}/`;
      }
      case "ipns": {
        const name = uri.match(/^ipns:(\/\/)?(.*)$/i)?.[2];
        return `https://ipfs.io/ipns/${name}/`;
      }
      default:
        return null;
    }
  };
}

const ipfs = new IpfsService();
export { ipfs };
