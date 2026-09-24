/**
 * The suite's setup: no request leaves the loopback.
 *
 * Every connection opens through one socket method, fetch included, so the
 * method refuses any host but this machine before a socket opens. Code under
 * test that reaches for a real host fails in the test instead of reaching it,
 * and a test that must reach one says so in the open by stubbing it at the seam.
 */

import net from "node:net";

const LOOPBACK = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const GUARDED = Symbol.for("suite.loopback-guard");

type Guarded = typeof net.Socket.prototype & { [GUARDED]?: true };

// The host a connect call names, or null for a local pipe. Node hands the socket
// its arguments either as written or already normalized into one array.
function hostOf(args: unknown[]): string | null {
  const [first, second] = args;
  if (Array.isArray(first)) return hostOf(first);
  if (typeof first === "object" && first !== null) {
    const options = first as { host?: string; path?: string };
    return options.path ? null : (options.host ?? "localhost");
  }
  if (typeof first === "number") return typeof second === "string" ? second : "localhost";
  return null;
}

const socket = net.Socket.prototype as Guarded;
if (!socket[GUARDED]) {
  const connect = socket.connect;
  socket.connect = function (this: net.Socket, ...args: unknown[]) {
    const host = hostOf(args);
    if (host !== null && !LOOPBACK.has(host)) {
      throw new Error(`The suite refused a connection to ${host}; no request leaves the loopback in a test.`);
    }
    return Reflect.apply(connect, this, args);
  } as typeof connect;
  socket[GUARDED] = true;
}
