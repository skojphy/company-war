# Realtime Server

Reserved for the WebSocket match server.

The SvelteKit app imports pure game rules from `packages/game-core`, so this
folder can later own rooms, player presence, timers, reconnects, and authoritative
move validation without copying board logic.

