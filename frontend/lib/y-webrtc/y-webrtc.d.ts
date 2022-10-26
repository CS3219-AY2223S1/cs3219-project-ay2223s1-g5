export class WebrtcConn {
  /**
   * @param {SignalingConn} signalingConn
   * @param {boolean} initiator
   * @param {string} remotePeerId
   * @param {Room} room
   */
  constructor(
    signalingConn: SignalingConn,
    initiator: boolean,
    remotePeerId: string,
    room: Room,
  );
  room: Room;
  remotePeerId: string;
  closed: boolean;
  connected: boolean;
  synced: boolean;
  /**
   * @type {any}
   */
  peer: any;
  destroy(): void;
}
export class Room {
  /**
   * @param {Y.Doc} doc
   * @param {WebrtcProvider} provider
   * @param {string} name
   * @param {CryptoKey|null} key
   */
  constructor(
    doc: Y.Doc,
    provider: WebrtcProvider,
    name: string,
    key: CryptoKey | null,
  );
  /**
   * Do not assume that peerId is unique. This is only meant for sending signaling messages.
   *
   * @type {string}
   */
  peerId: string;
  doc: Y.Doc;
  /**
   * @type {awarenessProtocol.Awareness}
   */
  awareness: awarenessProtocol.Awareness;
  provider: WebrtcProvider;
  synced: boolean;
  name: string;
  key: CryptoKey;
  /**
   * @type {Map<string, WebrtcConn>}
   */
  webrtcConns: Map<string, WebrtcConn>;
  /**
   * @type {Set<string>}
   */
  bcConns: Set<string>;
  mux: import("lib0/mutex").mutex;
  bcconnected: boolean;
  /**
   * @param {ArrayBuffer} data
   */
  _bcSubscriber: (data: ArrayBuffer) => PromiseLike<any>;
  /**
   * Listens to Yjs updates and sends them to remote peers
   *
   * @param {Uint8Array} update
   * @param {any} origin
   */
  _docUpdateHandler: (update: Uint8Array, origin: any) => void;
  /**
   * Listens to Awareness updates and sends them to remote peers
   *
   * @param {any} changed
   * @param {any} origin
   */
  _awarenessUpdateHandler: (
    { added, updated, removed }: any,
    origin: any,
  ) => void;
  _beforeUnloadHandler: () => void;
  connect(): void;
  disconnect(): void;
  destroy(): void;
}
export class SignalingConn extends ws.WebsocketClient {
  constructor(url: any);
  /**
   * @type {Set<WebrtcProvider>}
   */
  providers: Set<WebrtcProvider>;
}
/**
 * @extends Observable<string>
 */
export class WebrtcProvider extends Observable<string> {
  /**
   * @param {string} roomName
   * @param {Y.Doc} doc
   * @param {Object} [opts]
   * @param {Array<string>?} [opts.signaling]
   * @param {string?} [opts.password]
   * @param {awarenessProtocol.Awareness?} [opts.awareness]
   * @param {number?} [opts.maxConns]
   * @param {boolean?} [opts.filterBcConns]
   * @param {any?} [opts.peerOpts]
   */
  constructor(
    roomName: string,
    doc: Y.Doc,
    {
      signaling,
      password,
      awareness,
      maxConns,
      filterBcConns,
      peerOpts,
    }?: {
      signaling: Array<string> | null;
      password: string | null;
      awareness: awarenessProtocol.Awareness | null;
      maxConns: number | null;
      filterBcConns: boolean | null;
      peerOpts: any | null;
    },
  );
  roomName: string;
  doc: Y.Doc;
  filterBcConns: boolean;
  /**
   * @type {awarenessProtocol.Awareness}
   */
  awareness: awarenessProtocol.Awareness;
  shouldConnect: boolean;
  signalingUrls: string[];
  signalingConns: any[];
  maxConns: number;
  peerOpts: any;
  /**
   * @type {PromiseLike<CryptoKey | null>}
   */
  key: PromiseLike<CryptoKey | null>;
  /**
   * @type {Room|null}
   */
  room: Room | null;
  /**
   * @type {boolean}
   */
  get connected(): boolean;
  connect(): void;
  disconnect(): void;
}
import * as Y from "yjs";

import { Observable } from "lib0/observable";
import * as ws from "lib0/websocket";
import * as awarenessProtocol from "y-protocols/awareness";
