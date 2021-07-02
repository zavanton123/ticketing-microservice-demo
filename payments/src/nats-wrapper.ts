import nats, {Stan} from 'node-nats-streaming';

// This is a singleton which is responsible
// for connecting to NATS and providing NATS client
class NatsWrapper {
  private _client?: Stan;

  get client(){
    if(!this._client){
      throw new Error('Cannot access NATS client before connecting!');
    }
    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    // connect to NATS
    this._client = nats.connect(clusterId, clientId, {url});

    // Convert callback-based API to Promise-based API
    return new Promise<void>((resolve, reject) => {
      this.client.on('connect', () => {
        console.log(`zavanton - connected to nats`);
        resolve();
      });

      this.client.on('error', (err) => {
        reject(err);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();
